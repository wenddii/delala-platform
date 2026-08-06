from django.contrib.auth.models import BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):

    def create_user(
        self,
        phone_number,
        full_name,
        email=None,
        password=None,
        **extra_fields
    ):
        if not phone_number:
            raise ValueError("Phone number is required")

        user = self.model(
            phone_number=phone_number,
            full_name=full_name,
            email=email,
            **extra_fields
        )

        user.created_at = timezone.now()
        user.save()

        return user

    def create_superuser(
        self,
        phone_number,
        full_name,
        email=None,
        password=None,
        **extra_fields
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(
            phone_number=phone_number,
            full_name=full_name,
            email=email,
            password=password,
            **extra_fields
        )