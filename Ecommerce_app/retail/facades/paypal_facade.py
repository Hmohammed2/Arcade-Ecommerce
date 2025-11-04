import requests
from django.conf import settings

class PayPalFacade:
    """Facade class to interact with Paypal"""
    @staticmethod
    def get_access_token():
        url = f"{settings.PAYPAL_API_BASE}/v1/oauth2/token"
        response = requests.post(
            url,
            auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET),
            data={"grant_type": "client_credentials"},
        )
        response.raise_for_status()
        return response.json()["access_token"]

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
                {
                    "amount": {"currency_code": currency, "value": f"{amount:.2f}"}
                }
            ],
        }
        r = requests.post(url, json=data, headers=headers)
        r.raise_for_status()
        return r.json()

    @staticmethod
    def capture_order(order_id):
        token = PayPalFacade.get_access_token()
        url = f"{settings.PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        r = requests.post(url, headers=headers)
        r.raise_for_status()
        return r.json()
