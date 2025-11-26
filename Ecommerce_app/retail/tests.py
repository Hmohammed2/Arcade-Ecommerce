from django.contrib.auth.models import User
from django.urls import reverse
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from django.utils import timezone

from .models import (
    Category,
    Product,
    Order,
    OrderItem,
    Payment,
    ProductVariant,
    Coupon,
    CouponUsage,
)


class CategoryProductTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Sticks", slug="sticks")
        self.product = Product.objects.create(
            name="Sanwa Joystick",
            slug="sanwa-joystick",
            category=self.category,
            description="High quality Sanwa arcade stick",
            price="29.99",
            stock=10,
        )

    def test_list_categories(self):
        url = reverse("category-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["name"], "Sticks")

    def test_list_products(self):
        url = reverse("product-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["name"], "Sanwa Joystick")

    def test_get_single_product(self):
        url = reverse("product-detail", args=[self.product.slug])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], "sanwa-joystick")


class OrderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.login(username="testuser", password="testpass")

        self.category = Category.objects.create(name="Buttons", slug="buttons")
        self.product = Product.objects.create(
            name="Seimitsu Button",
            slug="seimitsu-button",
            category=self.category,
            description="Arcade pushbutton",
            price="3.50",
            stock=50,
        )

    def test_create_order(self):
        url = reverse("order-list")
        data = {
            "items": [
                {
                    "product": self.product.id,
                    "quantity": 2,
                    "price": "7.00",
                }
            ],
            "total_price": "7.00",
        }
        response = self.client.post(url, data, format="json")
        # Since OrderSerializer is read-only for items, this may need tweaking if you allow POST
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(
            OrderItem.objects.count(), 0
        )  # unless you wire in item creation

    def test_list_orders(self):
        Order.objects.create(user=self.user, total_price="15.00")
        url = reverse("order-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class PaymentTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="payuser", password="paypass")
        self.client.login(username="payuser", password="paypass")

        self.order = Order.objects.create(user=self.user, total_price="29.99")
        self.payment = Payment.objects.create(
            order=self.order,
            stripe_payment_intent="pi_test_123",
            amount="29.99",
            currency="GBP",
            status="pending",
            payment_method="card",
        )

    def test_list_payments(self):
        url = reverse("payment-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[0]["stripe_payment_intent"], "pi_test_123"
        )

    def test_payment_detail(self):
        url = reverse("payment-detail", args=[self.payment.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "pending")


# ============================
# Model-level tests
# ============================

class ProductStockTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Arcade", slug="arcade")

    def test_variant_stock_sync_create_update_delete(self):
        product = Product.objects.create(
            name="Test Stick",
            slug="test-stick",
            category=self.category,
            price=Decimal("10.00"),
            stock=0,
        )

        # Initially: no variants, stock as set
        self.assertEqual(product.stock, 0)
        self.assertEqual(product.total_stock, 0)

        # Create two variants -> product.stock should be sum via variant save()
        v1 = ProductVariant.objects.create(product=product, colour="Red", stock=3)
        v2 = ProductVariant.objects.create(product=product, colour="Blue", stock=5)

        product.refresh_from_db()
        self.assertEqual(product.stock, 8)
        self.assertEqual(product.total_stock, 8)

        # Update a variant
        v1.stock = 10
        v1.save()
        product.refresh_from_db()
        self.assertEqual(product.stock, 15)
        self.assertEqual(product.total_stock, 15)

        # Delete a variant
        v2.delete()
        product.refresh_from_db()
        self.assertEqual(product.stock, 10)
        self.assertEqual(product.total_stock, 10)

    def test_total_stock_without_variants_uses_product_stock(self):
        product = Product.objects.create(
            name="No Variant Stick",
            slug="no-variant-stick",
            category=self.category,
            price=Decimal("15.00"),
            stock=7,
        )

        # No variants -> total_stock == product.stock
        self.assertEqual(product.total_stock, 7)

        # Once a variant is added, the ProductVariant.save() should sync stock
        ProductVariant.objects.create(product=product, colour="Black", stock=2)
        product.refresh_from_db()
        self.assertEqual(product.stock, 2)
        self.assertEqual(product.total_stock, 2)


class CouponModelTests(TestCase):
    def test_public_coupon_valid_for_any_email(self):
        coupon = Coupon.objects.create(
            code="BLACKFRIDAY",
            discount_percent=25,
            is_active=True,
            valid_from=timezone.now() - timezone.timedelta(days=1),
            valid_to=timezone.now() + timezone.timedelta(days=1),
            usage_limit=None,
            usage_count=0,
            whitelisted_emails=[],  # public behaviour
        )

        # Any email should be valid if not yet used
        self.assertTrue(coupon.is_valid_for_user("user@example.com"))
        # For public coupons, even no email should not be blocked by whitelist logic
        self.assertTrue(coupon.is_valid_for_user(None))

    def test_coupon_whitelist_enforced(self):
        coupon = Coupon.objects.create(
            code="VIPONLY",
            discount_percent=20,
            is_active=True,
            valid_from=timezone.now() - timezone.timedelta(days=1),
            valid_to=timezone.now() + timezone.timedelta(days=1),
            whitelisted_emails=["vip@domain.com", "member@domain.com"],
        )

        self.assertTrue(coupon.is_valid_for_user("vip@domain.com"))
        self.assertTrue(coupon.is_valid_for_user("VIP@DOMAIN.COM"))  # case-insensitive
        self.assertFalse(coupon.is_valid_for_user("other@domain.com"))
        self.assertFalse(coupon.is_valid_for_user(None))

    def test_coupon_one_time_per_email_enforced_by_usage(self):
        coupon = Coupon.objects.create(
            code="ONEUSE",
            discount_percent=10,
            is_active=True,
            valid_from=timezone.now() - timezone.timedelta(hours=1),
            valid_to=timezone.now() + timezone.timedelta(hours=1),
            whitelisted_emails=[],
        )
        email = "buyer@example.com"

        # First time is valid
        self.assertTrue(coupon.is_valid_for_user(email))

        # Simulate that this user has used it (as PaymentService would record)
        CouponUsage.objects.create(coupon=coupon, email=email)

        # Now should be invalid
        self.assertFalse(coupon.is_valid_for_user(email))

    def test_coupon_global_usage_limit(self):
        coupon = Coupon.objects.create(
            code="LIMITED",
            discount_percent=15,
            is_active=True,
            valid_from=timezone.now() - timezone.timedelta(days=1),
            valid_to=timezone.now() + timezone.timedelta(days=1),
            usage_limit=2,
            usage_count=0,
            whitelisted_emails=[],
        )

        # While usage_count < usage_limit -> valid
        self.assertTrue(coupon.is_valid_for_user("a@a.com"))

        coupon.usage_count = 1
        coupon.save(update_fields=["usage_count"])
        self.assertTrue(coupon.is_valid_for_user("b@b.com"))

        # Once usage_count >= usage_limit -> invalid
        coupon.usage_count = 2
        coupon.save(update_fields=["usage_count"])
        self.assertFalse(coupon.is_valid_for_user("c@c.com"))

    def test_coupon_date_window_and_active_flag(self):
        future_coupon = Coupon.objects.create(
            code="FUTURE",
            discount_percent=10,
            is_active=True,
            valid_from=timezone.now() + timezone.timedelta(days=1),
            valid_to=timezone.now() + timezone.timedelta(days=2),
            whitelisted_emails=[],
        )
        self.assertFalse(future_coupon.is_valid_for_user("x@y.com"))

        past_coupon = Coupon.objects.create(
            code="PAST",
            discount_percent=10,
            is_active=True,
            valid_from=timezone.now() - timezone.timedelta(days=3),
            valid_to=timezone.now() - timezone.timedelta(days=1),
            whitelisted_emails=[],
        )
        self.assertFalse(past_coupon.is_valid_for_user("x@y.com"))

        inactive_coupon = Coupon.objects.create(
            code="INACTIVE",
            discount_percent=10,
            is_active=False,
            valid_from=timezone.now() - timezone.timedelta(days=1),
            valid_to=timezone.now() + timezone.timedelta(days=1),
            whitelisted_emails=[],
        )
        self.assertFalse(inactive_coupon.is_valid_for_user("x@y.com"))
