from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.conf import settings

from retail.models import Order, OrderItem, Payment, Product, Coupon, ProductVariant
from retail.facades.stripe_facade import StripePaymentFacade
from retail.facades.paypal_facade import PayPalFacade
from retail.utils.slack_notifications import send_slack_message


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
                raise ValueError(f"Product with id {item['product_id']} not found.")

            quantity = int(item.get("quantity", 1))
            if quantity < 1:
                raise ValueError("Quantity must be at least 1.")

            colour = item.get("colour")

            # 🧠 Smart stock validation — variant or fallback
            if colour:
                variant = ProductVariant.objects.filter(
                    product=product, colour__iexact=colour
                ).first()
                if not variant:
                    raise ValueError(f"Colour '{colour}' not available for {product.name}")
                if variant.stock < quantity:
                    raise ValueError(f"Insufficient stock for {product.name} ({colour})")

                variant.stock -= quantity
                variant.save(update_fields=["stock"])
            else:
                if product.stock < quantity:
                    raise ValueError(f"Insufficient stock for {product.name}")
                product.stock -= quantity
                product.save(update_fields=["stock"])
                
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
                    raise ValueError("Coupon not valid for this account or expired.")
            except Coupon.DoesNotExist:
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

        # ✅ Slack Notification
        send_slack_message(
            f"🛒 Order #{order.id} created by {order.first_name} {order.last_name} "
            f"for £{order.total_price:.2f}. "
            f"{'Coupon: ' + coupon_code if coupon_code else ''}"
        )

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
        """
        Marks a payment as succeeded and updates the related order.
        """
        from retail.models import CouponUsage  # ✅ Import here to avoid circular import
        
        try:
            payment = Payment.objects.get(stripe_payment_intent=intent["id"])
        except Payment.DoesNotExist:
            return

        payment.status = "succeeded"
        payment.payment_method = intent["payment_method_types"][0]
        payment.save()

        order = payment.order
        order.status = "processing"
        order.save()
        
        # ✅ If the order had a coupon, mark it as used
        if order.coupon and order.email:
            CouponUsage.objects.get_or_create(
                coupon=order.coupon,
                email=order.email,
            )

        send_slack_message(
            f"✅ Payment succeeded for Order #{order.id} "
            f"({order.first_name} {order.last_name}, £{payment.amount:.2f})."
        )
        
     # ✅ PAYPAL PAYMENT SUCCESS
    @staticmethod
    @transaction.atomic
    def mark_paypal_payment_succeeded(order_id: str) -> None:
        """
        Marks a PayPal payment as succeeded, updates the related order,
        and records coupon usage for that email.
        """
        from retail.models import CouponUsage  # ✅ Import here to avoid circular import
        
        try:
            payment = Payment.objects.get(stripe_payment_intent=order_id)
        except Payment.DoesNotExist:
            return

        payment.status = "succeeded"
        payment.payment_method = "paypal"
        payment.save()

        order = payment.order
        order.status = "processing"
        order.save()

        # ✅ Record coupon usage
        if order.coupon and order.email:
            CouponUsage.objects.get_or_create(
                coupon=order.coupon,
                email=order.email,
            )

        send_slack_message(
            f"✅ PayPal Payment succeeded for Order #{order.id} "
            f"({order.first_name} {order.last_name}, £{payment.amount:.2f})."
        )

    @staticmethod
    def mark_payment_failed(intent: dict) -> None:
        """
        Marks a payment as failed and reverts order status.
        """
        try:
            payment = Payment.objects.get(stripe_payment_intent=intent["id"])
        except Payment.DoesNotExist:
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
