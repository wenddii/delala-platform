from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

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

from .serializers import (
    PropertyTypeSerializer,
    LocationSerializer,
    PropertySerializer,
    PropertyListingSerializer,
    PropertyImageSerializer,
    PropertyDocumentSerializer,
    PropertyVerificationSerializer,
    FavoriteSerializer,
)


# Property Types
class PropertyTypeListView(generics.ListCreateAPIView):
    queryset = PropertyType.objects.all()
    serializer_class = PropertyTypeSerializer
    permission_classes = [AllowAny]


class PropertyTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PropertyType.objects.all()
    serializer_class = PropertyTypeSerializer
    permission_classes = [AllowAny]


# Locations
class LocationListView(generics.ListCreateAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [AllowAny]


class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [AllowAny]


# Properties
class PropertyListView(generics.ListCreateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]


# Property Listings
class PropertyListingListView(generics.ListCreateAPIView):
    queryset = PropertyListing.objects.all()
    serializer_class = PropertyListingSerializer
    permission_classes = [AllowAny]


class PropertyListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PropertyListing.objects.all()
    serializer_class = PropertyListingSerializer
    permission_classes = [IsAuthenticated]


# Property Images
class PropertyImageListView(generics.ListCreateAPIView):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    permission_classes = [IsAuthenticated]


class PropertyImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    permission_classes = [IsAuthenticated]


# Property Documents
class PropertyDocumentListView(generics.ListCreateAPIView):
    queryset = PropertyDocument.objects.all()
    serializer_class = PropertyDocumentSerializer
    permission_classes = [IsAuthenticated]


class PropertyDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PropertyDocument.objects.all()
    serializer_class = PropertyDocumentSerializer
    permission_classes = [IsAuthenticated]


# Property Verification
class PropertyVerificationListView(generics.ListCreateAPIView):
    queryset = PropertyVerification.objects.all()
    serializer_class = PropertyVerificationSerializer
    permission_classes = [IsAuthenticated]


class PropertyVerificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PropertyVerification.objects.all()
    serializer_class = PropertyVerificationSerializer
    permission_classes = [IsAuthenticated]


# Favorites
class FavoriteListView(generics.ListCreateAPIView):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]


class FavoriteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

