from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.properties.models import (
    Property,
    PropertyListing,
    PropertyType,
    Location,
    PropertyVerification,
)

User = get_user_model()


class PropertyListingCreateAPITestCase(APITestCase):

    def setUp(self):
        # 1. Create User
        self.owner = User.objects.create_user(
            phone_number="+251911000001",
            full_name="Property Owner",
            password="Password123!",
        )
        self.other_user = User.objects.create_user(
            phone_number="+251911000002",
            full_name="Other User",
            password="Password123!",
        )

        # 2. Create PropertyType and Location
        self.prop_type = PropertyType.objects.create(name="Villa")
        self.location = Location.objects.create(
            city="Addis Ababa",
            sub_city="Nifas Silk-Lafto",
            woreda="01",
            neighborhood="Venezia",
        )

        # 3. Create Property
        self.property = Property.objects.create(
            id=200,
            owner=self.owner,
            property_type=self.prop_type,
            location=self.location,
            bedrooms=4,
            bathrooms=3,
            area_sqm=250.0,
            description="Beautiful villa in Nifas Silk-Lafto",
        )

        # 4. Create PropertyVerification
        self.verification = PropertyVerification.objects.create(
            property=self.property,
            status="pending",
        )

        self.url = reverse("listing-list")

    def test_create_property_listing_with_frontend_payload_authenticated_owner(self):
        """Test POSTing the exact frontend payload when authenticated as owner."""
        self.client.force_authenticate(user=self.owner)

        payload = {
            "property": 200,
            "title": "villa in Nifas Silk-Lafto",
            "listing_type": "sale",
            "price": "2500",
            "currency": "ETB",
            "price_period": "total",
            "status": "draft",
        }

        response = self.client.post(self.url, data=payload, format="json")
        print(f"\n[DEBUG] Authenticated Owner Response Status: {response.status_code}")
        print(f"[DEBUG] Authenticated Owner Response Data: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PropertyListing.objects.count(), 1)
        listing = PropertyListing.objects.first()
        self.assertEqual(listing.property_id, 200)
        self.assertEqual(listing.title, "villa in Nifas Silk-Lafto")
        self.assertEqual(listing.price, Decimal("2500.00"))
        self.assertEqual(listing.listing_type, "sale")

    def test_create_property_listing_unauthenticated(self):
        """Test POSTing the frontend payload without authentication."""
        payload = {
            "property": 200,
            "title": "villa in Nifas Silk-Lafto",
            "listing_type": "sale",
            "price": "2500",
            "currency": "ETB",
            "price_period": "total",
            "status": "draft",
        }

        response = self.client.post(self.url, data=payload, format="json")
        print(f"\n[DEBUG] Unauthenticated Response Status: {response.status_code}")
        print(f"[DEBUG] Unauthenticated Response Data: {getattr(response, 'data', None)}")

    def test_create_property_listing_nonexistent_property(self):
        """Test POSTing with non-existent property ID."""
        self.client.force_authenticate(user=self.owner)
        payload = {
            "property": 9999,
            "title": "Non-existent",
            "listing_type": "sale",
            "price": "2500",
            "currency": "ETB",
            "price_period": "total",
            "status": "draft",
        }
        response = self.client.post(self.url, data=payload, format="json")
        print(f"\n[DEBUG] Nonexistent Property Response Status: {response.status_code}")
        print(f"[DEBUG] Nonexistent Property Response Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
