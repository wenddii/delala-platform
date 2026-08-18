from django.db import transaction
from rest_framework import serializers
from apps.accounts.models import User

from .models import (
    PropertyType,
    Location,
    Property,
    PropertyListing,
    PropertyImage,
    PropertyDocument,
    PropertyVerification,
    Favorite,
    Payment,
)

# ============================================================
# PROPERTY TYPE
# ============================================================

class PropertyTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyType
        fields = "all"

# ============================================================
# LOCATION
# ============================================================

class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = "all"

# ============================================================
# PROPERTY DOCUMENT
# ============================================================

class PropertyDocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyDocument
        fields = (
            "id",
            "property",
            "document_type",
            "document",
            "uploaded_at",
        )

        read_only_fields = (
            "id",
            "uploaded_at",
        )

# ============================================================
# PROPERTY VERIFICATION
# ============================================================

class PropertyVerificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyVerification
        fields = (
            "id",
            "property",
            "verified_by",
            "status",
            "remarks",
            "verified_at",
        )

        read_only_fields = (
            "id",
            "verified_by",
            "status",
            "verified_at",
        )

# ============================================================
# PROPERTY
# ============================================================

class PropertySerializer(serializers.ModelSerializer):

    # Document uploaded when creating the property
    document_type = serializers.CharField(
        write_only=True,
        required=True
    )

    document = serializers.ImageField(
        write_only=True,
        required=True
    )

    # Verification status — read from the related PropertyVerification row
    verification_status = serializers.CharField(
        source="verification.status",
        read_only=True,
        default="pending",
    )

    class Meta:
        model = Property
        fields = (
            "id",
            "owner",
            "property_type",
            "location",
            "bedrooms",
            "bathrooms",
            "area_sqm",
            "description",
            "created_at",
            "updated_at",
            # write-only — sent on create, not returned
            "document_type",
            "document",
            # read-only — resolved from related verification row
            "verification_status",
        )

        read_only_fields = (
            "id",
            "owner",
            "created_at",
            "updated_at",
            "verification_status",
        )

    @transaction.atomic
    def create(self, validated_data):
        # Pull out the document fields — they don't belong on Property
        document_type = validated_data.pop("document_type")
        document      = validated_data.pop("document")

        # Create the property — owner comes from the request, all other
        # validated fields (property_type, location, bedrooms, etc.) are
        # spread in via **validated_data
        property_obj = Property.objects.create(
            owner=self.context["request"].user,
            **validated_data
        )

        # Attach the ownership document
        PropertyDocument.objects.create(
            property=property_obj,
            document_type=document_type,
            document=document,
        )
        
        PropertyVerification.objects.create(
            property=property_obj,
            status="pending",
        )

        return property_obj

# ============================================================
# OWNER PUBLIC INFO
# Only exposes fields safe to show on a listing contact card.
# Never includes password, email, or sensitive profile data.
# ============================================================

class OwnerPublicSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "full_name", "phone_number", "phone_verified"]

# ============================================================
# NESTED PROPERTY (used inside listing responses)
# ============================================================

class ListingPropertySerializer(serializers.ModelSerializer):

    owner         = OwnerPublicSerializer(read_only=True)
    property_type = PropertyTypeSerializer(read_only=True)
    location      = LocationSerializer(read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "owner",
            "property_type",
            "location",
            "bedrooms",
            "bathrooms",
            "area_sqm",
            "description",
        ]

# ============================================================
# PROPERTY LISTING
# ============================================================

class PropertyListingSerializer(serializers.ModelSerializer):

    # On READ  → return full nested property (owner + type + location expanded)
    # On WRITE → accept the bare property FK id as normal
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["property"] = ListingPropertySerializer(instance.property).data
        return rep

    class Meta:
        model = PropertyListing
        fields = "all"

# ============================================================
# PROPERTY IMAGE
# ============================================================

class PropertyImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyImage
        fields = "all"

# ============================================================
# FAVORITE
# ============================================================

class FavoriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Favorite
        fields = "all"

# ============================================================
# PAYMENT
# ============================================================

class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = "all"