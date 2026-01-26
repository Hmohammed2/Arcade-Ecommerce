import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class SendcloudService:
    @staticmethod
    def create_parcel(order):
        """
        Create Sendcloud parcel + label after successful payment
        """

        sender_address = (
            "all" if settings.DEBUG else settings.SENDCLOUD_SENDER_ADDRESS_ID
        )

        payload = {
            "parcel": {
                # ---- Recipient ----
                "name": order.shipping_name,
                "address": order.shipping_address1,
                "address_2": order.shipping_address2 or "",
                "city": order.shipping_city,
                "postal_code": order.shipping_postcode,
                "country": order.shipping_country,

                # ---- Contact ----
                "email": order.email,
                "telephone": order.phone,

                # ---- Shipment ----
                "shipment": {
                    "id": int(order.shipping_method_id),
                },

                # ---- Meta ----
                "weight": str(order.total_weight_kg),
                "order_number": str(order.public_id),
                "request_label": True,
                "sender_address": sender_address,
            }
        }

        auth = (
            ("test", "test")
            if settings.DEBUG
            else (
                settings.SENDCLOUD_PUBLIC_KEY,
                settings.SENDCLOUD_SECRET_KEY,
            )
        )

        logger.info(
            "[Sendcloud] Creating parcel | order=%s method=%s sender=%s",
            order.id,
            order.shipping_method_id,
            sender_address,
        )

        resp = requests.post(
            f"{settings.SENDCLOUD_BASE_URL}/parcels",
            json=payload,
            auth=auth,
            timeout=15,
        )

        if not resp.ok:
            logger.error(
                "[Sendcloud] Parcel creation failed | status=%s body=%s",
                resp.status_code,
                resp.text,
            )
            resp.raise_for_status()

        data = resp.json()["parcel"]

        # ---- Persist tracking info ----
        order.tracking_number = data.get("tracking_number")
        order.save(update_fields=["tracking_number"])

        logger.info(
            "[Sendcloud] Parcel created | order=%s tracking=%s parcel_id=%s",
            order.id,
            order.tracking_number,
            data.get("id"),
        )

        return data
