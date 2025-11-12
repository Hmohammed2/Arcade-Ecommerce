from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name
    
class ProductImage(models.Model):
    product = models.ForeignKey(
        'Product', on_delete=models.CASCADE, related_name='images'
    )
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.product.name} Image"

class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    description = models.TextField(blank=True)
    overview = models.TextField(blank=True)  # rich/long form description
    features = models.JSONField(blank=True, default=list)  # e.g. ["Low latency", ...] or [{"label":"Shell","value":"Aluminum"}]
    price = models.DecimalField(max_digits=10, decimal_places=2)
    short_description = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.name} - {self.category.name} - £{self.price} - Stock: {self.stock}'
    
    @property
    def total_stock(self):
        """
        Returns:
            - the product's own stock if there are no variants
            - otherwise, the sum of all variant stock
        """
        variants = self.variants.all()
        if variants.exists():
            return sum(v.stock for v in variants)
        return self.stock

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    colour = models.CharField(max_length=50)
    stock = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("product", "colour")

    def __str__(self):
        return f"{self.product.name} ({self.colour}) - Stock: {self.stock}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_product_stock()

    def delete(self, *args, **kwargs):
        product = self.product
        super().delete(*args, **kwargs)
        product.stock = sum(v.stock for v in product.variants.all()) or product.stock
        product.save(update_fields=['stock'])
    
    def update_product_stock(self):
        product = self.product
        total = sum(v.stock for v in product.variants.all())
        product.stock = total
        product.save(update_fields=['stock'])

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="orders")
    email = models.EmailField()  # required for guests
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    coupon = models.ForeignKey('Coupon', on_delete=models.SET_NULL, null=True, blank=True)
    delivery_method = models.CharField(
        max_length=20,
        choices=[("standard", "Standard"), ("express", "Express")],
        default="standard",
    )
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal("0.00"))

    def __str__(self):
        return f"Order #{self.id} by {self.first_name} {self.last_name} - {self.status}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    colour = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        base = f"{self.quantity} x {self.product.name}"
        if self.colour:
            base += f" ({self.colour})"
        return f"{base} — Order #{self.order.id}"

class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    stripe_payment_intent = models.CharField(max_length=255, unique=True)
    stripe_charge_id = models.CharField(max_length=255, blank=True, null=True)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="GBP")

    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("processing", "Processing"),
            ("on_hold", "On Hold"),
            ("succeeded", "Succeeded"),
            ("failed", "Failed"),
            ("refunded", "Refunded"),
        ],
        default="pending",
    )

    payment_method = models.CharField(max_length=50, blank=True, null=True)  # e.g. "card"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.stripe_payment_intent} - {self.status}. Order ID: #{self.order.id}"

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    whitelisted_emails = models.JSONField(default=list, blank=True)  # list of allowed emails

    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.code} ({self.discount_percent}% off)"

    def is_valid_for_user(self, email):
        """Return True if this coupon can be used by this email."""
        from django.utils import timezone

        now = timezone.now()
        if not self.is_active:
            return False
        if self.valid_from and now < self.valid_from:
            return False
        if self.valid_to and now > self.valid_to:
            return False
        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False
        if self.whitelisted_emails and email.lower() not in [e.lower() for e in self.whitelisted_emails]:
            return False
            # Has this email already used it?
        if CouponUsage.objects.filter(coupon=self, email__iexact=email).exists():
            return False
    
        return True

class CouponUsage(models.Model):
    coupon = models.ForeignKey('Coupon', on_delete=models.CASCADE, related_name='usages')
    email = models.EmailField()
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('coupon', 'email')

    def __str__(self):
        return f"{self.email} used {self.coupon.code}"