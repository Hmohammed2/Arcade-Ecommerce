from decimal import Decimal
from django.db import transaction
from retail.models import Order, OrderItem, Payment, Product
from retail.facades.stripe_facade import StripePaymentFacade
from retail.facades.paypal_facade import PayPalFacade
from django.core.exceptions import ObjectDoesNotExist
from retail.utils.slack_notifications import send_slack_message

class PaymentService:
    """
    Service layer that coordinates Order <-> Payment updates
    """
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
    ):
        """
        Creates an Order, its OrderItems, a Stripe PaymentIntent, and a Payment record.

        Supports both guest and authenticated users.
        """
        if not items:
            raise ValueError("Cannot create order with no items.")
        if not email:
            raise ValueError("Email is required for checkout.")

        # 1️⃣ Create the order (user may be None for guests)
        order = Order.objects.create(
            user=user,
            email=email,
            first_name=first_name,
            phone=phone,
            last_name=last_name,
            total_price=Decimal("0.00"),
        )

        total_price = Decimal("0.00")

        # 2️⃣ Add each order item and update stock
        for item in items:
            try:
                product = Product.objects.get(id=item["product_id"])
            except ObjectDoesNotExist:
                raise ValueError(f"Product with id {item['product_id']} not found.")

            quantity = int(item.get("quantity", 1))
            if quantity < 1:
                raise ValueError("Quantity must be at least 1.")
            
            colour = item.get("colour") 
            if colour and colour not in (product.colours or []):
                raise ValueError(f"Colour '{colour}' not available for {product.name}")

            line_price = product.price * quantity

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price,
                colour=colour
            )

            # Reduce stock safely
            if product.stock >= quantity:
                product.stock -= quantity
            else:
                raise ValueError(f"Insufficient stock for {product.name}")
            product.save(update_fields=["stock"])

            total_price += line_price
            
        # Calculate delivery fee
        delivery_fee = Decimal("0.00")
        if delivery_method == "standard":
            if total_price < Decimal("15.00"):
                delivery_fee = Decimal("2.99")
        elif delivery_method == "express":
            delivery_fee = Decimal("1.99")
            if total_price < Decimal("15.00"):
                # Express stacks with small order fee
                delivery_fee += Decimal("2.99")

        total_with_delivery = total_price + delivery_fee

        # 3️⃣ Update order total
        order.total_price = total_with_delivery
        order.delivery_method = delivery_method
        order.delivery_fee = delivery_fee
        
        order.save(update_fields=["total_price", "delivery_method", "delivery_fee"])

        # 4️⃣ Create PaymentIntent via Stripe
        amount_in_pence = int(total_price * 100)
        intent_data = StripePaymentFacade.create_payment_intent(
            amount=amount_in_pence,
            currency=currency.lower(),
        )

        # 5️⃣ Record Payment in DB
        payment = Payment.objects.create(
            order=order,
            stripe_payment_intent=intent_data.get("id"),
            amount=total_with_delivery,
            currency=currency.upper(),
            status="pending",
        )
        
        # ✅ Notify Slack
        send_slack_message(
            f"💸 Order created #{order.id} "
            f"({order.first_name} {order.last_name}, £{payment.amount})."
        )

        # 6️⃣ Return structured response for frontend
        return {
            "order_id": order.id,
            "payment_id": payment.id,
            "clientSecret": intent_data.get("client_secret"),
            "amount": amount_in_pence,
            "currency": currency.upper(),
        }
    
    @staticmethod
    @transaction.atomic
    def create_paypal_order(user, items, email, first_name, last_name, phone="", currency="GBP", delivery_method="standard"):
        """
        Creates a PayPal order and a local Payment record.
        """
        # 👇 reuse your order-creation logic
        order_data = PaymentService.create_order_and_payment(
            user=user,
            items=items,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            currency=currency,
            delivery_method=delivery_method,
        )

        order = Order.objects.get(id=order_data["order_id"])
        paypal_order = PayPalFacade.create_order(order.total_price, currency)
        paypal_order_id = paypal_order["id"]

        # update payment record to reflect PayPal
        payment = order.payment
        payment.payment_method = "paypal"
        payment.stripe_payment_intent = paypal_order_id  # reuse field
        payment.status = "pending"
        payment.save()

        return {
            "order_id": order.id,
            "paypal_order_id": paypal_order_id,
            "approval_url": paypal_order["links"][1]["href"],  # where customer approves
        }

    @staticmethod
    @transaction.atomic
    def mark_payment_succeeded(intent: dict) -> None:
        try:
            payment = Payment.objects.get(stripe_payment_intent=intent["id"])
            payment.status = "succeeded"
            payment.payment_method = intent["payment_method_types"][0]
            payment.save()

            order = payment.order
            order.status = "processing"
            order.save()
        
            # ✅ Notify Slack
            send_slack_message(
                f"💸 Payment succeeded for Order #{order.id} "
                f"({order.first_name} {order.last_name}, £{payment.amount})."
            )
            
        except Payment.DoesNotExist:
            pass

    @staticmethod
    def mark_payment_failed(intent: dict) -> None:
        try:
            payment = Payment.objects.get(stripe_payment_intent=intent["id"])
            payment.status = "failed"
            payment.save()
            
            order = payment.order
            order.status = "pending"
            order.save()

            # ✅ Notify Slack
            send_slack_message(
                f"💸 Payment failed for Order #{order.id} "
                f"({order.first_name} {order.last_name}, £{payment.amount})."
            )
        except Payment.DoesNotExist:
            pass
