from datetime import timedelta
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import PhoneOTP, UserProfile

User = get_user_model()


class UserModelAndManagerTests(TestCase):
    """
    Tests for the custom User model and custom UserManager.
    """

    def setUp(self):
        self.phone_number = "+251911223344"
        self.full_name = "Abebe Bikila"
        self.email = "abebe@example.com"
        self.password = "SecurePass123!"

    def test_create_user_success(self):
        """Test creating a regular user with valid details."""
        user = User.objects.create_user(
            phone_number=self.phone_number,
            full_name=self.full_name,
            email=self.email,
            password=self.password,
        )
        self.assertEqual(user.phone_number, self.phone_number)
        self.assertEqual(user.full_name, self.full_name)
        self.assertEqual(user.email, self.email)
        self.assertTrue(user.check_password(self.password))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.phone_verified)

    def test_create_user_without_phone_number_raises_error(self):
        """Test that creating a user without a phone number raises ValueError."""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                phone_number="",
                full_name=self.full_name,
                password=self.password,
            )

    def test_create_superuser_success(self):
        """Test creating a superuser with required administrative privileges."""
        admin_user = User.objects.create_superuser(
            phone_number="+251900000000",
            full_name="Admin User",
            email="admin@example.com",
            password="AdminPassword123!",
        )
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        self.assertTrue(admin_user.is_active)

    def test_create_superuser_invalid_flags(self):
        """Test that creating a superuser with is_staff or is_superuser False raises ValueError."""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                phone_number="+251900000001",
                full_name="Invalid Admin",
                password="Password123!",
                is_staff=False,
            )

        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                phone_number="+251900000002",
                full_name="Invalid Admin",
                password="Password123!",
                is_superuser=False,
            )

        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                phone_number="+251900000003",
                full_name="Invalid Admin",
                password="Password123!",
                is_active=False,
            )

    def test_user_profile_created_via_signal(self):
        """Test that UserProfile is automatically created via post_save signal when User is created."""
        user = User.objects.create_user(
            phone_number="+251911111111",
            full_name="Signal Test User",
            password=self.password,
        )
        self.assertTrue(hasattr(user, "profile"))
        self.assertIsInstance(user.profile, UserProfile)

    def test_user_string_representation(self):
        """Test the string representation of User model returns phone number."""
        user = User.objects.create_user(
            phone_number=self.phone_number,
            full_name=self.full_name,
            password=self.password,
        )
        self.assertEqual(str(user), self.phone_number)

    def test_user_profile_string_representation(self):
        """Test the string representation of UserProfile."""
        user = User.objects.create_user(
            phone_number=self.phone_number,
            full_name=self.full_name,
            password=self.password,
        )
        self.assertEqual(str(user.profile), f"{self.full_name}'s Profile")


class PhoneOTPModelTests(TestCase):
    """
    Tests for the PhoneOTP model methods and behavior.
    """

    def setUp(self):
        self.phone_number = "+251911223344"

    def test_generate_code(self):
        """Test generated code is a 6-digit numeric string."""
        code = PhoneOTP.generate_code()
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isdigit())

    def test_is_expired_false_for_fresh_otp(self):
        """Test that a newly created OTP is not expired."""
        otp = PhoneOTP.objects.create(
            phone_number=self.phone_number,
            code="123456",
            expires_at=PhoneOTP.expiry_time(),
        )
        self.assertFalse(otp.is_expired())

    def test_is_expired_true_for_past_otp(self):
        """Test that an OTP with an expires_at in the past is expired."""
        past_time = timezone.now() - timedelta(minutes=1)
        otp = PhoneOTP.objects.create(
            phone_number=self.phone_number,
            code="123456",
            expires_at=past_time,
        )
        self.assertTrue(otp.is_expired())

    def test_phone_otp_str_representation(self):
        """Test string representation of PhoneOTP."""
        otp = PhoneOTP.objects.create(
            phone_number=self.phone_number,
            code="654321",
            expires_at=PhoneOTP.expiry_time(),
        )
        self.assertEqual(str(otp), f"{self.phone_number} - 654321")


class RegistrationAPITests(APITestCase):
    """
    Tests for the User Registration API endpoint (/api/accounts/register/).
    """

    def setUp(self):
        self.register_url = reverse("register")
        self.valid_payload = {
            "phone_number": "+251912345678",
            "full_name": "Kebede Michael",
            "email": "kebede@example.com",
            "password": "Password123!",
        }

    def test_register_user_success(self):
        """Test successful registration generates user and an OTP."""
        response = self.client.post(self.register_url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["message"],
            "Account created successfully. Verify your phone number.",
        )

        # Verify user created in database
        user = User.objects.get(phone_number=self.valid_payload["phone_number"])
        self.assertEqual(user.full_name, self.valid_payload["full_name"])
        self.assertEqual(user.email, self.valid_payload["email"])
        self.assertTrue(user.check_password(self.valid_payload["password"]))
        self.assertFalse(user.phone_verified)

        # Verify OTP generated
        self.assertTrue(
            PhoneOTP.objects.filter(phone_number=self.valid_payload["phone_number"]).exists()
        )

    def test_register_user_without_email(self):
        """Test successful registration without optional email field."""
        payload = {
            "phone_number": "+251922334455",
            "full_name": "Almaz Ayana",
            "password": "Password123!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(phone_number=payload["phone_number"])
        self.assertIsNone(user.email)

    def test_register_user_with_empty_string_email(self):
        """Test registration with empty string email converts email to None."""
        payload = {
            "phone_number": "+251933445566",
            "full_name": "Tirunesh Dibaba",
            "email": "",
            "password": "Password123!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(phone_number=payload["phone_number"])
        self.assertIsNone(user.email)

    def test_register_missing_required_fields(self):
        """Test registration fails when required fields are missing."""
        # Missing phone_number
        payload = {
            "full_name": "Test User",
            "password": "Password123!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone_number", response.data)

        # Missing full_name
        payload = {
            "phone_number": "+251944556677",
            "password": "Password123!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("full_name", response.data)

        # Missing password
        payload = {
            "phone_number": "+251944556677",
            "full_name": "Test User",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_register_duplicate_phone_number(self):
        """Test registration fails if phone number is already registered."""
        self.client.post(self.register_url, self.valid_payload, format="json")

        duplicate_payload = {
            "phone_number": self.valid_payload["phone_number"],
            "full_name": "Another Name",
            "password": "NewPassword123!",
        }
        response = self.client.post(self.register_url, duplicate_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone_number", response.data)

    def test_register_duplicate_email(self):
        """Test registration fails if email is already registered."""
        self.client.post(self.register_url, self.valid_payload, format="json")

        duplicate_email_payload = {
            "phone_number": "+251999887766",
            "full_name": "Another Name",
            "email": self.valid_payload["email"],
            "password": "NewPassword123!",
        }
        response = self.client.post(self.register_url, duplicate_email_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_invalid_email_format(self):
        """Test registration fails with an invalid email format."""
        payload = {
            "phone_number": "+251955667788",
            "full_name": "Invalid Email User",
            "email": "not-a-valid-email",
            "password": "Password123!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)


class OTPAuthenticationAPITests(APITestCase):
    """
    Tests for OTP generation (/api/accounts/send-otp/) and verification (/api/accounts/verify-otp/).
    """

    def setUp(self):
        self.send_otp_url = reverse("send_otp")
        self.verify_otp_url = reverse("verify_otp")
        self.phone_number = "+251911223344"
        self.user = User.objects.create_user(
            phone_number=self.phone_number,
            full_name="Haile Gebrselassie",
            password="Password123!",
        )

    def test_send_otp_success(self):
        """Test sending OTP for an existing user account."""
        response = self.client.post(
            self.send_otp_url,
            {"phone_number": self.phone_number},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "OTP generated successfully.")
        self.assertTrue(PhoneOTP.objects.filter(phone_number=self.phone_number).exists())

    def test_send_otp_nonexistent_phone_number(self):
        """Test sending OTP fails when phone number is not registered."""
        response = self.client.post(
            self.send_otp_url,
            {"phone_number": "+251900000000"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone_number", response.data)

    def test_send_otp_replaces_previous_otps(self):
        """Test sending OTP deletes previously generated OTPs for the same phone number."""
        PhoneOTP.objects.create(
            phone_number=self.phone_number,
            code="111111",
            expires_at=PhoneOTP.expiry_time(),
        )
        self.assertEqual(PhoneOTP.objects.filter(phone_number=self.phone_number).count(), 1)

        self.client.post(
            self.send_otp_url,
            {"phone_number": self.phone_number},
            format="json",
        )
        self.assertEqual(PhoneOTP.objects.filter(phone_number=self.phone_number).count(), 1)
        self.assertFalse(
            PhoneOTP.objects.filter(phone_number=self.phone_number, code="111111").exists()
        )

    def test_verify_otp_success(self):
        """Test verifying a valid OTP marks OTP as used and user's phone_verified as True."""
        otp = PhoneOTP.objects.create(
            phone_number=self.phone_number,
            code="123456",
            expires_at=PhoneOTP.expiry_time(),
        )

        response = self.client.post(
            self.verify_otp_url,
            {"phone_number": self.phone_number, "code": "123456"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"],
            "Phone number verified successfully.",
        )

        # Check OTP is used
        otp.refresh_from_db()
        self.assertTrue(otp.is_used)

        # Check User is marked phone_verified
        self.user.refresh_from_db()
        self.assertTrue(self.user.phone_verified)

    def test_verify_otp_invalid_code(self):
        """Test verifying OTP with incorrect code fails."""
        PhoneOTP.objects.create(
            phone_number=self.phone_number,
            code="123456",
            expires_at=PhoneOTP.expiry_time(),
        )

        response = self.client.post(
            self.verify_otp_url,
            {"phone_number": self.phone_number, "code": "999999"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("code", response.data)

    def test_verify_otp_already_used(self):
        """Test verifying an already-used OTP fails."""
        PhoneOTP.objects.create(
            phone_number=self.phone_number,
            code="123456",
            expires_at=PhoneOTP.expiry_time(),
            is_used=True,
        )

        response = self.client.post(
            self.verify_otp_url,
            {"phone_number": self.phone_number, "code": "123456"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("code", response.data)

    def test_verify_otp_expired(self):
        """Test verifying an expired OTP fails."""
        past_time = timezone.now() - timedelta(minutes=10)
        PhoneOTP.objects.create(
            phone_number=self.phone_number,
            code="123456",
            expires_at=past_time,
        )

        response = self.client.post(
            self.verify_otp_url,
            {"phone_number": self.phone_number, "code": "123456"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("code", response.data)

    def test_verify_otp_nonexistent_phone(self):
        """Test verifying OTP for a phone number with no OTP records fails."""
        response = self.client.post(
            self.verify_otp_url,
            {"phone_number": "+251900000000", "code": "123456"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("code", response.data)


class LoginAndJWTAPITests(APITestCase):
    """
    Tests for User Login (/api/accounts/login/) and Token Refresh (/api/accounts/token/refresh/).
    """

    def setUp(self):
        self.login_url = reverse("login")
        self.refresh_url = reverse("token_refresh")
        self.phone_number = "+251911223344"
        self.password = "ValidSecret123!"
        self.user = User.objects.create_user(
            phone_number=self.phone_number,
            full_name="Kenenisa Bekele",
            password=self.password,
        )

    def test_login_success(self):
        """Test logging in with valid phone number and password returns JWT access and refresh tokens."""
        response = self.client.post(
            self.login_url,
            {"phone_number": self.phone_number, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_invalid_password(self):
        """Test logging in with incorrect password returns 401 Unauthorized."""
        response = self.client.post(
            self.login_url,
            {"phone_number": self.phone_number, "password": "WrongPassword123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        """Test logging in with an unregistered phone number returns 401 Unauthorized."""
        response = self.client.post(
            self.login_url,
            {"phone_number": "+251900000000", "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_credentials(self):
        """Test logging in with missing phone number or password returns 400 Bad Request."""
        response = self.client.post(
            self.login_url,
            {"phone_number": self.phone_number},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_refresh_success(self):
        """Test refreshing access token using a valid refresh token."""
        login_response = self.client.post(
            self.login_url,
            {"phone_number": self.phone_number, "password": self.password},
            format="json",
        )
        refresh_token = login_response.data["refresh"]

        refresh_response = self.client.post(
            self.refresh_url,
            {"refresh": refresh_token},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data)

    def test_token_refresh_invalid_token(self):
        """Test token refresh with an invalid refresh token returns 401 Unauthorized."""
        response = self.client.post(
            self.refresh_url,
            {"refresh": "invalid-token-string"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserProfileAPITests(APITestCase):
    """
    Tests for the Profile API endpoint (/api/accounts/profile/).
    """

    def setUp(self):
        self.profile_url = reverse("profile")
        self.phone_number = "+251911223344"
        self.password = "ProfilePassword123!"
        self.user = User.objects.create_user(
            phone_number=self.phone_number,
            full_name="Derartu Tulu",
            email="derartu@example.com",
            password=self.password,
        )

    def test_get_profile_authenticated(self):
        """Test accessing profile while authenticated returns user profile data."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["phone_number"], self.phone_number)
        self.assertEqual(response.data["full_name"], self.user.full_name)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertFalse(response.data["phone_verified"])
        self.assertIn("profile", response.data)
        self.assertIn("properties", response.data["profile"])

    def test_get_profile_unauthorized(self):
        """Test accessing profile without authentication returns 401 Unauthorized."""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_authenticated_patch(self):
        """Test partial update of profile when authenticated."""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            self.profile_url,
            {"full_name": "Derartu Tulu Updated"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "Derartu Tulu Updated")

    def test_update_profile_unauthorized(self):
        """Test updating profile without authentication returns 401 Unauthorized."""
        response = self.client.patch(
            self.profile_url,
            {"full_name": "Unauthorized Update"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_phone_verified_is_read_only_via_profile_endpoint(self):
        """Test that phone_verified field is read-only and cannot be altered via profile endpoint."""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            self.profile_url,
            {"phone_verified": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.phone_verified)
