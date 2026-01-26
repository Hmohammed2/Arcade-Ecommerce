from __future__ import annotations

import logging
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from retail.facades.paypal_facade import PayPalFacade
from retail.facades.stripe_facade import StripePaymentFacade
from retail.models import Order, Payment, Coupon
from retail.services.order_builder import build_order_items_from_payload
from retail.utils.deplete_stock import _deplete_stock_for_order
from retail.utils.slack_notifications import send_slack_message
from retail.utils.calculate_weight import calculate_cart_weight
from retail.services.sendcloud_service import SendcloudService
from users.services.SendEmail import send_payment_success_email
from django.conf import settings

logger = logging.getLogger(__name__)


class PaymentService:
    MONEY_2DP = Decimal("0.01")

    # =====================================================
    # 🟢 STRIPE CHECKOUT
    # =====================================================
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
        coupon_code: str | None = None,

        # 🚚 shipping
        shipping_name: str,
        shipping_address1: str,
        shipping_address2: str | None,
        shipping_city: str,
        shipping_postcode: str,
        shipping_country: str,
        shipping_method_id: str,
        shipping_cost: Decimal,
        total_weight_kg: Decimal,
    ) -> dict:

        logger.info(
            "[Checkout] Start | email=%s items=%s ship_method=%s cost=%s weight=%skg",
            email,
            len(items),
            shipping_method_id,
            shipping_cost,
            total_weight_kg,
        )

        PaymentService._validate_checkout_payload(items, email)

        # 🧱 Order shell + SHIPPING DATA (single source of truth)
        order = Order.objects.create(
            user=user,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,

            # 📦 shipping fields
            shipping_name=shipping_name,
            shipping_address1=shipping_address1,
            shipping_address2=shipping_address2 or "",
            shipping_city=shipping_city,
            shipping_postcode=shipping_postcode,
            shipping_country=shipping_country,
            shipping_method_id=shipping_method_id,
            shipping_cost=Decimal(shipping_cost),
            total_weight_kg=Decimal(total_weight_kg),

            total_price=Decimal("0.00"),
        )
        logger.info("[Checkout] Order created | order_id=%s", order.id)

        # 🧾 Line items (price snapshot)
        build_order_items_from_payload(order, items)
        logger.info("[Checkout] Order items created | order_id=%s", order.id)

        # 💰 Totals + coupon
        PaymentService._apply_totals_and_coupon(order, coupon_code)

        logger.info(
            "[Checkout] Totals applied | order_id=%s subtotal+shipping=%s",
            order.id,
            order.total_price,
        )

        # 💳 Stripe intent
        amount_minor = PaymentService._to_minor_units(order.total_price)
        intent = StripePaymentFacade.create_payment_intent(
            amount=amount_minor,
            currency=currency.lower(),
        )

        logger.info(
            "[Checkout] Stripe intent created | order_id=%s intent=%s amount=%s",
            order.id,
            intent.get("id"),
            amount_minor,
        )

        Payment.objects.create(
            order=order,
            stripe_payment_intent=intent["id"],
            amount=order.total_price,
            currency=currency,
            status="pending",
            payment_method="stripe",
        )

        send_slack_message(
            f"🛒 Stripe checkout created — Order #{order.id} (£{order.total_price})"
        )

        return {
            "order_id": str(order.public_id),
            "clientSecret": intent["client_secret"],
            "amount": amount_minor,
            "currency": currency,
        }
    
    # =====================================================
    # 🟢 PAYPAL CHECKOUT
    # =====================================================
    @staticmethod
    @transaction.atomic
    def create_paypal_order(
        *,
        user=None,
        items: list[dict],

        # 👤 customer (email optional for PayPal)
        email: str | None,
        first_name: str,
        last_name: str,
        phone: str = "",

        # 📦 shipping snapshot (REQUIRED)
        shipping_name: str,
        shipping_address1: str,
        shipping_address2: str | None,
        shipping_city: str,
        shipping_postcode: str,
        shipping_country: str,

        # 🚚 shipping selection
        shipping_method_id: str,
        shipping_cost: Decimal,

        # 💸 misc
        currency: str = "GBP",
        coupon_code: str | None = None,
        total_weight_kg: Decimal | None = None,
    ) -> dict:
        """
        PayPal checkout:
        - Creates Order + OrderItems
        - Validates stock
        - Applies shipping + coupon
        - Creates PayPal order
        - Persists Payment row
        """

        logger.info(
            "[Checkout][PayPal] Start | email=%s items=%s ship_method=%s cost=%s",
            email,
            len(items),
            shipping_method_id,
            shipping_cost,
        )

        # -------------------------
        # 1️⃣ Validate payload
        # -------------------------
        PaymentService._validate_checkout_payload(
            items=items,
            require_email=False,
            email=email,
        )

        # -------------------------
        # 2️⃣ Create order shell
        # -------------------------
        order = Order.objects.create(
            user=user,
            email=email,
            first_name=first_name or "",
            last_name=last_name or "",
            phone=phone or "",

            # 📦 shipping snapshot
            shipping_name=shipping_name,
            shipping_address1=shipping_address1,
            shipping_address2=shipping_address2,
            shipping_city=shipping_city,
            shipping_postcode=shipping_postcode,
            shipping_country=shipping_country,

            shipping_method_id=shipping_method_id,
            shipping_cost=Decimal(shipping_cost),
            total_price=Decimal("0.00"),
        )

        logger.info(
            "[Checkout][PayPal] Order created | order_id=%s",
            order.id,
        )

        # -------------------------
        # 3️⃣ Create order items
        # -------------------------
        build_order_items_from_payload(order, items)

        logger.info(
            "[Checkout][PayPal] Order items created | order_id=%s",
            order.id,
        )

        # -------------------------
        # 5️⃣ Calculate weight (server-side)
        # -------------------------
        if total_weight_kg is None:
            total_weight_kg = calculate_cart_weight(items)

        order.total_weight_kg = total_weight_kg
        order.save(update_fields=["total_weight_kg"])

        logger.info(
            "[Checkout][PayPal] Cart weight | order_id=%s weight=%skg",
            order.id,
            order.total_weight_kg,
        )

        # -------------------------
        # 6️⃣ Totals + coupon
        # -------------------------
        PaymentService._apply_totals_and_coupon(
            order,
            coupon_code=coupon_code,
        )

        logger.info(
            "[Checkout][PayPal] Totals applied | order_id=%s total=%s",
            order.id,
            order.total_price,
        )

        # -------------------------
        # 7️⃣ Create PayPal order
        # -------------------------
        paypal_order = PayPalFacade.create_order(
            order.total_price,
            currency,
        )

        paypal_order_id = paypal_order["id"]

        logger.info(
            "[Checkout][PayPal] PayPal order created | order_id=%s paypal_id=%s",
            order.id,
            paypal_order_id,
        )

        # -------------------------
        # 8️⃣ Persist payment row
        # -------------------------
        Payment.objects.create(
            order=order,
            stripe_payment_intent=paypal_order_id,  # reused field
            payment_method="paypal",
            status="pending",
            amount=order.total_price,
            currency=currency.upper(),
        )

        # -------------------------
        # 9️⃣ Return frontend payload
        # -------------------------
        return {
            "order_id": str(order.public_id),
            "paypal_order_id": paypal_order_id,
            "approval_url": next(
                (
                    link["href"]
                    for link in paypal_order.get("links", [])
                    if link.get("rel") == "approve"
                ),
                None,
            ),
        }
        
    # =====================================================
    # 🟢 PAYMENT FINALIZATION
    # =====================================================
    @staticmethod
    @transaction.atomic
    def mark_payment_succeeded(intent: dict) -> None:
        intent_id = intent.get("id")
        if not intent_id:
            logger.error("[Webhook] Stripe succeeded without intent id")
            return

        payment = Payment.objects.select_related("order").get(
            stripe_payment_intent=intent_id
        )

        payment.status = "succeeded"
        payment.save(update_fields=["status"])

        order = payment.order
        logger.info("[Webhook] Stripe payment succeeded | order_id=%s", order.id)

        ok, _ = PaymentService._reserve_stock_or_hold(order)
        if not ok:
            return
        
        order.status = "processing"
        order.save(update_fields=["status"])
        discount_amount = None
        if order.coupon:
            subtotal = sum(i.price * i.quantity for i in order.items.all())
            discount_amount = float(
                (subtotal + order.shipping_cost) - order.total_price
            )
        send_slack_message(f"✅ Stripe paid — Order #{order.id}")
        try:
            send_payment_success_email(
                to_email=order.email,
                first_name=order.first_name,
                order_id=order.public_id,
                amount=float(order.total_price),
                payment_method="card",  # or "paypal"
                delivery_fee=float(order.shipping_cost),
                coupon_code=order.coupon.code if order.coupon else None,
                discount_amount=discount_amount,
                items=[
                    {
                        "title": item.product.name if item.product else item.bundle.name,
                        "quantity": item.quantity,
                        "unit_price": float(item.price),
                        "line_total": float(item.price * item.quantity),
                    }
                    for item in order.items.all()
                ],
            )
            logger.info("[Email] Payment success email sent | order_id=%s", order.id)
        except Exception as e:
            logger.exception(
                "[Email] Payment success email failed | order_id=%s error=%s",
                order.id,
                e,
            )
        # 🚚 Create Sendcloud parcel
        try:
            # 🚚 Create Sendcloud parcel
            parcel = SendcloudService.create_parcel(order)
            order.label_url = parcel.get("label_url")
            order.sendcloud_parcel_id = str(parcel.get("id"))
            order.save(update_fields=["label_url", "sendcloud_parcel_id"])
            logger.info(
                "[Shipping] Sendcloud parcel created | order_id=%s parcel_id=%s",
                order.id,
                parcel.get("id"),
            )
        except Exception as e:
            logger.exception(
                "[Shipping] Sendcloud parcel creation failed | order_id=%s error=%s",
                order.id,
                e,
            )
            send_slack_message(
                f"⚠️ Sendcloud parcel creation failed — Order #{order.id}: {e}"
            )
    # =====================================================
    # 🟢 PAYPAL PAYMENT FINALIZATION
    # =====================================================
    @staticmethod
    @transaction.atomic
    def mark_paypal_payment_succeeded(paypal_capture: dict) -> None:
        """
        Finalises a PayPal payment after successful capture.
        Called explicitly from /paypal/capture/ endpoint.
        """

        paypal_order_id = paypal_capture.get("id")
        if not paypal_order_id:
            logger.error("[PayPal] Capture succeeded without order id")
            return

        try:
            payment = Payment.objects.select_related("order").get(
                stripe_payment_intent=paypal_order_id,
                payment_method="paypal",
            )
        except Payment.DoesNotExist:
            logger.error(
                "[PayPal] No payment found for paypal_order_id=%s",
                paypal_order_id,
            )
            return

        # 🔁 Idempotency guard
        if payment.status == Payment.Status.SUCCEEDED:
            logger.info(
                "[PayPal] Payment already succeeded | order_id=%s",
                payment.order.id,
            )
            return

        payment.status = Payment.Status.SUCCEEDED
        payment.save(update_fields=["status"])

        order = payment.order

        logger.info(
            "[PayPal] Payment succeeded | order_id=%s paypal_id=%s",
            order.id,
            paypal_order_id,
        )

        # -------------------------
        # 🧺 Reserve / deplete stock
        # -------------------------
        ok, _ = PaymentService._reserve_stock_or_hold(order)
        if not ok:
            return

        order.status = "processing"
        order.save(update_fields=["status"])
        discount_amount = None
        if order.coupon:
            subtotal = sum(i.price * i.quantity for i in order.items.all())
            discount_amount = float(
                (subtotal + order.shipping_cost) - order.total_price
            )
        send_slack_message(f"🟡 PayPal paid — Order #{order.id}")
        send_payment_success_email(
        to_email=order.email,
        first_name=order.first_name,
        order_id=order.public_id,
        amount=float(order.total_price),
        payment_method="paypal",  # or "paypal"
        delivery_fee=float(order.shipping_cost),
        coupon_code=order.coupon.code if order.coupon else None,
        discount_amount=discount_amount,
        items=[
            {
                "title": item.product.name if item.product else item.bundle.name,
                "quantity": item.quantity,
                "unit_price": float(item.price),
                "line_total": float(item.price * item.quantity),
            }
            for item in order.items.all()
        ],
        )
        logger.info("[Email] Payment success email sent | order_id=%s", order.id)
        # -------------------------
        # 🚚 Create Sendcloud parcel
        # -------------------------
        try:
            parcel = SendcloudService.create_parcel(order)

            order.label_url = parcel.get("label_url")
            order.sendcloud_parcel_id = str(parcel.get("id"))
            order.save(update_fields=["label_url", "sendcloud_parcel_id"])

            logger.info(
                "[Shipping] Sendcloud parcel created | order_id=%s parcel_id=%s",
                order.id,
                parcel.get("id"),
            )

        except Exception as e:
            logger.exception(
                "[Shipping] Sendcloud parcel creation failed | order_id=%s error=%s",
                order.id,
                e,
            )
            send_slack_message(
                f"⚠️ Sendcloud parcel creation failed — Order #{order.id}: {e}"
            )


    # =====================================================
    # 🔒 INTERNAL HELPERS
    # =====================================================
    @staticmethod
    def _validate_checkout_payload(items, email=None, require_email=True):
        if not items:
            raise ValueError("No items provided")
        if require_email and not email:
            raise ValueError("Email required")

    @staticmethod
    def _apply_totals_and_coupon(order: Order, coupon_code: str | None):
        subtotal = sum(
            (i.price * i.quantity) for i in order.items.all()
        )
        # 🚚 Free shipping threshold
        if subtotal >= settings.FREE_SHIPPING_THRESHOLD:
            order.shipping_cost = Decimal("0.00")

        total = subtotal + order.shipping_cost
        coupon = None

        if coupon_code:
            coupon = Coupon.objects.get(code__iexact=coupon_code, is_active=True)
            discount = (total * coupon.discount_percent) / Decimal("100")
            total -= discount
            coupon.usage_count = F("usage_count") + 1
            coupon.save(update_fields=["usage_count"])

        order.total_price = total.quantize(PaymentService.MONEY_2DP)
        order.coupon = coupon
        order.save(update_fields=["total_price", "coupon"])

    @staticmethod
    def _reserve_stock_or_hold(order: Order):
        try:
            ok, errs = _deplete_stock_for_order(order)
        except Exception as e:
            logger.exception("[Stock] Exception | order_id=%s", order.id)
            send_slack_message(f"⚠️ Stock exception Order #{order.id}: {e}")
            return False, []

        if not ok:
            order.status = "on_hold"
            order.save(update_fields=["status"])
            send_slack_message(
                f"⚠️ Stock shortfall Order #{order.id}: {', '.join(errs)}"
            )
            return False, errs

        logger.info("[Stock] Depleted successfully | order_id=%s", order.id)
        return True, []

    @staticmethod
    def _to_minor_units(amount: Decimal) -> int:
        return int(
            (amount.quantize(PaymentService.MONEY_2DP) * 100).to_integral_value()
        )
