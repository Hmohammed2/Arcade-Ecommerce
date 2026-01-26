from decimal import Decimal
from retail.models import Product

def calculate_cart_subtotal(items: list[dict]) -> Decimal:
    subtotal = Decimal("0.00")

    for item in items:
        product_id = item.get("product_id")
        quantity = int(item.get("quantity", 1))

        if not product_id or quantity <= 0:
            raise ValueError("Invalid cart item")

        product = Product.objects.get(id=product_id)
        subtotal += product.price * quantity

    return subtotal
