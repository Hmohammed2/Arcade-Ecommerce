import requests
from decimal import Decimal
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def fetch_shipping_method_price(
    shipping_method_id: str,
    country: str,
    postcode: str,
) -> Decimal:
    """
    Validates a selected shipping method and returns its price.
    In DEBUG, falls back to NL because Sendcloud mock server only supports NL.
    """

    sender_address = (
        "all" if settings.DEBUG else settings.SENDCLOUD_SENDER_ADDRESS_ID
    )

    auth = (
        ("test", "test")
        if settings.DEBUG
        else (
            settings.SENDCLOUD_PUBLIC_KEY,
            settings.SENDCLOUD_SECRET_KEY,
        )
    )

    def fetch(to_country: str):
        params = {
            "to_country": to_country,
            "to_postal_code": postcode,
            "from_postal_code": settings.SENDCLOUD_FROM_POSTCODE,
            "sender_address": sender_address,
        }

        logger.info(
            "[Shipping] Validating method %s for %s %s (sender=%s)",
            shipping_method_id,
            to_country,
            postcode,
            sender_address,
        )

        return requests.get(
            f"{settings.SENDCLOUD_BASE_URL}/shipping_methods/{shipping_method_id}",
            params=params,
            auth=auth,
            headers={"Accept": "application/json"},
            timeout=10,
        )

    # 1️⃣ Try requested country
    resp = fetch(country)

    # 2️⃣ DEV fallback → NL
    if settings.DEBUG and resp.status_code in (400, 404):
        logger.warning(
            "[Shipping][DEV] Method %s not available for %s — falling back to NL",
            shipping_method_id,
            country,
        )
        resp = fetch("NL")

    try:
        resp.raise_for_status()
        data = resp.json()["shipping_method"]
    except Exception:
        logger.exception(
            "[Shipping] Failed validating shipping method %s",
            shipping_method_id,
        )
        raise ValueError("Shipping method not available for destination")

    # 3️⃣ Country pricing lookup
    country_cfg = next(
        (c for c in data.get("countries", []) if c["iso_2"] == country),
        None,
    )

    # DEV fallback pricing
    if not country_cfg and settings.DEBUG and data.get("countries"):
        country_cfg = data["countries"][0]

    if not country_cfg:
        raise ValueError("Shipping method not available for destination")

    price = Decimal(str(country_cfg["price"]))

    logger.info(
        "[Shipping] Method %s validated price=%s (%s)",
        shipping_method_id,
        price,
        country_cfg["iso_2"],
    )

    return price
