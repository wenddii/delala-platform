from django.contrib import admin

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


@admin.register(PropertyType)
class PropertyTypeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
    )

    search_fields = (
        "name",
    )


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "city",
        "sub_city",
        "woreda",
        "neighborhood",
        "latitude",
        "longitude",
    )

    search_fields = (
        "city",
        "sub_city",
        "woreda",
        "neighborhood",
    )

    list_filter = (
        "city",
        "sub_city",
        "woreda",
    )


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "owner",
        "property_type",
        "location",
        "bedrooms",
        "bathrooms",
        "area_sqm",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "description",
        "owner__phone_number",
        "owner__full_name",
    )

    list_filter = (
        "property_type",
        "location__city",
        "location__sub_city",
        "bedrooms",
        "bathrooms",
    )

    autocomplete_fields = (
        "owner",
        "property_type",
        "location",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(PropertyListing)
class PropertyListingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "property",
        "listing_type",
        "price",
        "currency",
        "price_period",
        "status",
        "published_at",
        "created_at",
    )

    search_fields = (
        "title",
        "property__description",
        "property__owner__phone_number",
        "property__owner__full_name",
    )

    list_filter = (
        "listing_type",
        "status",
        "currency",
        "price_period",
    )

    autocomplete_fields = (
        "property",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "property",
        "is_primary",
        "created_at",
    )

    list_filter = (
        "is_primary",
    )

    search_fields = (
        "property__description",
        "property__owner__phone_number",
        "image_url",
    )

    autocomplete_fields = (
        "property",
    )

    readonly_fields = (
        "created_at",
    )


@admin.register(PropertyDocument)
class PropertyDocumentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "property",
        "document_type",
        "document_url",
        "uploaded_at",
    )

    list_filter = (
        "document_type",
    )

    search_fields = (
        "document_type",
        "property__description",
        "property__owner__phone_number",
    )

    autocomplete_fields = (
        "property",
    )

    readonly_fields = (
        "uploaded_at",
    )


@admin.register(PropertyVerification)
class PropertyVerificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "property",
        "verified_by",
        "status",
        "verified_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "property__description",
        "property__owner__phone_number",
        "verified_by__phone_number",
    )

    autocomplete_fields = (
        "property",
        "verified_by",
    )

    readonly_fields = (
        "verified_at",
    )


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "property_listing",
        "created_at",
    )

    search_fields = (
        "user__phone_number",
        "user__full_name",
        "property_listing__title",
    )

    list_filter = (
        "created_at",
    )

    autocomplete_fields = (
        "user",
        "property_listing",
    )

    readonly_fields = (
        "created_at",
    )