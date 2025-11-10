from django.db import models
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_reset_tokens")
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at

    @classmethod
    def create_token(cls, user):
        """Generates a secure, time-limited reset token for the given user."""
        token = get_random_string(length=48)
        expires_at = timezone.now() + timedelta(hours=1)  # token valid for 1 hour
        return cls.objects.create(user=user, token=token, expires_at=expires_at)

    def __str__(self):
        return f"PasswordResetToken(user={self.user.email}, expires_at={self.expires_at})"

class UserAddress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="address")

    # Billing fields
    billing_first_name = models.CharField(max_length=100, blank=True, null=True)
    billing_last_name = models.CharField(max_length=100, blank=True, null=True)
    billing_email = models.EmailField(blank=True, null=True)
    billing_phone = models.CharField(max_length=20, blank=True, null=True)
    billing_address1 = models.CharField(max_length=255, blank=True, null=True)
    billing_address2 = models.CharField(max_length=255, blank=True, null=True)
    billing_city = models.CharField(max_length=100, blank=True, null=True)
    billing_postcode = models.CharField(max_length=20, blank=True, null=True)
    billing_country = models.CharField(max_length=100, default="United Kingdom")

    # Shipping fields
    same_as_billing = models.BooleanField(default=False)
    shipping_address1 = models.CharField(max_length=255, blank=True, null=True)
    shipping_address2 = models.CharField(max_length=255, blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True, null=True)
    shipping_postcode = models.CharField(max_length=20, blank=True, null=True)
    shipping_country = models.CharField(max_length=100, default="United Kingdom")

    def __str__(self):
        return f"Address for {self.user.username}"
