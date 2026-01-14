from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from retail.models import Order

# Create your models here.

class Review(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="reviews")
    order_public_id = models.CharField(max_length=64, db_index=True)

    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=120, blank=True)
    body = models.TextField(max_length=2000)

    display_name = models.CharField(max_length=80, blank=True)
    email = models.EmailField(blank=True)

    consent_to_publish_name = models.BooleanField(default=True)

    verified_purchase = models.BooleanField(default=True)  # because they came from order link
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    # anti-abuse / auditing
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["order_public_id"]),
            models.Index(fields=["status", "created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review {self.rating}/5 for {self.order_public_id}"