from django.db import transaction

from rest_framework import serializers

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
from django.db import transaction
from rest_framework import serializers

from .models import (
    Property,
    PropertyDocument,
    PropertyVerification,
)


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

    # Document verification status
    verification_status = serializers.CharField(
        source="verification.status",
        read_only=True
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

            # Property workflow
            "listing_status",

            "created_at",
            "updated_at",

            # Document uploaded with the property
            "document_type",
            "document",

            # Verification information
            "verification_status",
        )

        read_only_fields = (
            "id",
            "owner",
            "listing_status",
            "created_at",
            "updated_at",
            "verification_status",
        )

    @transaction.atomic
    def create(self, validated_data):

        document_type = validated_data.pop("document_type")
        document = validated_data.pop("document")

        property = Property.objects.create(
            owner=self.context["request"].user,
            listing_status=Property.ListingStatus.PENDING_VERIFICATION,
            **validated_data
        )

        PropertyDocument.objects.create(
            property=property,
            document_type=document_type,
            document=document,
        )

        PropertyVerification.objects.create(
            property=property,
            status=PropertyVerification.Status.PENDING,
        )

        return property

# ============================================================
# PROPERTY LISTING
# ============================================================

class PropertyListingSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyListing

        fields = "__all__"

        read_only_fields = (
            "id",
            "published_at",
            "created_at",
            "updated_at",
        )

    def validate_property(self, property):

        # Property must have a verification record.
        try:
            verification = property.verification
        except PropertyVerification.DoesNotExist:
            raise serializers.ValidationError(
                "This property has not been submitted for verification."
            )

        # Property must be verified.
        if verification.status != PropertyVerification.Status.VERIFIED:
            raise serializers.ValidationError(
                "This property must be verified before it can be listed."
            )

        # Property must have at least one document.
        if not property.documents.exists():
            raise serializers.ValidationError(
                "This property must have a document before it can be listed."
            )

        return property


# ============================================================
# PROPERTY IMAGE
# ============================================================

class PropertyImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyImage
        fields = "__all__"

        read_only_fields = (
            "id",
            "created_at",
        )


# ============================================================
# FAVORITE
# ============================================================

class FavoriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Favorite
        fields = "__all__"

        read_only_fields = (
            "id",
            "created_at",
        )


class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = (
            "status",
            "verified_by",
            "verified_at",
            "created_at",
            "updated_at",
        )