from django.urls import path

from .views import (
    PropertyTypeListView,
    PropertyTypeDetailView,
    LocationListView,
    LocationDetailView,
    PropertyListView,
    PropertyDetailView,
    PropertyListingListView,
    PropertyListingDetailView,
    PropertyImageListView,
    PropertyImageDetailView,
    PropertyDocumentListView,
    PropertyDocumentDetailView,
    PropertyVerificationListView,
    PropertyVerificationDetailView,
    FavoriteListView,
    FavoriteDetailView,
    PaymentListView,
    PaymentDetailView,
)

urlpatterns = [
    # Property Types
    path(
        "property-types/",
        PropertyTypeListView.as_view(),
        name="property-type-list",
    ),
    path(
        "property-types/<str:pk>/",
        PropertyTypeDetailView.as_view(),
        name="property-type-detail",
    ),

    # Locations
    path(
        "locations/",
        LocationListView.as_view(),
        name="location-list",
    ),
    path(
        "locations/<str:pk>/",
        LocationDetailView.as_view(),
        name="location-detail",
    ),

    # Properties
    path(
        "properties/",
        PropertyListView.as_view(),
        name="property-list",
    ),
    path(
        "properties/<str:pk>/",
        PropertyDetailView.as_view(),
        name="property-detail",
    ),

    # Property Listings
    path(
        "listings/",
        PropertyListingListView.as_view(),
        name="listing-list",
    ),
    path(
        "listings/<str:pk>/",
        PropertyListingDetailView.as_view(),
        name="listing-detail",
    ),

    # Property Images
    path(
        "images/",
        PropertyImageListView.as_view(),
        name="image-list",
    ),
    path(
        "images/<str:pk>/",
        PropertyImageDetailView.as_view(),
        name="image-detail",
    ),

    # Property Documents
    path(
        "documents/",
        PropertyDocumentListView.as_view(),
        name="document-list",
    ),
    path(
        "documents/<str:pk>/",
        PropertyDocumentDetailView.as_view(),
        name="document-detail",
    ),

    # Property Verification
    path(
        "verifications/",
        PropertyVerificationListView.as_view(),
        name="verification-list",
    ),
    path(
        "verifications/<str:pk>/",
        PropertyVerificationDetailView.as_view(),
        name="verification-detail",
    ),

    # Favorites
    path(
        "favorites/",
        FavoriteListView.as_view(),
        name="favorite-list",
    ),
    path(
        "favorites/<str:pk>/",
        FavoriteDetailView.as_view(),
        name="favorite-detail",
    ),
    

    path(
        "payments/",
        PaymentListView.as_view(),
        name="payment-list",
    ),

    path(
        "payments/<int:pk>/",
        PaymentDetailView.as_view(),
        name="payment-detail",
    ),

]