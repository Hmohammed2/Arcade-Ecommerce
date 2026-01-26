FREE_SHIPPING_THRESHOLD = 45.00
INTERNATIONAL_SURCHARGE = 6.00

SHIPPING_METHODS = {
    "standard": {
        "label": "Standard Delivery",
        "base_price": 3.95,
    },
    "express": {
        "label": "Express Delivery",
        "base_price": 6.95,
    },
}

def resolve_shipping_method(
    *,
    method_name: str,
    country: str,
    cart_subtotal: float,
    total_weight_kg: float,
):
    if method_name not in SHIPPING_METHODS:
        raise ValueError("Invalid shipping method")

    method = SHIPPING_METHODS[method_name]
    price = method["base_price"]

    is_uk = country == "GB"

    # 🇬🇧 UK free shipping
    if is_uk and cart_subtotal >= FREE_SHIPPING_THRESHOLD:
        return {
            "method_name": method_name,
            "price": 0.00,
            "free_shipping": True,
        }

    # 🌍 International surcharge
    if not is_uk:
        price += INTERNATIONAL_SURCHARGE

    # ⚖️ (optional but recommended) weight guardrail
    if method_name == "standard" and total_weight_kg > 2.0:
        raise ValueError("Standard shipping unavailable for heavy orders")

    return {
        "method_name": method_name,
        "price": round(price, 2),
        "free_shipping": False,
    }
