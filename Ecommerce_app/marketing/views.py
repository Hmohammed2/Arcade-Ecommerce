from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PreorderSerializer
from .serializers import ProductSerializer
from .models import Product
from .models import Subscriber
import json

@method_decorator(csrf_exempt, name='dispatch')
class WaitlistView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            email = data.get("email")
            if not email:
                return JsonResponse({"error": "Email is required"}, status=400)

            subscriber, created = Subscriber.objects.get_or_create(email=email)
            if not created:
                return JsonResponse({"message": "Already subscribed"}, status=200)

            return JsonResponse({"message": "Subscription successful"}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all().order_by("-created_at")
        serializer = ProductSerializer(products, many=True, context={"request": request})
        return Response(serializer.data)

class PreorderView(APIView):
    def post(self, request):
        serializer = PreorderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
