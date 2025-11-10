from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, OrderViewSet, PaymentViewSet, validate_coupon
from . import views

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"payments", PaymentViewSet, basename="payment")

urlpatterns = [
    path("payments/webhook/", views.stripe_webhook, name="stripe_webhook"),
    path("paypal/checkout/", views.paypal_checkout, name="paypal_checkout"),
    path("paypal/capture/", views.paypal_capture, name="paypal_capture"),
    path("coupon/validate/", validate_coupon, name="validate-coupon"),
    path("checkout/", views.checkout, name="checkout"),
    path("", include(router.urls)),
]
