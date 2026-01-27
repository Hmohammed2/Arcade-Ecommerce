import logging
from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import api_view, action, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly , IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from decimal import Decimal
from django.shortcuts import get_object_or_404
from .models import Category, Product, Order, Payment, Coupon, Bundle, NewsletterSubscriber
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
from .utils.calculate_weight import calculate_cart_weight
import requests
from django.conf import settings
from .utils.shipping import resolve_shipping_method
from .utils.calculate_subtotal import calculate_cart_subtotal
from .utils.shipping_validation import validate_shipping_address

# Configure logger
logger = logging.getLogger(__name__)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_shipping_rates(request):
    country = request.GET.get("country")
    to_postcode = request.GET.get("postcode")
    weight = float(request.GET.get("weight", 0.1))
    MIN_WEIGHT_KG = 0.1
    weight = max(weight, MIN_WEIGHT_KG) 
    from_postcode = settings.SENDCLOUD_FROM_POSTCODE

    if not country or not to_postcode or weight <= 0:
        return Response(
            {"error": "country, postcode and weight are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -------------------------
    # ENV CONFIG
    # -------------------------
    sender_address = "all" if settings.DEBUG else settings.SENDCLOUD_SENDER_ADDRESS_ID
    auth = (
        requests.auth.HTTPBasicAuth("test", "test")
        if settings.DEBUG
        else (settings.SENDCLOUD_PUBLIC_KEY, settings.SENDCLOUD_SECRET_KEY)
    )
    base_url = settings.SENDCLOUD_BASE_URL

    def fetch_methods(to_country: str):
        params = {
            "to_country": to_country,
            "to_postal_code": to_postcode,
            "from_postal_code": from_postcode,
            "sender_address": sender_address,
        }

        logger.info(
            "[Shipping] Fetching methods country=%s postcode=%s weight=%skg sender=%s",
            to_country,
            to_postcode,
            weight,
            sender_address,
        )

        return requests.get(
            f"{base_url}/shipping_methods",
            params=params,
            auth=auth,
            headers={"Accept": "application/json"},
            timeout=10,
        )

    # -------------------------
    # 1️⃣ Fetch methods
    # -------------------------
    resp = fetch_methods(country)

    if settings.DEBUG and resp.status_code in (400, 404):
        logger.warning(
            "[Shipping][DEV] No methods for %s — falling back to NL",
            country,
        )
        resp = fetch_methods("NL")

    try:
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.exception("[Shipping] Failed to fetch shipping methods")
        return Response(
            {"error": "Shipping method not available"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    shipping_methods = data.get("shipping_methods", [])
    rates = []

    # -------------------------
    # 2️⃣ Parse methods
    # -------------------------
    for method in shipping_methods:
        logger.info(
            "[Shipping][RAW] method_id=%s carrier=%s countries=%s",
            method.get("id"),
            method.get("carrier"),
            [(c.get("iso_2"), c.get("price")) for c in method.get("countries", [])],
        )

        min_w = float(method.get("min_weight", 0))
        max_w = float(method.get("max_weight", 999))

        if not (min_w <= weight <= max_w):
            continue

        countries = method.get("countries", [])

        # Exact match
        country_cfg = next(
            (c for c in countries if c.get("iso_2") == country),
            None,
        )

        # DEV fallback → NL mock
        if not country_cfg and settings.DEBUG:
            country_cfg = next(
                (c for c in countries if c.get("iso_2") == "NL"),
                None,
            )

        # PROD: do NOT silently misprice
        if not country_cfg:
            continue

        lead_hours = country_cfg.get("lead_time_hours")
        estimated_days = max(1, round(lead_hours / 24)) if lead_hours else None

        if not settings.DEBUG:
            service_name = method["name"].lower()
            
            PARCEL_KEYWORDS = (
                "small parcel",
                "medium parcel",
                "parcel",
                "tracked",
                "signed",
                "next day",
                )
            BLOCKED_KEYWORDS = (
                "letter",
                "large letter",
                "postable",
                "unstamped",
            )

            # ❌ Block letters immediately
            if any(bad in service_name for bad in BLOCKED_KEYWORDS):
                logger.info("[Shipping] Skipping letter service: %s", method["name"])
                continue

            # ✅ Must look like a parcel
            if not any(ok in service_name for ok in PARCEL_KEYWORDS):
                logger.info("[Shipping] Skipping non-parcel service: %s", method["name"])
                continue

        rates.append(
            {
                "id": str(method["id"]),
                "carrier": method["carrier"],
                "service_name": method["name"],
                "price": float(country_cfg["price"]),
                "currency": "GBP",
                "estimated_days": estimated_days,
                "service_point_required": method.get("service_point_input") == "required",
            }
        )

    rates.sort(key=lambda r: r["price"])

    logger.info(
        "[Shipping] %s valid rates returned (country=%s, weight=%skg)",
        len(rates),
        country,
        weight,
    )

    return Response({"rates": rates}, status=status.HTTP_200_OK)

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
            "options__values",          
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
    
    # -------------------------------
    # 🔗 Stripe redirect resolver
    # -------------------------------
    @action(
        detail=False,
        methods=["get"],
        url_path="by-payment-intent",
        permission_classes=[AllowAny],
    )
    def by_payment_intent(self, request):
        """
        Resolve an order from a Stripe PaymentIntent.
        Used ONLY for redirect-based payment success pages.
        """
        payment_intent = request.query_params.get("pi")

        if not payment_intent:
            return Response(
                {"error": "Missing payment_intent"},
                status=400,
            )

        payment = get_object_or_404(
            Payment,
            stripe_payment_intent=payment_intent,
        )

        order = payment.order

        return Response(
            {
                "order_public_id": str(order.public_id),
                "status": order.status,
            }
        )

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
@permission_classes([AllowAny])
def checkout(request):
    try:
        data = request.data
        items = data.get("items", [])
        shipping_method_name = data.get("shipping_method_name")

        if not items:
            return Response({"error": "No items provided"}, status=400)

        if not shipping_method_name:
            return Response({"error": "Shipping method required"}, status=400)

        # 📍 Address (required operationally)
        shipping_country = data.get("shipping_country", "GB")
        shipping_postcode = data.get("shipping_postcode")
        
        if not shipping_postcode:
            return Response({"error": "Shipping postcode required"}, status=400)
        
        # ✅ 1️⃣ Validate address consistency FIRST
        validate_shipping_address(shipping_country, shipping_postcode)

        # ⚖️ Server-side calculations (authoritative)
        total_weight = calculate_cart_weight(items)
        cart_subtotal = calculate_cart_subtotal(items)

        logger.info(
            "[Checkout] subtotal=£%s weight=%skg country=%s",
            cart_subtotal,
            total_weight,
            shipping_country,
        )

        # 🚚 Resolve shipping (single source of truth)
        shipping = resolve_shipping_method(
            method_name=shipping_method_name,
            country=shipping_country,
            cart_subtotal=cart_subtotal,
            total_weight_kg=total_weight,
        )

        # 💳 Create order + payment
        result = PaymentService.create_order_and_payment(
            user=request.user if request.user.is_authenticated else None,
            items=items,

            email=data.get("email"),
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            phone=data.get("phone", ""),

            coupon_code=data.get("coupon_code"),

            shipping_name=data.get("shipping_name"),
            shipping_address1=data.get("shipping_address1"),
            shipping_address2=data.get("shipping_address2"),
            shipping_city=data.get("shipping_city"),
            shipping_postcode=shipping_postcode,
            shipping_country=shipping_country,

            shipping_method_name=shipping_method_name,
            shipping_cost=shipping["price"],
            total_weight_kg=total_weight,
        )

        return Response(result, status=201)

    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    except Exception:
        logger.exception("[Checkout] Failed")
        return Response({"error": "Checkout failed"}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def paypal_checkout(request):
    try:
        user = request.user if request.user.is_authenticated else None
        data = request.data

        items = data.get("items", [])
        if not items:
            return Response({"error": "No items provided"}, status=400)

        shipping_method_name = data.get("shipping_method_name")
        if not shipping_method_name:
            return Response({"error": "Shipping method required"}, status=400)

        shipping_country = data.get("shipping_country", "GB")
        shipping_postcode = data.get("shipping_postcode")

        if not shipping_postcode:
            return Response({"error": "Shipping postcode required"}, status=400)
        
        # ✅ 1️⃣ Validate address consistency FIRST
        validate_shipping_address(shipping_country, shipping_postcode)

        # ⚖️ Server-side calculations
        total_weight = calculate_cart_weight(items)
        cart_subtotal = calculate_cart_subtotal(items)

        logger.info(
            "[PayPal Checkout] subtotal=£%s weight=%skg country=%s",
            cart_subtotal,
            total_weight,
            shipping_country,
        )

        # 🚚 Resolve shipping (same rules as Stripe)
        shipping = resolve_shipping_method(
            method_name=shipping_method_name,
            country=shipping_country,
            cart_subtotal=cart_subtotal,
            total_weight_kg=total_weight,
        )

        # 🅿️ Create PayPal order
        result = PaymentService.create_paypal_order(
            user=user,
            items=items,

            email=data.get("email"),
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            phone=data.get("phone", ""),

            shipping_name=data.get("shipping_name")
            or f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),

            shipping_address1=data.get("shipping_address1"),
            shipping_address2=data.get("shipping_address2"),
            shipping_city=data.get("shipping_city"),
            shipping_postcode=shipping_postcode,
            shipping_country=shipping_country,

            shipping_method_name=shipping_method_name,
            shipping_cost=shipping["price"],
            total_weight_kg=total_weight,

            coupon_code=data.get("coupon_code"),
        )

        return Response(result, status=status.HTTP_201_CREATED)

    except ValueError as e:
        logger.warning("[PayPal Checkout] Validation error: %s", e)
        return Response({"error": str(e)}, status=400)

    except Exception:
        logger.exception("[PayPal Checkout] Unexpected failure")
        return Response({"error": "PayPal checkout failed"}, status=500)


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
        
        logger.info("PayPal capture_data type=%s value=%s", type(capture_data), capture_data)

        if capture_data.get("status") in ["COMPLETED", "captured"]:
            payer = capture_data.get("payer", {})
            paypal_email = payer.get("email_address")

            # Attach email to your Order if it was missing
            payment = Payment.objects.get(paypal_order_id=order_id)
            order = payment.order

            if not order.email and paypal_email:
                order.email = paypal_email
                order.save(update_fields=["email"])
            
            # 🧩 Step 2: Mark payment succeeded in our database
            PaymentService.mark_paypal_payment_succeeded(capture_data)

            return Response(
                {
                    "id": capture_data.get("id"),
                    "order_public_id": order.public_id, 
                    "status": "COMPLETED",
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
        
@api_view(["POST"])
@permission_classes([AllowAny])
def subscribe_newsletter(request):
    email = request.data.get("email", "").strip().lower()
    source = request.data.get("source", "footer")

    if not email or "@" not in email:
        return Response(
            {"error": "Invalid email address"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    subscriber, created = NewsletterSubscriber.objects.get_or_create(
        email=email,
        defaults={"source": source},
    )

    if not created and not subscriber.is_active:
        subscriber.is_active = True
        subscriber.save(update_fields=["is_active"])

    logger.info(
        "[Newsletter] %s | email=%s source=%s",
        "created" if created else "existing",
        email,
        source,
    )

    return Response(
        {
            "success": True,
            "created": created,
        },
        status=status.HTTP_201_CREATED,
    )