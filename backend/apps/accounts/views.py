from django.conf import settings

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import User, PhoneOTP
from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
)


class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        # Delete previous OTPs
        PhoneOTP.objects.filter(
            phone_number=user.phone_number
        ).delete()

        # Generate new OTP
        otp = PhoneOTP.objects.create(
            phone_number=user.phone_number,
            code=PhoneOTP.generate_code(),
            expires_at=PhoneOTP.expiry_time(),
        )

        response = {
            "message": "Account created successfully. Verify your phone number.",
        }

        if settings.DEBUG:
            response["otp"] = otp.code

        return Response(
            response,
            status=status.HTTP_201_CREATED,
        )


class SendOTPView(generics.GenericAPIView):

    serializer_class = SendOTPSerializer
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]

        PhoneOTP.objects.filter(
            phone_number=phone_number
        ).delete()

        otp = PhoneOTP.objects.create(
            phone_number=phone_number,
            code=PhoneOTP.generate_code(),
            expires_at=PhoneOTP.expiry_time(),
        )

        response = {
            "message": "OTP generated successfully."
        }

        if settings.DEBUG:
            response["otp"] = otp.code

        return Response(response)


class VerifyOTPView(generics.GenericAPIView):

    serializer_class = VerifyOTPSerializer
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        otp = serializer.validated_data["otp"]

        user = User.objects.get(
            phone_number=otp.phone_number
        )

        otp.is_used = True
        otp.save(update_fields=["is_used"])

        user.phone_verified = True
        user.save(update_fields=["phone_verified"])

        return Response(
            {
                "message": "Phone number verified successfully."
            }
        )


class ProfileView(generics.RetrieveUpdateAPIView):

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user