from retail.models import Order, OrderItem, Product, Bundle, BundleOptionValue
import logging

logger = logging.getLogger(__name__)


def build_order_items_from_payload(order: Order, items: list[dict]) -> None:
    """
    Create OrderItem rows from checkout payload.
    - Products: 1 row per product line
    - Bundles: EXPAND into multiple rows per colour + quantity
    """

    for item in items:

        # =========================
        # CASE 1 — SIMPLE PRODUCT
        # =========================
        if item["type"] == "product":

            product = Product.objects.get(id=item["product_id"])

            OrderItem.objects.create(
                order=order,
                product_id=item["product_id"],
                colour=item.get("colour"),
                quantity=item["quantity"],
                price=product.price,
            )

            logger.debug(
                "Created OrderItem for PRODUCT | product_id=%s | colour=%s | qty=%s | price=%s",
                item["product_id"],
                item.get("colour"),
                item["quantity"],
                product.price,
            )

        # =========================
        # CASE 2 — BUNDLE (EXPAND)
        # =========================
        elif item["type"] == "bundle":

            bundle = Bundle.objects.get(id=item["bundle_id"])
            option_values = item.get("option_values") or {}

            # If no options were chosen, still create ONE bundle row
            if not option_values:
                OrderItem.objects.create(
                    order=order,
                    bundle=bundle,
                    bundle_option_value=None,
                    quantity=item["quantity"],
                    price=bundle.price,
                )

                logger.debug(
                    "Created SIMPLE Bundle OrderItem | bundle_id=%s | qty=%s | NO OPTIONS",
                    item["bundle_id"],
                    item["quantity"],
                )
                continue

            # Otherwise → EXPAND per colour + quantity
            bundle = Bundle.objects.get(id=item["bundle_id"])
            option_values = item.get("option_values") or {}

            OrderItem.objects.create(
                order=order,
                bundle=bundle,
                quantity=item["quantity"],              # ✅ number of KITS
                bundle_options_meta=option_values,     # ✅ store breakdown
                price=bundle.price,
            )

            logger.debug(
                "Created BUNDLE OrderItem | bundle_id=%s | kits=%s | options=%s | price=%s",
                item["bundle_id"],
                item["quantity"],
                option_values,
                bundle.price,
            )
        else:
            logger.error("Unknown item type in payload: %s", item.get("type"))
            raise ValueError(f"Unknown item type: {item.get('type')}")

