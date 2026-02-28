from decimal import Decimal
from retail.models import Product, Bundle
import logging

logger = logging.getLogger(__name__)

def calculate_cart_weight(items):
    total_weight = Decimal("0.0")

    for item in items:
        logger.info("Processing item for cart_weight calculation: %s", item)
        
        qty = Decimal(item.get("quantity", 1))

        if item.get("type") == "product":
            product = Product.objects.get(id=item["product_id"])
            total_weight += product.weight_kg * qty

        elif item.get("type") == "bundle":
            bundle = Bundle.objects.prefetch_related(
                "components__product"
            ).get(id=item["bundle_id"])

            for component in bundle.components.all():
                component_qty = Decimal(component.quantity) * qty
                total_weight += component.product.weight_kg * component_qty

        else:
            raise ValueError(f"Unknown cart item type: {item}")
    
    logger.info("Total cart weight calculated: %s kg", total_weight)

    return total_weight
