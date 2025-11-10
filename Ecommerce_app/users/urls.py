# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,  # login
    TokenRefreshView,     # refresh
)
from .views import RegisterView, UserProfileView, LogoutView, UserAddressView, PasswordChangeView, TurnstileVerifyView, PasswordResetEmailView, ResetPasswordView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("user/", UserProfileView.as_view(), name="user_profile"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("addresses/", UserAddressView.as_view(), name="user_addresses"),
    path("password-change/", PasswordChangeView.as_view(), name="password_change"),
    path("send-password-reset/", PasswordResetEmailView.as_view(), name="send-password-reset"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("verify-turnstile/", TurnstileVerifyView.as_view(), name="verify_turnstile"),
]
