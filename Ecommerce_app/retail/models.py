from __future__ import annotations

from decimal import Decimal
import uuid
import secrets

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F, Sum
from django.utils import timezone
from django.utils.text import slugify
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.exceptions import ValidationError


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
    features = models.JSONField(blank=True, default=list)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    short_description = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)

    # If variants exist, this mirrors total variant stock (kept in sync via signals)
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


@receiver(post_save, sender=ProductVariant)
@receiver(post_delete, sender=ProductVariant)
def sync_product_stock_from_variants(sender, instance: ProductVariant, **kwargs):
    product = instance.product
    total = product.variants.aggregate(total=Sum("stock"))["total"] or 0
    product.stock = total
    product.save(update_fields=["stock"])


# -----------------------
# Bundles
# -----------------------

class Bundle(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    short_description = models.TextField(blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="bundles/", blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    # Pricing control
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percent = models.PositiveIntegerField(default=0)  # 0-100

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("sort_order", "name")
        indexes = [
            models.Index(fields=("slug",)),
            models.Index(fields=("is_active", "is_featured", "sort_order")),
        ]

    def __str__(self) -> str:
        return f"{self.name} — £{self.price}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def components_total(self) -> Decimal:
        total = Decimal("0.00")
        for item in self.items.select_related("product"):
            total += (item.product.price * item.quantity)
        return total

    @property
    def price(self) -> Decimal:
        """
        Effective bundle price:
        - price_override wins if set
        - otherwise apply discount_percent to computed component total
        """
        if self.price_override is not None:
            return self.price_override.quantize(Decimal("0.01"))
        discounted = (self.components_total * (Decimal(100) - Decimal(self.discount_percent)) / Decimal(100))
        return discounted.quantize(Decimal("0.01"))

    @property
    def max_available(self) -> int:
        """
        Maximum number of bundles you can sell based on the lowest-stock component.
        Safe for empty bundles (returns 0).
        """
        items = list(self.items.select_related("product"))
        if not items:
            return 0
        return min((item.product.total_stock // item.quantity) for item in items)

    @property
    def is_in_stock(self) -> bool:
        return self.max_available > 0


class BundleItem(models.Model):
    bundle = models.ForeignKey(Bundle, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        unique_together = ("bundle", "product")
        ordering = ("bundle", "product")
        indexes = [models.Index(fields=("bundle", "product"))]

    def __str__(self) -> str:
        return f"{self.quantity} × {self.product.name} in {self.bundle.name}"


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

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="orders",
    )
    email = models.EmailField()
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)

    status = models.CharField(max_length=20, choices=Status.CHOICES, default=Status.PENDING)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    public_id = models.UUIDField(editable=False, default=uuid.uuid4, unique=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    status_changed_at = models.DateTimeField(null=True, blank=True)
    coupon = models.ForeignKey("Coupon", on_delete=models.SET_NULL, null=True, blank=True)
    review_token = models.CharField(
        max_length=64,
        unique=True,
        null=True,
        blank=True,
        editable=False
    )

    def save(self, *args, **kwargs):
        if not self.review_token:
            self.review_token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)

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

    def save(self, *args, **kwargs):
        if self.pk:
            old = Order.objects.get(pk=self.pk)
            if old.status != self.status:
                self.status_changed_at = timezone.now()
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """
    Represents either:
    - a Product line item, OR
    - a Bundle line item

    Exactly one of (product, bundle) must be set.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    bundle = models.ForeignKey(Bundle, on_delete=models.CASCADE, null=True, blank=True)

    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    colour = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ("id",)
        indexes = [
            models.Index(fields=("order", "product")),
            models.Index(fields=("order", "bundle")),
        ]

    def clean(self):
        # XOR check: one and only one must be set
        if bool(self.product) == bool(self.bundle):
            raise ValidationError("OrderItem must have either product OR bundle (not both).")

        # Colour should only apply to product line items
        if self.colour and not self.product:
            raise ValidationError("Colour can only be set when OrderItem.product is set.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        if self.bundle:
            return f"{self.quantity} × [BUNDLE] {self.bundle.name} — Order #{self.order.id}"
        base = f"{self.quantity} × {self.product.name if self.product else 'Unknown Product'}"
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

    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)

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
            return True
        if not email:
            return False
        wl = {e.lower() for e in self.whitelisted_emails if isinstance(e, str) and e.strip()}
        return email.lower() in wl

    def is_valid_for_user(self, email: str | None) -> bool:
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
