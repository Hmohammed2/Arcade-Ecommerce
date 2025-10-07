from django.db import models
from django.contrib.auth.models import User

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
