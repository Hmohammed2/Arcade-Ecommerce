from rest_framework import serializers

from .models import Category, Product, Order, OrderItem, Payment, ProductImage, ProductVariant, BundleItem, Bundle, BundleOption, BundleOptionValue, BundleComponent

# Option, BundleOptionValue, BundleComponent
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]

# Product Serializers

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "colour"]

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["id", "colour", "stock"]

class ProductMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "slug", "price", "image"]

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    frequently_bought_together = ProductMiniSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
    
    def get_image(self, obj):
        # If there's an image, return its relative path like "/media/..."
        if obj.image:
            return obj.image.url  # this is relative to MEDIA_URL
        return None

# Bundle Serializers

class BundleListSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    max_available = serializers.IntegerField(read_only=True)

    class Meta:
        model = Bundle
        fields = [
            "id",
            "name",
            "slug",
            "short_description",
            "image",
            "price",
            "is_featured",
            "is_in_stock",
            "max_available",
        ]

class BundleItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()

    class Meta:
        model = BundleItem
        fields = ("product", "quantity")

    def get_product(self, obj):
        p = obj.product
        return {
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "price": str(p.price),
            "image": p.image.url if p.image else None,
        }
        
class BundleOptionValueSerializer(serializers.ModelSerializer):
    variant_id = serializers.SerializerMethodField()

    class Meta:
        model = BundleOptionValue
        fields = ["id", "label", "colour_hex", "variant_id"]

    def get_variant_id(self, obj):
        comp = BundleComponent.objects.filter(option_value=obj).first()
        return comp.variant_id if comp else None

class BundleOptionSerializer(serializers.ModelSerializer):
    values = BundleOptionValueSerializer(many=True, read_only=True)

    class Meta:
        model = BundleOption
        fields = ("id", "name", "required", "values")

class BundleDetailSerializer(serializers.ModelSerializer):
    items = BundleItemSerializer(many=True, read_only=True)
    options = BundleOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Bundle
        fields = (
            "id",
            "name",
            "slug",
            "short_description",
            "description",
            "image",
            "price",
            "discount_percent",
            "is_in_stock",
            "max_available",
            "items",
            "options",
        )

# Order Serializers

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    bundle = BundleListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "bundle", "quantity", "price", "colour"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    id = serializers.UUIDField(source="public_id", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "status",
            "total_price",
            "shipping_method_id",
            "shipping_name",
            "shipping_method_name",
            "shipping_cost",
            "review_token",
            "coupon",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]


class PaymentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "stripe_payment_intent",
            "stripe_charge_id",
            "amount",
            "currency",
            "status",
            "payment_method",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
        
