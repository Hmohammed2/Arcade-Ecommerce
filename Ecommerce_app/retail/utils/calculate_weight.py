from decimal import Decimal
from django.conf import settings
from retail.models import Product, Bundle
import logging
logger = logging.getLogger(__name__)

def calculate_cart_weight(items: list[dict]) -> Decimal:
    """
    Calculates total cart weight in KG.
    - Products use product.weight_kg
    - Bundles sum their component weights
    """
    
    logger.info("[Weight] Calculating cart weight for %s items", len(items))
    logger.debug("[Weight] Payload: %s", items)
    total_weight = Decimal("0.0")

    for item in items:
        qty = Decimal(item.get("quantity", 1))

        # -------------------
        # PRODUCT
        # -------------------
        if item["type"] == "product":
            product = Product.objects.get(id=item["product_id"])
            weight = product.weight_kg or settings.DEFAULT_PRODUCT_WEIGHT_KG
            total_weight += weight * qty

        # -------------------
        # BUNDLE
        # -------------------
        elif item["type"] == "bundle":
            bundle = (
                Bundle.objects
                .prefetch_related("items__product")
                .get(id=item["bundle_id"])
            )

            bundle_weight = Decimal("0.0")

            for bundle_item in bundle.items.all():
                product_weight = (
                    bundle_item.product.weight_kg
                    or settings.DEFAULT_PRODUCT_WEIGHT_KG
                )
                bundle_weight += product_weight * bundle_item.quantity

            total_weight += bundle_weight * qty

    return total_weight.quantize(Decimal("0.001"))
