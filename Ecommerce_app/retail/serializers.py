from rest_framework import serializers

from .models import Category, Product, Order, OrderItem, Payment, ProductImage, ProductVariant

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text"]

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


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "price", "colour"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "status",
            "total_price",
            "delivery_method",
            "delivery_fee",
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
