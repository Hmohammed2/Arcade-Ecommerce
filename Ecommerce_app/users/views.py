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
from django.utils import timezone
from .serializers import UserSerializer, RegisterSerializer, UserAddressSerializer
from .models import UserAddress, PasswordResetToken
from .services.SendEmail import send_graph_email
from django.conf import settings
from django.contrib.auth import authenticate
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.decorators import api_view, permission_classes


import logging
logger = logging.getLogger(__name__)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get("identifier")
        password = request.data.get("password")
        turnstile_token = request.data.get("token")

        if not identifier or not password or not turnstile_token:
            return Response(
                {"detail": "Missing credentials"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ Verify Turnstile
        secret_key = os.environ.get(
            "TURNSTILE_SECRET_KEY",
            "1x0000000000000000000000000000000AA",
        )

        resp = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": secret_key,
                "response": turnstile_token,
                "remoteip": request.META.get("REMOTE_ADDR"),
            },
        )
        
        print(resp.json())

        if not resp.json().get("success"):
            return Response(
                {"detail": "CAPTCHA verification failed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ Try username OR email
        user = authenticate(username=identifier, password=password)

        if not user:
            try:
                user_obj = User.objects.get(email__iexact=identifier)
                if user_obj.check_password(password):
                    user = user_obj
            except User.DoesNotExist:
                pass

        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ✅ Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


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
    
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not token or not new_password:
            return Response({"detail": "Missing fields."}, status=400)

        try:
            # Example: store token in DB along with user when sending email
            reset_entry = PasswordResetToken.objects.get(token=token)
            user = reset_entry.user

            # Optional: verify expiration
            if reset_entry.expires_at < timezone.now():
                return Response({"detail": "Token expired."}, status=400)

            user.set_password(new_password)
            user.save()
            reset_entry.delete()

            return Response({"detail": "Password reset successfully."}, status=200)

        except PasswordResetToken.DoesNotExist:
            return Response({"detail": "Invalid or expired token."}, status=400)


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

class PasswordResetEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            logger.exception("Password reset requested for non-existent email: %s", email)
            pass

        # Create token
        reset_token = PasswordResetToken.create_token(user)
        token = reset_token.token
        
        reset_link = f"{settings.FRONTENDURL}/reset-password?token={token}"

            # Send password reset email via Microsoft Graph
        send_graph_email(
            to_email=user.email,
            subject="Password Reset Request",
            body=f"""
                <p>Hi {user.username},</p>
                <p>Click the link below to reset your password:</p>
                <p><a href="{reset_link}">Reset Password</a></p>
                <p>If you didn’t request this, please ignore this email.</p>
            """,
            )

        # optionally save the token in a model for later validation
        # e.g., PasswordResetToken.objects.create(user=user, token=token)

        return Response({"detail": "If an account exists a password reset email has been sent"}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def contact_view(request):
    name = request.data.get("name")
    email = request.data.get("email")
    message = request.data.get("message")

    if not all([name, email, message]):
        return Response(
            {"error": "Missing fields"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    subject = f"New Contact Form Enquiry from {name}"
    body = f"""
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <hr />
        <p>{message}</p>
    """

    send_graph_email(
        to_email="sales@arcadesticklabs.co.uk",
        subject=subject,
        body=body,
    )

    return Response({"success": True})