from decimal import Decimal
from retail.models import Product
import logging

logger = logging.getLogger(__name__)

def calculate_cart_subtotal(items: list[dict]) -> Decimal:
    subtotal = Decimal("0.00")

    for item in items:
        logger.info("Processing item for subtotal calculation: %s", item)
        quantity = int(item.get("quantity", 1))

        if quantity <= 0:
            raise ValueError("Invalid cart item")

        if item.get("type") == "bundle":
            bundle_id = item.get("bundle_id")
            if not bundle_id:
                raise ValueError("Invalid bundle item")

            bundle = Product.objects.get(id=bundle_id)
            subtotal += bundle.price * quantity

        else:
            product_id = item.get("product_id")
            if not product_id:
                raise ValueError("Invalid cart item")

            product = Product.objects.get(id=product_id)
            subtotal += product.price * quantity

    logger.info("Total cart subtotal calculated: %s", subtotal)
    return subtotal