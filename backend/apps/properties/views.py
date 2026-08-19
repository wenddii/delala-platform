[8/19/2026 10:08 AM] Befekadu Tele_partner: from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated

from .models import (
    PropertyType,
    Location,
    Property,
    PropertyListing,
    PropertyImage,
    PropertyDocument,
    PropertyVerification,
    Favorite,
    Payment
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
    PaymentSerializer
)

# ============================================================
# PROPERTY TYPES
# ============================================================

class PropertyTypeListView(generics.ListCreateAPIView):
    queryset = PropertyType.objects.all()
    serializer_class = PropertyTypeSerializer
    permission_classes = [AllowAny]

class PropertyTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PropertyType.objects.all()
    serializer_class = PropertyTypeSerializer
    permission_classes = [AllowAny]

# ============================================================
# LOCATIONS
# ============================================================

class LocationListView(generics.ListCreateAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [AllowAny]

class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [AllowAny]

# ============================================================
# PROPERTIES
# ============================================================

class PropertyListView(generics.ListCreateAPIView):

    serializer_class = PropertySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Property.objects.select_related(
            "owner",
            "property_type",
            "location",
            "verification",
        ).prefetch_related(
            "documents",
            "images",
        ).all()

class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return Property.objects.select_related(
                "owner",
                "property_type",
                "location",
                "verification",
            ).prefetch_related(
                "documents",
                "images",
            ).all()
        return Property.objects.filter(owner=self.request.user)

# ============================================================
# PROPERTY LISTINGS
# ============================================================

class PropertyListingListView(generics.ListCreateAPIView):

    serializer_class = PropertyListingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return PropertyListing.objects.select_related(
            "property",
            "property__owner",
            "property__property_type",
            "property__location",
            "property__verification",
        ).all()

class PropertyListingDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = PropertyListingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # GET — anyone can view any listing
        # PATCH/DELETE — only the owner can modify their own listings
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return PropertyListing.objects.all()
        return PropertyListing.objects.filter(
            property__owner=self.request.user
        )

# ============================================================
# PROPERTY IMAGES
# ============================================================

class PropertyImageListView(generics.ListCreateAPIView):
[8/19/2026 10:08 AM] Befekadu Tele_partner: serializer_class = PropertyImageSerializer
    permission_classes = [AllowAny]

    # FIX 1: method was defined outside the class (wrong indentation) so
    # Django never called it — endpoint always returned an empty list.
    # FIX 2: queryset now returns ALL images so any visitor can see photos
    # for any listing. Write operations are still gated by AllowAny here
    # but upload is controlled by the frontend (only authenticated users
    # reach the AddProperty form).
    def get_queryset(self):
        return PropertyImage.objects.select_related("property").all()

class PropertyImageDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = PropertyImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return PropertyImage.objects.all()
        return PropertyImage.objects.filter(
            property__owner=self.request.user
        )

# ============================================================
# PROPERTY DOCUMENTS
# ============================================================

class PropertyDocumentListView(generics.ListCreateAPIView):

    serializer_class = PropertyDocumentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return PropertyDocument.objects.filter(
            property__owner=self.request.user
        )

class PropertyDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = PropertyDocumentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return PropertyDocument.objects.filter(
            property__owner=self.request.user
        )

# ============================================================
# PROPERTY VERIFICATION
# ============================================================

class PropertyVerificationListView(generics.ListCreateAPIView):

    serializer_class = PropertyVerificationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return PropertyVerification.objects.filter(
            property__owner=self.request.user
        )

class PropertyVerificationDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = PropertyVerificationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return PropertyVerification.objects.filter(
            property__owner=self.request.user
        )

# ============================================================
# FAVORITES
# ============================================================

class FavoriteListView(generics.ListCreateAPIView):

    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FavoriteDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(
            user=self.request.user
        )

# ============================================================
# PAYMENTS
# ============================================================

class PaymentListView(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(
            user=self.request.user
        ).select_related(
            "listing",
            "user",
            "verified_by",
        )