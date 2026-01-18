from __future__ import annotations

import logging
from decimal import Decimal

from django.db import transaction, models
from django.db.models import F


from retail.facades.paypal_facade import PayPalFacade
from retail.facades.stripe_facade import StripePaymentFacade
from retail.models import (
    Bundle,
    Coupon,
    Order,
    OrderItem,
    Payment,
    Product,
    ProductVariant,
)
from retail.services.order_builder import build_order_items_from_payload
from retail.utils.deplete_stock import _deplete_stock_for_order
from retail.utils.slack_notifications import send_slack_message

logger = logging.getLogger(__name__)


class PaymentService:
    """
    Clean service layer:
      - Checkout (Stripe / PayPal) creates an Order + OrderItems (priced snapshot),
        validates basics, computes totals, creates provider order/intent, creates Payment row.
      - Webhooks/capture mark payment succeeded and then reserve/deplete stock exactly once.
    """

    MONEY_2DP = Decimal("0.01")

    # ---------------------------
    # ✅ PUBLIC API (CHECKOUT)
    # ---------------------------
    @staticmethod
    @transaction.atomic
    def create_order_and_payment(
        *,
        user=None,
        items: list[dict],
        email: str,
        first_name: str,
        last_name: str,
        phone: str = "",
        currency: str = "GBP",
        delivery_method: str = "standard",
        coupon_code: str | None = None,
    ) -> dict:
        """
        Stripe checkout:
          1) Validate request
          2) Create order shell
          3) Build order items (including snapshot price)
          4) Validate availability (light validation; real reservation happens on webhook)
          5) Apply coupon + delivery
          6) Create Stripe PaymentIntent
          7) Create Payment row
        """
        PaymentService._validate_checkout_payload(items=items, require_email=True, email=email)

        order = PaymentService._create_order_shell(
            user=user,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            delivery_method=delivery_method,
        )

        # Creates OrderItem rows. Your builder MUST set OrderItem.price (non-null).
        build_order_items_from_payload(order, items)

        # Optional: quick availability check (avoid obvious failures before charging)
        PaymentService._precheck_availability(order)

        # Compute total + apply coupon and save to order
        PaymentService._apply_totals_and_coupon(order, coupon_code=coupon_code)

        # Create Stripe intent (in smallest currency unit)
        amount_in_pence = PaymentService._to_minor_units(order.total_price)
        intent = StripePaymentFacade.create_payment_intent(
            amount=amount_in_pence,
            currency=currency.lower(),
        )

        payment = Payment.objects.create(
            order=order,
            stripe_payment_intent=intent.get("id"),
            amount=order.total_price,
            currency=currency.upper(),
            status="pending",
            payment_method="stripe",
        )

        send_slack_message(
            f"🛒 Order #{order.id} created (Stripe pending) — "
            f"{order.first_name} {order.last_name}, £{order.total_price:.2f}."
            f"{' Coupon: ' + coupon_code if coupon_code else ''}"
        )

        logger.info("Stripe checkout created order_id=%s payment_id=%s", order.id, payment.id)

        return {
            "order_id": order.public_id,
            "payment_id": payment.id,
            "clientSecret": intent.get("client_secret"),
            "amount": amount_in_pence,
            "currency": currency.upper(),
            "delivery_fee": float(order.delivery_fee or 0),
            "grand_total": float(order.total_price),
        }

    @staticmethod
    @transaction.atomic
    def create_paypal_order(
        user=None,
        items: list[dict] | None = None,
        email: str | None = None,
        first_name: str | None = None,
        last_name: str | None = None,
        phone: str = "",
        currency: str = "GBP",
        delivery_method: str = "standard",
        coupon_code: str | None = None,
    ) -> dict:
        """
        PayPal checkout:
          - Email is optional (PayPal will provide it at capture)
          - No Stripe PaymentIntent is created
        """
        items = items or []
        PaymentService._validate_checkout_payload(items=items, require_email=False, email=email)

        order = PaymentService._create_order_shell(
            user=user,
            email=email,  # may be None
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            delivery_method=delivery_method,
        )

        build_order_items_from_payload(order, items)
        PaymentService._precheck_availability(order)
        PaymentService._apply_totals_and_coupon(order, coupon_code=coupon_code)

        paypal_order = PayPalFacade.create_order(order.total_price, currency)
        paypal_order_id = paypal_order["id"]

        payment = Payment.objects.create(
            order=order,
            payment_method="paypal",
            # Reusing this field as provider id. Rename later if you can.
            stripe_payment_intent=paypal_order_id,
            status="pending",
            amount=order.total_price,
            currency=currency.upper(),
        )

        logger.info("PayPal checkout created order_id=%s paypal_order_id=%s", order.id, paypal_order_id)

        return {
            "order_id": order.id,
            "paypal_order_id": paypal_order_id,
            "approval_url": next(
                (link["href"] for link in paypal_order.get("links", []) if link.get("rel") == "approve"),
                None,
            ),
        }

    # ---------------------------
    # ✅ PUBLIC API (PAYMENT FINALIZATION)
    # ---------------------------
    @staticmethod
    @transaction.atomic
    def mark_payment_succeeded(intent: dict) -> None:
        """
        Stripe webhook: payment_intent.succeeded
        Reserve/deplete stock once here.
        """
        from retail.models import CouponUsage
        from users.services.SendEmail import send_payment_success_email

        intent_id = intent.get("id")
        if not intent_id:
            logger.error("Stripe succeeded called without intent id")
            return

        try:
            payment = Payment.objects.select_related("order").get(stripe_payment_intent=intent_id)
        except Payment.DoesNotExist:
            logger.exception("Payment with Stripe intent %s does not exist", intent_id)
            return

        payment.status = "succeeded"
        # Use method types if present
        pm_types = intent.get("payment_method_types") or []
        payment.payment_method = pm_types[0] if pm_types else payment.payment_method or "stripe"
        payment.save(update_fields=["status", "payment_method"])

        order = payment.order

        ok, errs = PaymentService._reserve_stock_or_hold(order, channel="Stripe")
        if not ok:
            return

        order.status = "processing"
        order.save(update_fields=["status"])

        if order.coupon and order.email:
            CouponUsage.objects.get_or_create(coupon=order.coupon, email=order.email)

        send_slack_message(
            f"✅ Stripe payment succeeded & stock reserved — Order #{order.id} "
            f"({order.first_name} {order.last_name}, £{payment.amount:.2f})."
        )

        # Email customer (best-effort)
        if order.email:
            try:
                items_payload = PaymentService._email_items_payload(order)
                send_payment_success_email(
                    to_email=order.email,
                    first_name=order.first_name or "",
                    order_id=order.public_id,
                    amount=payment.amount,
                    items=items_payload,
                    payment_method=payment.payment_method,
                    coupon_code=order.coupon.code if order.coupon else None,
                )
            except Exception as e:
                logger.exception("Failed to send Stripe success email for Order #%s: %s", order.id, e)
                send_slack_message(f"⚠️ Failed to send Stripe payment email for Order #{order.id}: {e}")

    @staticmethod
    @transaction.atomic
    def mark_paypal_payment_succeeded(paypal_order_id: str) -> None:
        """
        Called after PayPal capture succeeds.
        """
        from retail.models import CouponUsage
        from users.services.SendEmail import send_payment_success_email

        try:
            payment = Payment.objects.select_related("order").get(stripe_payment_intent=paypal_order_id)
        except Payment.DoesNotExist:
            logger.exception("Payment with PayPal order ID %s does not exist", paypal_order_id)
            return

        payment.status = "succeeded"
        payment.payment_method = "paypal"
        payment.save(update_fields=["status", "payment_method"])

        order = payment.order

        ok, errs = PaymentService._reserve_stock_or_hold(order, channel="PayPal")
        if not ok:
            return

        order.status = "processing"
        order.save(update_fields=["status"])

        if order.coupon and order.email:
            CouponUsage.objects.get_or_create(coupon=order.coupon, email=order.email)

        send_slack_message(
            f"✅ PayPal payment succeeded & stock reserved — Order #{order.id} "
            f"({order.first_name} {order.last_name}, £{payment.amount:.2f})."
        )

        if order.email:
            try:
                items_payload = PaymentService._email_items_payload(order)
                send_payment_success_email(
                    to_email=order.email,
                    first_name=order.first_name or "",
                    order_id=order.public_id,
                    amount=payment.amount,
                    items=items_payload,
                    payment_method="PayPal",
                    coupon_code=order.coupon.code if order.coupon else None,
                )
            except Exception as e:
                logger.exception("Failed to send PayPal success email for Order #%s: %s", order.id, e)
                send_slack_message(f"⚠️ Failed to send PayPal payment email for Order #{order.id}: {e}")

    @staticmethod
    @transaction.atomic
    def mark_payment_failed(intent: dict) -> None:
        """
        Stripe webhook: payment_intent.payment_failed, etc.
        """
        intent_id = intent.get("id")
        if not intent_id:
            return

        try:
            payment = Payment.objects.select_related("order").get(stripe_payment_intent=intent_id)
        except Payment.DoesNotExist:
            logger.exception("Payment with Stripe intent %s does not exist", intent_id)
            return

        payment.status = "failed"
        payment.save(update_fields=["status"])

        order = payment.order
        order.status = "pending"
        order.save(update_fields=["status"])

        send_slack_message(
            f"❌ Payment failed — Order #{order.id} ({order.first_name} {order.last_name}, £{payment.amount:.2f})."
        )

    # ---------------------------
    # 🔒 INTERNAL HELPERS
    # ---------------------------
    @staticmethod
    def _validate_checkout_payload(*, items: list[dict], require_email: bool, email: str | None) -> None:
        if not items:
            raise ValueError("No items provided.")
        if require_email and not email:
            raise ValueError("Email is required for checkout.")

        # Basic per-line validation
        for item in items:
            qty = int(item.get("quantity", 1))
            if qty < 1:
                raise ValueError("Quantity must be at least 1.")
            t = item.get("type")
            if t not in ("product", "bundle"):
                raise ValueError("Invalid item type.")
            if t == "product" and not item.get("product_id"):
                raise ValueError("Missing product_id for product item.")
            if t == "bundle" and not item.get("bundle_id"):
                raise ValueError("Missing bundle_id for bundle item.")

    @staticmethod
    def _create_order_shell(
        *,
        user,
        email: str | None,
        first_name: str | None,
        last_name: str | None,
        phone: str,
        delivery_method: str,
    ) -> Order:
        # Ensure your Order.email allows null/blank for PayPal flows
        order = Order.objects.create(
            user=user,
            email=email,
            first_name=first_name or "",
            last_name=last_name or "",
            phone=phone or "",
            delivery_method=delivery_method,
            total_price=Decimal("0.00"),
        )
        return order

    @staticmethod
    def _precheck_availability(order: Order) -> None:
        """
        Pre-check stock before charging:
        1) Check bundle.max_available against TOTAL kits requested
        2) Check underlying COMPONENT stock inside each bundle
        3) Check standalone products/variants
        This mirrors the logic used later for final depletion.
        """

        # -------------------------------------------------------
        # 1) CHECK BUNDLE QUANTITY AS A GROUP
        # -------------------------------------------------------

        bundle_ids = (
            order.items
            .filter(bundle_id__isnull=False)
            .values_list("bundle_id", flat=True)
            .distinct()
        )

        for bundle_id in bundle_ids:
            bundle = Bundle.objects.select_for_update().get(id=bundle_id)

            total_requested = (
                order.items
                .filter(bundle_id=bundle_id)
                .aggregate(total=models.Sum("quantity"))["total"] or 0
            )

            logger.info(
                "[Precheck] Bundle %s requested=%s, max_available=%s",
                bundle.name, total_requested, bundle.max_available
            )

            if total_requested > bundle.max_available:
                raise ValueError(
                    f"Not enough stock for bundle {bundle.name} "
                    f"(requested {total_requested}, available {bundle.max_available})"
                )

        # -------------------------------------------------------
        # 2) CHECK COMPONENT STOCK INSIDE EACH BUNDLE
        # -------------------------------------------------------

        for bundle_id in bundle_ids:
            bundle = (
                Bundle.objects
                .select_for_update()
                .prefetch_related("items__product")
                .get(id=bundle_id)
            )

            # Total kits requested for this bundle
            total_kits = (
                order.items
                .filter(bundle_id=bundle_id)
                .aggregate(total=models.Sum("quantity"))["total"] or 0
            )

            logger.info(
                "[Precheck] Checking components for bundle %s (kits=%s)",
                bundle.name, total_kits
            )

            for bundle_item in bundle.items.all():
                product = bundle_item.product
                required_qty = bundle_item.quantity * total_kits

                logger.info(
                    "[Precheck] Bundle component %s needs %s units",
                    product.name, required_qty
                )

                # If this product tracks stock globally
                if product.stock is not None:
                    if product.stock < required_qty:
                        raise ValueError(
                            f"Bundle component shortage: {product.name} "
                            f"(need {required_qty}, have {product.stock})"
                        )

        # -------------------------------------------------------
        # 3) CHECK STANDALONE PRODUCTS / VARIANTS
        # -------------------------------------------------------

        for item in order.items.select_related("product", "bundle"):

            # Skip bundles here (already checked above)
            if item.bundle_id:
                continue

            qty = int(item.quantity)

            # ---- Variant product ----
            if item.colour:
                try:
                    variant = ProductVariant.objects.select_for_update().get(
                        product_id=item.product_id,
                        colour__iexact=item.colour,
                    )
                except ProductVariant.DoesNotExist:
                    raise ValueError(f"Variant missing for item {item.id}")

                logger.info(
                    "[Precheck] Variant %s (%s): need=%s, have=%s",
                    item.product.name,
                    item.colour,
                    qty,
                    variant.stock,
                )

                if variant.stock is not None and variant.stock < qty:
                    raise ValueError(
                        f"Insufficient stock for {item.product.name} ({item.colour}) "
                        f"(need {qty}, have {variant.stock})"
                    )

            # ---- Plain product ----
            else:
                product = Product.objects.select_for_update().get(id=item.product_id)

                logger.info(
                    "[Precheck] Product %s: need=%s, have=%s",
                    product.name,
                    qty,
                    product.stock,
                )

                if product.stock is not None and product.stock < qty:
                    raise ValueError(
                        f"Insufficient stock for {product.name} "
                        f"(need {qty}, have {product.stock})"
                    )

        logger.info("[Precheck] Stock precheck passed for Order #%s", order.id)
    
    @staticmethod
    def _apply_totals_and_coupon(order: Order, *, coupon_code: str | None) -> None:
        """
        Sets order.coupon (if valid), order.discount_percent (if you have it),
        and order.total_price with delivery fee included.
        Assumes OrderItem.price is already populated (snapshot).
        """
        subtotal = Decimal("0.00")
        for item in order.items.all():
            subtotal += (Decimal(item.price) * item.quantity)

        delivery_fee = order.delivery_fee or Decimal("0.00")
        total = subtotal + delivery_fee

        coupon = None
        discount = Decimal("0.00")

        if coupon_code:
            coupon = PaymentService._get_valid_coupon_or_raise(coupon_code)
            discount = (total * Decimal(coupon.discount_percent)) / Decimal("100")
            total = total - discount

            # If you track coupon usage counts at checkout (instead of after success),
            # keep this. If you prefer to count on success, move this elsewhere.
            coupon.usage_count = F("usage_count") + 1
            coupon.save(update_fields=["usage_count"])

        # Persist to order
        if hasattr(order, "coupon"):
            order.coupon = coupon
        if hasattr(order, "discount_percent"):
            # store as decimal fraction if that's what your model uses; otherwise remove
            try:
                order.discount_percent = (Decimal(coupon.discount_percent) / Decimal("100")) if coupon else Decimal("0.00")
            except Exception:
                pass

        order.total_price = total.quantize(PaymentService.MONEY_2DP)
        order.save(update_fields=[f for f in ["total_price", "coupon", "discount_percent"] if hasattr(order, f)])

        logger.info(
            "Totals for order_id=%s subtotal=%s delivery_fee=%s discount=%s grand_total=%s",
            order.id, subtotal, delivery_fee, discount, order.total_price
        )

    @staticmethod
    def _get_valid_coupon_or_raise(code: str) -> Coupon:
        try:
            coupon = Coupon.objects.get(code__iexact=code, is_active=True)
        except Coupon.DoesNotExist:
            raise ValueError("Invalid or expired coupon.")

        if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
            raise ValueError("Coupon usage limit reached.")

        return coupon

    @staticmethod
    def _reserve_stock_or_hold(order: Order, *, channel: str) -> tuple[bool, list[str]]:
        """
        Attempt to deplete/reserve stock. If fails, put order on_hold and notify staff.
        """
        try:
            ok, errs = _deplete_stock_for_order(order)
        except Exception as e:
            logger.exception("%s stock failure for order_id=%s", channel, order.id)
            send_slack_message(f"⚠️ {channel} stock failure (exception) for Order #{order.id}: {e}")
            # Do not raise; keep idempotent/Stripe-safe
            return False, [str(e)]

        if not ok:
            order.status = "on_hold"
            order.save(update_fields=["status"])
            msg = (
                f"⚠️ Stock shortfall for {channel} Order #{order.id} after payment. "
                f"Items: {', '.join(errs)}"
            )
            logger.error(msg)
            send_slack_message(msg)
            return False, errs

        return True, []

    @staticmethod
    def _email_items_payload(order: Order) -> list[dict]:
        """
        Build a safe email payload for line items.
        """
        payload: list[dict] = []
        for i in order.items.select_related("product", "bundle"):
            name = None
            if i.product_id:
                name = i.product.name
                if i.colour:
                    name = f"{name} ({i.colour})"
            elif i.bundle_id:
                name = i.bundle.name
            else:
                name = "Item"

            payload.append(
                {
                    "name": name,
                    "quantity": i.quantity,
                    "price": float(i.price),
                }
            )
        return payload

    @staticmethod
    def _to_minor_units(amount: Decimal) -> int:
        # GBP -> pence
        return int((amount.quantize(PaymentService.MONEY_2DP) * 100).to_integral_value())
