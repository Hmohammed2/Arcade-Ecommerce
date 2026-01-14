from django.db import transaction
from retail.models import Order, Product, ProductVariant
from django.db.models import F

@staticmethod
def _deplete_stock_for_order(order: Order) -> tuple[bool, list[str]]:
    errors: list[str] = []

    for item in order.items.select_related("product"):
        qty = int(item.quantity)
        colour = item.colour

        # VARIANT STOCK
        if colour:
            try:
                variant = (
                    ProductVariant.objects
                    .select_for_update()
                    .get(product_id=item.product_id, colour__iexact=colour)
                )
            except ProductVariant.DoesNotExist:
                errors.append(f"Variant missing for item {item.id}")
                continue

            if variant.stock is None:
                continue

            if variant.stock < qty:
                errors.append(
                    f"{item.product.name} ({colour}) insufficient: need {qty}, have {variant.stock}"
                )
                continue

            variant.stock = F("stock") - qty
            variant.save(update_fields=["stock"])

        # PRODUCT STOCK
        else:
            try:
                product = (
                    Product.objects
                    .select_for_update()
                    .get(id=item.product_id)
                )
            except Product.DoesNotExist:
                errors.append(f"Product missing for item {item.id}")
                continue

            if product.stock is None:
                continue

            if product.stock < qty:
                errors.append(
                    f"{item.product.name} insufficient: need {qty}, have {product.stock}"
                )
                continue

            product.stock = F("stock") - qty
            product.save(update_fields=["stock"])

    return (len(errors) == 0, errors)
