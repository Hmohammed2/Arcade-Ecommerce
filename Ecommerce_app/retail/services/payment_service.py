from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from retail.models import Order, OrderItem, Payment, Product, Coupon, ProductVariant
from retail.facades.stripe_facade import StripePaymentFacade
from retail.facades.paypal_facade import PayPalFacade
from retail.utils.slack_notifications import send_slack_message
from retail.utils.deplete_stock import _deplete_stock_for_order

import logging

logger = logging.getLogger(__name__)


class PaymentService:
    """
    Service layer that coordinates Order, Payment, Coupons, and Notifications.
    """

    # ---------------------------
    # 🧾 MAIN CHECKOUT (STRIPE)
    # ---------------------------
    @staticmethod
    @transaction.atomic
    def create_order_and_payment(
        *,
        user=None,
        items: list,
        email: str,
        first_name: str,
        last_name: str,
        phone: str = "",
        currency: str = "GBP",
        delivery_method: str = "standard",
        coupon_code: str | None = None,
    ):
        """
        Creates an Order, OrderItems, applies a valid coupon,
        adds delivery fees, creates Stripe PaymentIntent, and a Payment record.
        """
        if not items:
            raise ValueError("Cannot create order with no items.")
        if not email:
            raise ValueError("Email is required for checkout.")

        # ✅ Step 1: Create order shell
        order = Order.objects.create(
            user=user,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            total_price=Decimal("0.00"),
        )

        subtotal = Decimal("0.00")

        # ✅ Step 2: Create order items and manage stock
        for item in items:
            try:
                product = Product.objects.get(id=item["product_id"])
            except ObjectDoesNotExist:
                logger.exception("Product not found during checkout: %s", e)
                raise ValueError(f"Product with id {item['product_id']} not found.")

            quantity = int(item.get("quantity", 1))
            if quantity < 1:
                logger.exception("Invalid quantity for product %s: %s", item["product_id"], quantity)
                raise ValueError("Quantity must be at least 1.")

            colour = item.get("colour")
            
            logger.debug("Processing item %s (qty=%s, colour=%s)", item["product_id"], item.get("quantity"), item.get("colour"))

            # 🧠 Smart stock validation — variant or fallback
            if colour:
                variant = ProductVariant.objects.filter(
                    product=product, colour__iexact=colour
                ).first()
                if not variant:
                    logger.exception("Variant not found for product %s with colour %s", product.id, colour)
                    raise ValueError(f"Colour '{colour}' not available for {product.name}")
                if variant.stock < quantity:
                    logger.exception("Insufficient stock for product %s variant %s: requested %s, available %s", product.id, colour, quantity, variant.stock)
                    raise ValueError(f"Insufficient stock for {product.name} ({colour})")

            else:
                if product.stock < quantity:
                    logger.exception("Insufficient stock for product %s: requested %s, available %s", product.id, quantity, product.stock)
                    raise ValueError(f"Insufficient stock for {product.name}")
                
            # Calculate line total
            line_price = product.price * quantity
            subtotal += line_price

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price,
                colour=colour,
            )
            
        # ✅ Step 3: Apply coupon (if valid)
        discount_percent = Decimal("0.00")
        coupon_obj = None

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code.strip())
                if coupon.is_valid_for_user(email):
                    discount_percent = Decimal(coupon.discount_percent) / Decimal("100")
                    coupon_obj = coupon
                    coupon.usage_count += 1
                    coupon.save(update_fields=["usage_count"])
                else:
                    logger.exception("Coupon %s not valid for email %s", coupon_code, email)
                    raise ValueError("Coupon not valid for this account or expired.")
            except Coupon.DoesNotExist:
                logger.exception("Coupon %s does not exist", coupon_code)
                raise ValueError("Invalid coupon code.")

        discounted_total = subtotal * (Decimal("1.00") - discount_percent)

        # ✅ Step 4: Calculate delivery fee
        delivery_fee = Decimal("0.00")
        if delivery_method == "standard":
            if discounted_total < Decimal("15.00"):
                delivery_fee = Decimal("2.99")
        elif delivery_method == "express":
            delivery_fee = Decimal("1.99")
            if discounted_total < Decimal("15.00"):
                delivery_fee += Decimal("2.99")

        grand_total = discounted_total + delivery_fee
        
        # After subtotal and coupon application
        logger.info("Subtotal=%s, discount=%s, delivery_fee=%s, grand_total=%s", subtotal, discount_percent, delivery_fee, grand_total)

        # ✅ Step 5: Update order totals
        order.total_price = grand_total
        order.delivery_method = delivery_method
        order.delivery_fee = delivery_fee
        order.coupon = coupon_obj
        order.save(
            update_fields=[
                "total_price",
                "delivery_method",
                "delivery_fee",
                "coupon",
            ]
        )

        # ✅ Step 6: Create Stripe PaymentIntent
        logger.info("Creating Stripe PaymentIntent for order #%s, amount=%s %s", order.id, grand_total, currency)
        amount_in_pence = int(grand_total * 100)
        intent_data = StripePaymentFacade.create_payment_intent(
            amount=amount_in_pence,
            currency=currency.lower(),
        )
        
        
        # ✅ Step 7: Record Payment in DB
        payment = Payment.objects.create(
            order=order,
            stripe_payment_intent=intent_data.get("id"),
            amount=grand_total,
            currency=currency.upper(),
            status="pending",
        )
        
        
        # Payment record
        logger.info("Payment record created (order_id=%s, payment_id=%s)", order.id, payment.id)

        # ✅ Slack Notification
        send_slack_message(
            f"🛒 Order #{order.id} created by {order.first_name} {order.last_name} "
            f"for £{order.total_price:.2f}. "
            f"{'Coupon: ' + coupon_code if coupon_code else ''}"
        )
        
        # Slack message also logged
        logger.info("Order #%s successfully created and Slack notified.", order.id)

        # ✅ Step 8: Return response to frontend
        return {
            "order_id": order.id,
            "payment_id": payment.id,
            "clientSecret": intent_data.get("client_secret"),
            "amount": amount_in_pence,
            "currency": currency.upper(),
            "discount_applied": float(discount_percent * 100),
            "delivery_fee": float(delivery_fee),
            "grand_total": float(grand_total),
        }

    # ---------------------------
    # 🅿️ PAYPAL CHECKOUT
    # ---------------------------
    @staticmethod
    @transaction.atomic
    def create_paypal_order(
        user,
        items,
        email,
        first_name,
        last_name,
        phone="",
        currency="GBP",
        delivery_method="standard",
        coupon_code=None,
    ):
        """
        Creates a PayPal order and links it to a local Payment record.
        """
        order_data = PaymentService.create_order_and_payment(
            user=user,
            items=items,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            currency=currency,
            delivery_method=delivery_method,
            coupon_code=coupon_code,
        )

        order = Order.objects.get(id=order_data["order_id"])
        paypal_order = PayPalFacade.create_order(order.total_price, currency)
        paypal_order_id = paypal_order["id"]

        # Update local Payment record to PayPal
        payment = order.payment
        payment.payment_method = "paypal"
        payment.stripe_payment_intent = paypal_order_id
        payment.status = "pending"
        payment.save()

        return {
            "order_id": order.id,
            "paypal_order_id": paypal_order_id,
            "approval_url": next(
                (link["href"] for link in paypal_order["links"] if link["rel"] == "approve"),
                None,
            ),
        }

    # ---------------------------
    # 💰 STRIPE PAYMENT STATUS
    # ---------------------------
    @staticmethod
    @transaction.atomic
    def mark_payment_succeeded(intent: dict) -> None:
        from retail.models import CouponUsage
        from users.services.SendEmail import send_payment_success_email

        try:
            payment = Payment.objects.get(stripe_payment_intent=intent["id"])
        except Payment.DoesNotExist:
            logger.exception("Payment with Stripe intent %s does not exist", intent["id"])
            return

        # 1) Mark payment fields
        payment.status = "succeeded"
        payment.payment_method = intent["payment_method_types"][0]
        payment.save(update_fields=["status", "payment_method"])

        order = payment.order

        # 2) Try to decrement stock atomically
        ok, errs = _deplete_stock_for_order(order)
        if not ok:
            # Business choice: put order on hold and notify staff; you could also auto-refund here.
            order.status = "on_hold"
            order.save(update_fields=["status"])
            msg = (
                f"⚠️ Stock shortfall for Order #{order.id} after payment. "
                f"Items: {', '.join(errs)}"
            )
            logger.error(msg)
            send_slack_message(msg)
            return  # stop here; don't send success email yet (or send a different one)

        # 3) All good → proceed
        order.status = "processing"
        order.save(update_fields=["status"])

        if order.coupon and order.email:
            CouponUsage.objects.get_or_create(coupon=order.coupon, email=order.email)

        send_slack_message(
            f"✅ Payment succeeded and stock reserved for Order #{order.id} "
            f"({order.first_name} {order.last_name}, £{payment.amount:.2f})."
        )
        logger.info("Payment and stock confirmed for Order #%s", order.id)

        # 4) Email customer
        try:
            items = [
                {"name": i.product.name, "quantity": i.quantity, "price": float(i.price)}
                for i in order.items.all()
            ]
            send_payment_success_email(
                to_email=order.email,
                first_name=order.first_name or "",
                order_id=order.id,
                amount=payment.amount,
                items=items,
                payment_method=payment.payment_method,
                coupon_code=order.coupon.code if order.coupon else None,
            )
            logger.info("Payment success email sent for Order #%s to %s", order.id, order.email)
        except Exception as e:
            logger.exception("Failed to send payment success email for Order #%s: %s", order.id, e)
            send_slack_message(f"⚠️ Failed to send Stripe payment email for Order #{order.id}: {e}")

        
     # ✅ PAYPAL PAYMENT SUCCESS
    @staticmethod
    @transaction.atomic
    def mark_paypal_payment_succeeded(order_id: str) -> None:
        """
        Marks a PayPal payment as succeeded, decrements stock,
        updates order status, records coupon usage, and sends notification/email.
        """
        from retail.models import CouponUsage  # avoid circular import
        from users.services.SendEmail import send_payment_success_email

        try:
            payment = Payment.objects.get(stripe_payment_intent=order_id)
        except Payment.DoesNotExist:
            logger.exception("Payment with PayPal order ID %s does not exist", order_id)
            return

        # 1️⃣ Update payment record
        payment.status = "succeeded"
        payment.payment_method = "paypal"
        payment.save(update_fields=["status", "payment_method"])

        order = payment.order
        logger.info("Marking PayPal payment succeeded for Order #%s", order.id)

        # 2️⃣ Attempt to atomically decrement stock
        ok, errs = _deplete_stock_for_order(order)

        if not ok:
            # ⚠️ If stock can’t be fulfilled, place order on hold and notify staff
            order.status = "on_hold"
            order.save(update_fields=["status"])

            msg = (
                f"⚠️ Stock shortfall for PayPal Order #{order.id}. "
                f"Unable to fulfill: {', '.join(errs)}"
            )
            logger.error(msg)
            send_slack_message(msg)
            return  # stop here; don't send success email yet

        # 3️⃣ All stock OK → mark order as processing
        order.status = "processing"
        order.save(update_fields=["status"])

        # 4️⃣ Record coupon usage (if applicable)
        if order.coupon and order.email:
            CouponUsage.objects.get_or_create(
                coupon=order.coupon,
                email=order.email,
            )

        # 5️⃣ Log + Slack notification
        msg = (
            f"✅ PayPal payment succeeded and stock reserved for Order #{order.id} "
            f"({order.first_name} {order.last_name}, £{payment.amount:.2f})."
        )
        logger.info(msg)
        send_slack_message(msg)

        # 6️⃣ Send confirmation email
        try:
            items = [
                {"name": i.product.name, "quantity": i.quantity, "price": float(i.price)}
                for i in order.items.all()
            ]
            send_payment_success_email(
                to_email=order.email,
                first_name=order.first_name or "",
                order_id=order.id,
                amount=payment.amount,
                items=items,
                payment_method="PayPal",
                coupon_code=order.coupon.code if order.coupon else None,
            )
            logger.info("PayPal payment success email sent for Order #%s to %s", order.id, order.email)
        except Exception as e:
            logger.exception("Failed to send PayPal payment success email for Order #%s: %s", order.id, e)
            send_slack_message(f"⚠️ Failed to send PayPal payment email for Order #{order.id}: {e}")


    @staticmethod
    def mark_payment_failed(intent: dict) -> None:
        """
        Marks a payment as failed and reverts order status.
        """
        try:
            payment = Payment.objects.get(stripe_payment_intent=intent["id"])
        except Payment.DoesNotExist:
            logger.exception("Payment with Stripe intent %s does not exist", intent["id"])
            return

        payment.status = "failed"
        payment.save()

        order = payment.order
        order.status = "pending"
        order.save()

        send_slack_message(
            f"❌ Payment failed for Order #{order.id} "
            f"({order.first_name} {order.last_name}, £{payment.amount:.2f})."
        )
        logger.info("Payment for Order #%s marked as failed and Slack notified.", order.id)
