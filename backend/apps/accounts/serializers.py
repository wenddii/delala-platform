from rest_framework import serializers
from .models import User, UserProfile


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "phone_number",
            "full_name",
            "email",
            "password",
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            phone_number=validated_data["phone_number"],
            full_name=validated_data["full_name"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )

        return user


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = [
            "profile_picture",
            "government_id_image",
            "address",
            "bio",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "created_at",
            "updated_at",
        ]


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