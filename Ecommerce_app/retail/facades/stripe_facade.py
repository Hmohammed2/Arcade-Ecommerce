import stripe
from django.conf import settings
from typing import Dict, Any

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripePaymentFacade:
    """Facade class to interact with Stripe"""

    @staticmethod
    def create_payment_intent(amount: int, currency: str = "gbp") -> Dict[str, Any]:
        """
        Create a payment intent for a given amount.
        :param amount: Amount in smallest currency unit (pence for GBP)
        """
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            automatic_payment_methods={"enabled": True},
        )
        return {"client_secret": intent.client_secret, "id": intent.id}

    @staticmethod
    def handle_webhook_event(payload: bytes, sig_header: str) -> Dict[str, Any]:
        """
        Verify and parse webhook event
        """
        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET,
            )
            return event
        except stripe.error.SignatureVerificationError as e:
            raise ValueError(f"Webhook signature verification failed: {e}")
        except Exception as e:
            raise ValueError(f"Error parsing webhook: {e}")