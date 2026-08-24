from rest_framework import serializers

from .models import User, UserProfile , PhoneOTP
from apps.properties.models import Property


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )

    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    class Meta:
        model = User

        fields = [
            "phone_number",
            "full_name",
            "email",
            "password",
        ]

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with that email already exists."
            )
        return value

    def create(self, validated_data):

        email = validated_data.get("email")

        # Convert empty string to None
        if email == "":
            email = None

        user = User.objects.create_user(
            phone_number=validated_data["phone_number"],
            full_name=validated_data["full_name"],
            email=email,
            password=validated_data["password"],
        )

        return user

class ProfilePropertySerializer(serializers.ModelSerializer):

    property_type_name = serializers.CharField(
        source="property_type.name",
        read_only=True
    )

    location = serializers.SerializerMethodField()

    verification_status = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id",
            "property_type",
            "property_type_name",
            "location",
            "bedrooms",
            "bathrooms",
            "area_sqm",
            "description",
            "created_at",
            "verification_status",
        ]

        read_only_fields = [
            "id",
            "property_type_name",
            "location",
            "created_at",
            "verification_status",
        ]

    def get_location(self, obj):
        return {
            "id": obj.location.id,
            "city": obj.location.city,
            "sub_city": obj.location.sub_city,
            "woreda": obj.location.woreda,
            "neighborhood": obj.location.neighborhood,
        }

    def get_verification_status(self, obj):
        try:
            return obj.verification.status
        except Property.verification.RelatedObjectDoesNotExist:
            return "not_verified"


class UserProfileSerializer(serializers.ModelSerializer):

    properties = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            "profile_picture",
            "government_id_image",
            "address",
            "bio",
            "properties",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "properties",
            "created_at",
            "updated_at",
        ]

    def get_properties(self, obj):

        return ProfilePropertySerializer(
            obj.user.properties.all(),
            many=True
        ).data


class ProfileSerializer(serializers.ModelSerializer):

    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "phone_number",
            "email",
            "phone_verified",
            "created_at",
            "updated_at",
            "profile",
        ]

        read_only_fields = [
            "id",
            "phone_verified",
            "created_at",
            "updated_at",
        ]


class SendOTPSerializer(serializers.Serializer):

    phone_number = serializers.CharField(
        max_length=20
    )

    def validate_phone_number(self, value):

        if not User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "No account found with this phone number."
            )

        return value


class VerifyOTPSerializer(serializers.Serializer):

    phone_number = serializers.CharField(
        max_length=20
    )

    code = serializers.CharField(
        max_length=6
    )

    def validate(self, attrs):

        phone_number = attrs["phone_number"]
        code = attrs["code"]

        try:

            otp = PhoneOTP.objects.filter(
                phone_number=phone_number,
                code=code,
                is_used=False,
            ).latest("created_at")

        except PhoneOTP.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "code": "Invalid OTP."
                }
            )

        if otp.is_expired():

            raise serializers.ValidationError(
                {
                    "code": "OTP has expired."
                }
            )

        attrs["otp"] = otp

        return attrs