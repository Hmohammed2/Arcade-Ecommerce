# reviews/serializers.py
from rest_framework import serializers
from .models import Review


class ReviewSubmitSerializer(serializers.Serializer):
    order_public_id = serializers.CharField(max_length=64)
    token = serializers.CharField(required=False, allow_blank=True, max_length=255)

    rating = serializers.IntegerField(min_value=1, max_value=5)
    title = serializers.CharField(required=False, allow_blank=True, max_length=120)
    body = serializers.CharField(max_length=2000)

    display_name = serializers.CharField(required=False, allow_blank=True, max_length=80)
    email = serializers.EmailField(required=False, allow_blank=True)

    consent_to_publish_name = serializers.BooleanField(required=False, default=True)


class ReviewPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            "rating",
            "title",
            "body",
            "display_name",
            "consent_to_publish_name",
            "verified_purchase",
            "created_at",
        ]
