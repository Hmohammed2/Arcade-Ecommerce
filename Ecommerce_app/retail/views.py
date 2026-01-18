import logging
from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import api_view, action, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly , IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Category, Product, Order, Payment, Coupon, Bundle
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    OrderSerializer,
    PaymentSerializer,
    BundleDetailSerializer,
    BundleListSerializer,
)
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from .services.payment_service import PaymentService
from .facades.stripe_facade import StripePaymentFacade
from .facades.paypal_facade import PayPalFacade

# Configure logger
logger = logging.getLogger(__name__)

# Categories
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"  # so you can fetch by /categories/sticks/
    permission_classes = [permissions.AllowAny]  # 👈 public endpoint

# Products
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.select_related("category").order_by("-created_at")
    serializer_class = ProductSerializer
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description"]
    permission_classes = [permissions.AllowAny]  # 👈 public endpoint

# Bundles
class BundleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Bundle.objects.filter(is_active=True)
        .prefetch_related(
            "items__product",
            "options__values",          # 👈 NEW
            "components__product",      # optional but useful later
            "components__variant",
        )
        .order_by("sort_order", "name")
    )

    permission_classes = [AllowAny]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "short_description", "description"]

    def get_serializer_class(self):
        if self.action == "list":
            return BundleListSerializer
        return BundleDetailSerializer

# Orders
class OrderViewSet(viewsets.ModelViewSet):
    """
    Handles both authenticated and guest order access:
    - Authenticated users see their own orders.
    - Guests can fetch a specific order via ?email=... (GET only).
    - Staff/admin users can view all orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "id"  # keep internal only

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Order.objects.all().order_by("-created_at")
        if user.is_authenticated:
            return Order.objects.filter(user=user).order_by("-created_at")
        return Order.objects.none()

    def retrieve(self, request, *args, **kwargs):
        order = self.get_object()
        if request.user.is_staff or order.user == request.user:
            return Response(self.get_serializer(order).data)
        return Response({"error": "Not found."}, status=404)

    @action(detail=False, methods=["get"], url_path=r"lookup/(?P<public_id>[^/.]+)", permission_classes=[AllowAny])
    def lookup(self, request, public_id=None):
        email = request.query_params.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=400)

        order = get_object_or_404(Order, public_id=public_id)

        if order.email.lower() != email.lower():
            return Response({"error": "Order not found."}, status=404)

        return Response(self.get_serializer(order).data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def history(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-created_at")
        return Response(self.get_serializer(orders, many=True).data)
    
# Payments
class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def create_payment_intent(request):
    """
    Create Stripe PaymentIntent for an order
    """
    try:
        data = request.data
        order_id = data.get("order_id")
        logger.info(f"[Stripe] Creating PaymentIntent for order {order_id}")

        order = Order.objects.get(id=order_id)
        amount = int(order.total_price * 100)

        intent_data = StripePaymentFacade.create_payment_intent(amount)
        PaymentService.create_payment_record(order, intent_data["id"], amount)

        logger.info(
            f"[Stripe] PaymentIntent created successfully for order {order_id}, intent_id={intent_data['id']}"
        )
        return Response(intent_data, status=status.HTTP_200_OK)

    except Order.DoesNotExist:
        logger.error(f"[Stripe] Order not found: {order_id}")
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception("[Stripe] Failed to create PaymentIntent")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(["POST"])  # 👈 add this line
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Stripe webhook
    """
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    logger.info("[Stripe] Webhook received")

    try:
        event = StripePaymentFacade.handle_webhook_event(payload, sig_header)
        logger.info(f"[Stripe] Webhook event parsed: {event['type']}")
    except ValueError as e:
        logger.error(f"[Stripe] Invalid payload: {str(e)}")
        return HttpResponse(status=400)
    except Exception as e:
        logger.exception("[Stripe] Webhook signature verification failed")
        return HttpResponse(status=400)

    try:
        if event["type"] == "payment_intent.succeeded":
            logger.info(f"[Stripe] Payment succeeded: {event['data']['object']['id']}")
            PaymentService.mark_payment_succeeded(event["data"]["object"])
        elif event["type"] == "payment_intent.payment_failed":
            logger.warning(f"[Stripe] Payment failed: {event['data']['object']['id']}")
            PaymentService.mark_payment_failed(event["data"]["object"])
        else:
            logger.info(f"[Stripe] Ignored event type: {event['type']}")
    except Exception as e:
        logger.exception("[Stripe] Error handling webhook event")
        return HttpResponse(status=500)

    return HttpResponse(status=200)


@csrf_exempt
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
def checkout(request):
    
    """
    Create Order + PaymentIntent
    """
    try:
        user = request.user if request.user.is_authenticated else None
        data = request.data

        items = data.get("items", [])
        email = data.get("email")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        phone = data.get("phone", "")
        delivery_method = data.get("delivery_method", "standard")

        if not items:
            logger.warning("[Checkout] No items provided")
            return Response({"error": "No items provided"}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"[Checkout] Creating order + PaymentIntent for user={user} email={email}")
        
        coupon_code = data.get("coupon_code")

        result = PaymentService.create_order_and_payment(
            user=user,
            items=items,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            delivery_method=delivery_method,
            coupon_code=coupon_code
        )

        logger.info(
            f"[Checkout] Order {result['order_id']} created with PaymentIntent {result['clientSecret']}"
        )
        return Response(result, status=status.HTTP_201_CREATED)
    
    except ValueError as e:
        # 💡 This handles stock errors and validation issues gracefully
        logger.warning(f"[Checkout] Validation error: {e}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.exception("[Checkout] Unexpected failure during order creation")
        return Response({"error": "Something went wrong during checkout."}, status=500)

@api_view(["POST"])
@permission_classes([AllowAny])
def paypal_checkout(request):
    try:
        user = request.user if request.user.is_authenticated else None
        data = request.data
        items = data.get("items", [])
        email = data.get("email")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        phone = data.get("phone", "")
        delivery_method = data.get("delivery_method", "standard")
        
        if not items:
            return Response({"error": "No items provided"}, status=400)

        result = PaymentService.create_paypal_order(
            user=user,
            items=items,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            delivery_method=delivery_method,
        )

        return Response(result, status=status.HTTP_201_CREATED)
    
    except ValueError as e:
        # 💡 This handles stock errors and validation issues gracefully
        logger.warning(f"[Checkout] Validation error: {e}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.exception("[Checkout] Unexpected failure during PayPal order creation")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([AllowAny])
def paypal_capture(request):
    """
    Capture a PayPal order after user approval.
    Verifies payment and updates local order/payment status.
    """
    try:
        order_id = request.data.get("order_id")
        if not order_id:
            return Response({"error": "Missing order_id"}, status=status.HTTP_400_BAD_REQUEST)

        # 🧩 Step 1: Capture the payment via PayPal
        capture_data = PayPalFacade.capture_order(order_id)

        if capture_data.get("status") in ["COMPLETED", "captured"]:
            payer = capture_data.get("payer", {})
            paypal_email = payer.get("email_address")

            # Attach email to your Order if it was missing
            payment = Payment.objects.get(stripe_payment_intent=order_id)
            order = payment.order

            if not order.email and paypal_email:
                order.email = paypal_email
                order.save(update_fields=["email"])
            
            # 🧩 Step 2: Mark payment succeeded in our database
            PaymentService.mark_paypal_payment_succeeded(order_id)

            return Response(
                {
                    "id": capture_data.get("id"),
                    "order_public_id": str(order.public_id), 
                    "status": capture_data.get("status"),
                    "payer": capture_data.get("payer", {}),
                    "amount": capture_data.get("purchase_units", [{}])[0]
                    .get("payments", {})
                    .get("captures", [{}])[0]
                    .get("amount", {}),
                    "message": "PayPal payment captured successfully.",
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": "Payment not completed", "details": capture_data},
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["POST"])
@permission_classes([AllowAny])
def validate_coupon(request):
    """
    Validates a coupon code and returns its discount if valid.
    """
    code = request.data.get("code", "").strip()
    email = request.data.get("email", "").strip()

    if not code or not email:
        return Response({"error": "Code and email are required."}, status=400)

    try:
        coupon = Coupon.objects.get(code__iexact=code)
    except Coupon.DoesNotExist:
        return Response({"valid": False, "message": "Invalid coupon code."}, status=404)

    if coupon.is_valid_for_user(email):
        return Response({
            "valid": True,
            "discount_percent": coupon.discount_percent,
            "message": f"{coupon.discount_percent}% discount applied!",
        })
    else:
        return Response({
            "valid": False,
            "message": "Coupon not valid for this account or expired.",
        }, status=400)

