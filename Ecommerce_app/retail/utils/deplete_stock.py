from django.db import transaction
from retail.models import Order, Product, ProductVariant
from django.db.models import F

@staticmethod
def _deplete_stock_for_order(order: Order) -> tuple[bool, list[str]]:
    """
    Atomically decrement stock for each OrderItem.
    Returns (ok, errors). If any line can't be fulfilled, nothing is partially rolled back
    because we're called inside @transaction.atomic in the caller.
    """
    errors: list[str] = []
    # Lock rows conceptually by using conditional updates; alternatively use select_for_update
    for item in order.items.select_related("product"):
        qty = int(item.quantity)
        colour = item.colour
        if colour:
            # Decrement variant stock only if enough is available
            updated = ProductVariant.objects.filter(
                product=item.product,
                colour__iexact=colour,
                stock__gte=qty,
            ).update(stock=F("stock") - qty)
            if updated == 0:
                # Read current to report accurate number
                cur = ProductVariant.objects.filter(
                    product=item.product, colour__iexact=colour
                ).first()
                avail = cur.stock if cur else 0
                errors.append(
                    f"{item.product.name} ({colour}) insufficient: need {qty}, have {avail}"
                )
        else:
            updated = Product.objects.filter(
                id=item.product_id, stock__gte=qty
            ).update(stock=F("stock") - qty)
            if updated == 0:
                cur = Product.objects.only("stock").get(id=item.product_id)
                errors.append(
                    f"{item.product.name} insufficient: need {qty}, have {cur.stock}"
                )

    return (len(errors) == 0, errors)
