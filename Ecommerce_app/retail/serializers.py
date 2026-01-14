from rest_framework import serializers

from .models import Category, Product, Order, OrderItem, Payment, ProductImage, ProductVariant, BundleItem, Bundle

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "colour"]

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["id", "colour", "stock"]

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
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
    product = ProductSerializer(read_only=True)

    class Meta:
        model = BundleItem
        fields = ["product", "quantity"]

class BundleDetailSerializer(serializers.ModelSerializer):
    items = BundleItemSerializer(many=True, read_only=True)
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
            "description",
            "image",
            "price",
            "discount_percent",
            "is_in_stock",
            "max_available",
            "items",
        ]

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
            "delivery_method",
            "delivery_fee",
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
        
