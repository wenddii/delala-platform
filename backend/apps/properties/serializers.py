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
)


#will add validation and nested serializers where nessecary later

class PropertyTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyType
        fields = "__all__"

class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = "__all__"

class PropertySerializer(serializers.ModelSerializer):

    class Meta:
        model = Property
        fields = "__all__"

class PropertyListingSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyListing
        fields = "__all__"

class PropertyImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyImage
        fields = "__all__"


class PropertyDocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyDocument
        fields = "__all__"

class PropertyVerificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyVerification
        fields = "__all__"

class FavoriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Favorite
        fields = "__all__"


