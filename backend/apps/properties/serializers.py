from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
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
        fields = "__all__"

# ============================================================
# LOCATION
# ============================================================

class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = "__all__"

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

    has_listing = serializers.SerializerMethodField()

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
            "has_listing",
        )

        read_only_fields = (
            "id",
            "owner",
            "created_at",
            "updated_at",
            "verification_status",
            "has_listing",
        )

    def get_has_listing(self, obj):
        if hasattr(obj, "has_listing"):
            return bool(obj.has_listing)
        if hasattr(obj, "_prefetched_objects_cache") and "listings" in obj._prefetched_objects_cache:
            return len(obj.listings.all()) > 0
        return obj.listings.exists()

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

# ============================================================
# OWNER PUBLIC INFO
# ============================================================

class OwnerPublicSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            "id",
            "full_name",
            "phone_number",
            "phone_verified",
        )


# ============================================================
# PROPERTY (Nested inside listings)
# ============================================================

class ListingPropertySerializer(serializers.ModelSerializer):

    owner = OwnerPublicSerializer(read_only=True)
    property_type = PropertyTypeSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    verification_status = serializers.SerializerMethodField()

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
            "verification_status",
        )

    def get_verification_status(self, obj):
        try:
            return obj.verification.status
        except (PropertyVerification.DoesNotExist, AttributeError, ObjectDoesNotExist):
            return "pending"


# ============================================================
# PROPERTY LISTING
# ============================================================

class PropertyListingSerializer(serializers.ModelSerializer):

    property = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(),
        write_only=True,
    )

    property_details = ListingPropertySerializer(
        source="property",
        read_only=True,
    )

    class Meta:
        model = PropertyListing
        fields = (
            "id",
            "property",
            "property_details",
            "title",
            "listing_type",
            "price",
            "currency",
            "price_period",
            "status",
            "published_at",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "property_details",
            "published_at",
            "created_at",
            "updated_at",
        )

    def validate_property(self, value):
        query = PropertyListing.objects.filter(property=value)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError(
                "This property already has a listing."
            )
        return value


# ============================================================
# PROPERTY IMAGE
# ============================================================

class PropertyImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyImage
        fields = "__all__"


# ============================================================
# FAVORITE
# ============================================================

class FavoriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Favorite
        fields = "__all__"
        read_only_fields = ("user",)


# ============================================================
# PAYMENT
# ============================================================

class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ("user",)