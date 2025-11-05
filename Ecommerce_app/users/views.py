import os
import requests
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import UserSerializer, RegisterSerializer, UserAddressSerializer
from .models import UserAddress
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView

class TurnstileVerifyView(APIView):
    permission_classes = [AllowAny]  # anyone can verify before login

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "Missing Turnstile token"}, status=status.HTTP_400_BAD_REQUEST)

        secret_key = os.environ.get("TURNSTILE_SECRET_KEY", "1x0000000000000000000000000000000AA")

        resp = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": secret_key,
                "response": token,
                "remoteip": request.META.get("REMOTE_ADDR"),
            },
        )

        verification = resp.json()
        if verification.get("success"):
            return Response({"success": True})
        else:
            return Response(
                {"success": False, "errors": verification.get("error-codes", [])},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UserAddressView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        address, _ = UserAddress.objects.get_or_create(user=request.user)
        serializer = UserAddressSerializer(address)
        return Response(serializer.data)

    def put(self, request):
        address, _ = UserAddress.objects.get_or_create(user=request.user)
        serializer = UserAddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response({"detail": "Old password is incorrect"}, status=400)

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"detail": e.messages}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password updated successfully"}, status=200)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out"})
        except Exception:
            return Response({"detail": "Invalid token"}, status=400)

@method_decorator(csrf_exempt, name="dispatch")
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    
    def get_response(self):
        user = self.user
        if not user or not user.is_authenticated:
            return Response({"error": "Authentication failed"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Generate JWT tokens manually
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        # ✅ Optionally get social data (Google profile)
        social = user.socialaccount_set.first()
        picture = social.extra_data.get("picture") if social else None

        data = {
            "access": str(access),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "avatar": picture,
            },
        }

        return Response(data, status=status.HTTP_200_OK)
