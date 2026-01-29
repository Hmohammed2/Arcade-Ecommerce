# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,     # refresh
)
from .views import LoginView, RegisterView, UserProfileView, LogoutView, UserAddressView, PasswordChangeView, TurnstileVerifyView, PasswordResetEmailView, ResetPasswordView, contact_view

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("user/", UserProfileView.as_view(), name="user_profile"),
    path("contact/", contact_view, name="contact"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("addresses/", UserAddressView.as_view(), name="user_addresses"),
    path("password-change/", PasswordChangeView.as_view(), name="password_change"),
    path("send-password-reset/", PasswordResetEmailView.as_view(), name="send-password-reset"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("verify-turnstile/", TurnstileVerifyView.as_view(), name="verify_turnstile"),
]
