from rest_framework import serializers
from .models import Category, Product, Order, OrderItem, Payment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "colours",
            "description",
            "overview",
            "features",
            "price",
            "stock",
            "image",
            "created_at",
            "updated_at",
        ]
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
