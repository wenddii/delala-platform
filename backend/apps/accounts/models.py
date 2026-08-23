from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
import random
from django.utils import timezone
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):

    full_name = models.CharField(
        max_length=255
    )

    phone_number = models.CharField(
        max_length=20,
        unique=True
    )

    email = models.EmailField(
        unique=True,
        blank=True,
        null=True
    )

    phone_verified = models.BooleanField(
        default=False
    )

    is_active = models.BooleanField(
        default=True
    )

    is_staff = models.BooleanField(
        default=False
    )

    is_superuser = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    objects = UserManager()

    USERNAME_FIELD = "phone_number"

    REQUIRED_FIELDS = [
        "full_name"
    ]

    def __str__(self):
        return self.phone_number


class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    profile_picture = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True
    )

    government_id_image = models.ImageField(
        upload_to="government_ids/",
        blank=True,
        null=True
    )

    address = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    bio = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.full_name}'s Profile"








class PhoneOTP(models.Model):

    phone_number = models.CharField(max_length=20)

    code = models.CharField(max_length=6)

    created_at = models.DateTimeField(auto_now_add=True)

    expires_at = models.DateTimeField()

    is_used = models.BooleanField(default=False)

    @staticmethod
    def generate_code():
        return str(random.randint(100000, 999999))

    @staticmethod
    def expiry_time():
        return timezone.now() + timedelta(minutes=5)

    def __str__(self):
        return f"{self.phone_number} - {self.code}"