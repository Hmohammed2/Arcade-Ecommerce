from __future__ import annotations

from decimal import Decimal
from typing import Iterable, Tuple

from django.conf import settings
from django.db import models
from django.db.models import F, Sum
from django.utils import timezone
from django.utils.text import slugify
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


# -----------------------
# Catalog
# -----------------------

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ("name",)
        indexes = [models.Index(fields=("slug",))]

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    description = models.TextField(blank=True)
    overview = models.TextField(blank=True)
    # e.g. ["Low latency"] or [{"label":"Shell","value":"Aluminum"}]
    features = models.JSONField(blank=True, default=list)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    short_description = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)

    # Base stock for non-variant products. If variants exist, this is kept in sync
    # with the sum of variant stocks (see signals below).
    stock = models.PositiveIntegerField(default=0, help_text="If variants exist, this mirrors total of variant stock.")
    image = models.ImageField(upload_to="products/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        indexes = [
            models.Index(fields=("slug",)),
            models.Index(fields=("is_featured", "is_new")),
        ]

    def __str__(self) -> str:
        return f"{self.name} — £{self.price} — Stock: {self.stock}"

    @property
    def total_stock(self) -> int:
        """
        If there are variants, return the sum of all variant stock.
        Otherwise, return product stock.
        """
        qs = self.variants.all()
        if qs.exists():
            return qs.aggregate(total=Sum("stock"))["total"] or 0
        return self.stock

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/gallery/")
    alt_text = models.CharField(max_length=255, blank=True)
    colour = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Optional: if set, this image is used for the matching colour variant."
    )

    class Meta:
        ordering = ("id",)

    def __str__(self) -> str:
        return f"{self.product.name} Image"


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    colour = models.CharField(max_length=50)
    stock = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("product", "colour")
        ordering = ("product", "colour")
        indexes = [models.Index(fields=("product", "colour"))]

    def __str__(self) -> str:
        return f"{self.product.name} ({self.colour}) — Stock: {self.stock}"


# Keep Product.stock in sync with the sum of variant stock (if variants exist)
@receiver(post_save, sender=ProductVariant)
@receiver(post_delete, sender=ProductVariant)
def sync_product_stock_from_variants(sender, instance: ProductVariant, **kwargs):
    product = instance.product
    total = product.variants.aggregate(total=Sum("stock"))["total"] or 0
    product.stock = total
    product.save(update_fields=["stock"])


# -----------------------
# Orders & payments
# -----------------------

class Order(models.Model):
    class Status:
        PENDING = "pending"
        PROCESSING = "processing"
        SHIPPED = "shipped"
        DELIVERED = "delivered"
        CANCELLED = "cancelled"
        CHOICES = (
            (PENDING, "Pending"),
            (PROCESSING, "Processing"),
            (SHIPPED, "Shipped"),
            (DELIVERED, "Delivered"),
            (CANCELLED, "Cancelled"),
        )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name="orders")
    email = models.EmailField()
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)

    status = models.CharField(max_length=20, choices=Status.CHOICES, default=Status.PENDING)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))

    coupon = models.ForeignKey("Coupon", on_delete=models.SET_NULL, null=True, blank=True)

    delivery_method = models.CharField(
        max_length=20,
        choices=[("standard", "Standard"), ("express", "Express")],
        default="standard",
    )
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal("0.00"))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=("status", "created_at"))]

    def __str__(self) -> str:
        return f"Order #{self.id} — {self.first_name} {self.last_name} — {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    colour = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ("id",)
        indexes = [models.Index(fields=("order", "product"))]

    def __str__(self) -> str:
        base = f"{self.quantity} × {self.product.name}"
        if self.colour:
            base += f" ({self.colour})"
        return f"{base} — Order #{self.order.id}"


class Payment(models.Model):
    class Status:
        PENDING = "pending"
        PROCESSING = "processing"
        ON_HOLD = "on_hold"
        SUCCEEDED = "succeeded"
        FAILED = "failed"
        REFUNDED = "refunded"
        CHOICES = (
            (PENDING, "Pending"),
            (PROCESSING, "Processing"),
            (ON_HOLD, "On Hold"),
            (SUCCEEDED, "Succeeded"),
            (FAILED, "Failed"),
            (REFUNDED, "Refunded"),
        )

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    stripe_payment_intent = models.CharField(max_length=255, unique=True)
    stripe_charge_id = models.CharField(max_length=255, blank=True, null=True)

    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    currency = models.CharField(max_length=10, default="GBP")

    status = models.CharField(max_length=20, choices=Status.CHOICES, default=Status.PENDING)
    payment_method = models.CharField(max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=("status", "created_at"))]

    def __str__(self) -> str:
        return f"Payment {self.stripe_payment_intent} — {self.status} — Order #{self.order.id}"


# -----------------------
# Coupons
# -----------------------

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])

    # Active window & limits
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)

    # Whitelist list (empty = public). Keep JSON for easy admin entry.
    whitelisted_emails = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ("-valid_from", "code")
        indexes = [models.Index(fields=("code",))]

    def __str__(self) -> str:
        return f"{self.code} ({self.discount_percent}% off)"

    def _now_valid(self) -> bool:
        now = timezone.now()
        if self.valid_from and now < self.valid_from:
            return False
        if self.valid_to and now > self.valid_to:
            return False
        return True

    def _email_allowed(self, email: str | None) -> bool:
        if not self.whitelisted_emails:
            # No whitelist → treat as public
            return True
        if not email:
            return False
        wl = {e.lower() for e in self.whitelisted_emails if isinstance(e, str) and e.strip()}
        return email.lower() in wl

    def is_valid_for_user(self, email: str | None) -> bool:
        """
        True if:
        - Coupon active and within dates
        - Under global usage cap
        - Email is allowed (public or whitelisted)
        - Not already used by this email (CouponUsage)
        """
        if not self.is_active or not self._now_valid():
            return False
        if self.usage_limit is not None and self.usage_count >= self.usage_limit:
            return False
        if not self._email_allowed(email):
            return False
        if email and CouponUsage.objects.filter(coupon=self, email__iexact=email).exists():
            return False
        return True


class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name="usages")
    email = models.EmailField()
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("coupon", "email")
        ordering = ("-used_at",)
        indexes = [models.Index(fields=("coupon", "email"))]

    def __str__(self) -> str:
        return f"{self.email} used {self.coupon.code}"
