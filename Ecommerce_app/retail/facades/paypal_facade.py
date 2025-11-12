import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class PayPalFacade:
    """Facade class to interact with PayPal"""

    @staticmethod
    def get_access_token():
        url = f"{settings.PAYPAL_API_BASE}/v1/oauth2/token"
        logger.info("Requesting PayPal access token from %s", url)

        try:
            response = requests.post(
                url,
                auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET),
                data={"grant_type": "client_credentials"},
                timeout=15,
            )
            response.raise_for_status()
            token_data = response.json()
            logger.debug("PayPal access token retrieved successfully: expires_in=%s", token_data.get("expires_in"))
            return token_data["access_token"]
        except requests.RequestException as e:
            logger.exception("Failed to get PayPal access token: %s", e)
            raise

    @staticmethod
    def create_order(amount, currency="GBP"):
        token = PayPalFacade.get_access_token()
        url = f"{settings.PAYPAL_API_BASE}/v2/checkout/orders"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        data = {
            "intent": "CAPTURE",
            "purchase_units": [
                {"amount": {"currency_code": currency, "value": f"{amount:.2f}"}}
            ],
        }

        logger.info("Creating PayPal order: %s %s", amount, currency)
        logger.debug("PayPal create_order payload: %s", data)

        try:
            r = requests.post(url, json=data, headers=headers, timeout=20)
            r.raise_for_status()
            result = r.json()
            logger.info("PayPal order created successfully: id=%s, status=%s",
                        result.get("id"), result.get("status"))
            logger.debug("PayPal order response: %s", result)
            return result
        except requests.RequestException as e:
            logger.exception("PayPal order creation failed: %s", e)
            if r is not None:
                logger.error("PayPal error response: %s", getattr(r, "text", "N/A"))
            raise

    @staticmethod
    def capture_order(order_id):
        token = PayPalFacade.get_access_token()
        url = f"{settings.PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        logger.info("Capturing PayPal order: id=%s", order_id)

        try:
            r = requests.post(url, headers=headers, timeout=20)
            r.raise_for_status()
            result = r.json()
            logger.info("PayPal order captured successfully: id=%s, status=%s",
                        result.get("id"), result.get("status"))
            logger.debug("PayPal capture response: %s", result)
            return result
        except requests.RequestException as e:
            logger.exception("PayPal capture failed for order_id=%s: %s", order_id, e)
            if r is not None:
                logger.error("PayPal error response: %s", getattr(r, "text", "N/A"))
            raise
