from django.db import transaction
from django.db.models import F
from retail.models import (
    Order,
    Product,
    ProductVariant,
    BundleComponent,
)

@staticmethod
def _deplete_stock_for_order(order: Order) -> tuple[bool, list[str]]:
    """
    Atomically decrement stock for:
      - normal products
      - bundle components (including variants + colours)

    Returns: (success, [errors])
    """

    errors: list[str] = []

    def deplete(obj, qty: int, label: str) -> bool:
        """Shared helper to validate + decrement stock."""
        if obj.stock is None:
            return True  # not tracked

        if obj.stock < qty:
            errors.append(
                f"{label} insufficient: need {qty}, have {obj.stock}"
            )
            return False

        obj.stock = F("stock") - qty
        obj.save(update_fields=["stock"])
        return True

    for item in order.items.select_related("product", "bundle"):

        qty = int(item.quantity)

        # =======================
        # CASE 1 — BUNDLE LINE
        # =======================
        if item.bundle_id:

            bundle = (
                item.bundle
                or Bundle.objects.select_for_update().get(id=item.bundle_id)
            )

            # Fetch all components for this bundle
            components = BundleComponent.objects.filter(
                bundle=bundle
            ).select_related("product", "variant", "option_value")

            for comp in components:

                # How many units this order consumes
                required_qty = comp.quantity * qty

                # ---- Variant-based component ----
                if comp.variant_id:
                    variant = (
                        ProductVariant.objects
                        .select_for_update()
                        .get(id=comp.variant_id)
                    )

                    ok = deplete(
                        variant,
                        required_qty,
                        f"{variant.product.name} ({variant.colour}) in bundle '{bundle.name}'",
                    )
                    if not ok:
                        continue

                # ---- Base product component ----
                elif comp.product_id:
                    product = (
                        Product.objects
                        .select_for_update()
                        .get(id=comp.product_id)
                    )

                    ok = deplete(
                        product,
                        required_qty,
                        f"{product.name} in bundle '{bundle.name}'",
                    )
                    if not ok:
                        continue

                else:
                    errors.append(
                        f"BundleComponent misconfigured for bundle {bundle.name}"
                    )

            continue  # done with this bundle line

        # =======================
        # CASE 2 — NORMAL PRODUCT
        # =======================

        # ---- Variant stock ----
        if item.colour:
            try:
                variant = (
                    ProductVariant.objects
                    .select_for_update()
                    .get(
                        product_id=item.product_id,
                        colour__iexact=item.colour,
                    )
                )
            except ProductVariant.DoesNotExist:
                errors.append(
                    f"Variant missing for item {item.id} "
                    f"({item.product.name}, colour={item.colour})"
                )
                continue

            deplete(
                variant,
                qty,
                f"{item.product.name} ({item.colour})",
            )
            continue

        # ---- Base product stock ----
        try:
            product = (
                Product.objects
                .select_for_update()
                .get(id=item.product_id)
            )
        except Product.DoesNotExist:
            errors.append(f"Product missing for item {item.id}")
            continue

        deplete(
            product,
            qty,
            item.product.name,
        )

    return (len(errors) == 0, errors)
