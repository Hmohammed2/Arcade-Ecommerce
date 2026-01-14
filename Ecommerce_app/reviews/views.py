# reviews/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from django.utils import timezone
from django.db.models import Q

from retail.models import Order
from .models import Review
from .serializers import ReviewSubmitSerializer, ReviewPublicSerializer



def get_client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        # take first IP in list
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class SubmitReviewView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = ReviewSubmitSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        try:
            order = Order.objects.get(
                public_id=data["order_public_id"],
                review_token=data.get("token", "")
            )
        except Order.DoesNotExist:
            return Response({"detail": "Invalid or expired review link."}, status=404)

        if Review.objects.filter(order=order).exists():
            return Response({"detail": "A review has already been submitted for this order."}, status=400)

        review = Review.objects.create(
            order=order,
            order_public_id=order.public_id,
            rating=data["rating"],
            title=data.get("title", ""),
            body=data["body"],
            display_name=data.get("display_name", ""),
            email=data.get("email", ""),
            consent_to_publish_name=data.get("consent_to_publish_name", True),
            verified_purchase=True,
            status=Review.Status.PENDING,
            ip_address=get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")
        )

        # Burn token after use (optional but recommended)
        order.review_token = None
        order.save(update_fields=["review_token"])

        return Response({"ok": True}, status=201)



class ApprovedReviewsListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Optional filters: ?limit=20
        limit = int(request.GET.get("limit", "50"))
        limit = max(1, min(limit, 200))

        qs = Review.objects.filter(status=Review.Status.APPROVED).order_by("-created_at")[:limit]
        return Response(ReviewPublicSerializer(qs, many=True).data)
