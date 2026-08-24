from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    ProfileView,
    SendOTPView,
    VerifyOTPView,
    ForgotPasswordView,
    VerifyResetOTPView,
    ResetPasswordView,
)

urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),

    path(
        "send-otp/",
        SendOTPView.as_view(),
        name="send_otp"
    ),

    path(
        "verify-otp/",
        VerifyOTPView.as_view(),
        name="verify_otp"
    ),

    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot_password"
    ),

    path(
        "verify-reset-otp/",
        VerifyResetOTPView.as_view(),
        name="verify_reset_otp"
    ),

    path(
        "reset-password/",
        ResetPasswordView.as_view(),
        name="reset_password"
    ),
]