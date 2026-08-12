from django.contrib import admin
from django.contrib import admin
from django.utils.html import format_html, mark_safe
from .models import PropertyVerification


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


# ============================================================
# PROPERTY TYPE
# ============================================================

@admin.register(PropertyType)
class PropertyTypeAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
    )

    search_fields = (
        "name",
    )


# ============================================================
# LOCATION
# ============================================================

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


# ============================================================
# PROPERTY
# ============================================================

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


# ============================================================
# PROPERTY LISTING
# ============================================================

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


# ============================================================
# PROPERTY IMAGE
# ============================================================

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


# ============================================================
# PROPERTY DOCUMENT
# ============================================================

@admin.register(PropertyDocument)
class PropertyDocumentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "property",
        "document_type",
        "document",
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
        "document_preview",
    )

    fields = (
        "property",
        "document_type",
        "document",
        "document_preview",
        "uploaded_at",
    )

    @admin.display(description="Document Preview")
    def document_preview(self, obj):

        if not obj or not obj.document:
            return "No document uploaded."

        return format_html(
            """
            <div>
                <img
                    src="{}"
                    style="
                        max-width: 500px;
                        max-height: 600px;
                        object-fit: contain;
                        border: 1px solid #ddd;
                        border-radius: 6px;
                    "
                >
                <br><br>
                <a href="{}" target="_blank">
                    Open Full Size
                </a>
            </div>
            """,
            obj.document.url,
            obj.document.url,
        )


# ============================================================
# PROPERTY VERIFICATION
# ============================================================



@admin.register(PropertyVerification)
class PropertyVerificationAdmin(admin.ModelAdmin):

    list_display = (
        "property",
        "get_owner",
        "status",
        "verified_by",
        "verified_at",
    )

    list_filter = (
        "status",
        "verified_at",
    )

    search_fields = (
        "property__description",
        "property__owner__phone_number",
        "property__owner__full_name",
    )

    autocomplete_fields = (
        "property",
        "verified_by",
    )

    readonly_fields = (
        "property_documents",
        "verified_at",
    )

    fieldsets = (
        (
            "Property",
            {
                "fields": (
                    "property",
                    "property_documents",
                )
            },
        ),
        (
            "Verification",
            {
                "fields": (
                    "status",
                    "remarks",
                    "verified_by",
                    "verified_at",
                )
            },
        ),
    )

    # Verification records are created automatically
    # when a property is created.
    def has_add_permission(self, request):
        return False

    @admin.display(description="Owner")
    def get_owner(self, obj):
        return obj.property.owner.full_name

    @admin.display(description="Property Documents")
    def property_documents(self, obj):

        if not obj or not obj.pk:
            return "Save the verification record first."

        documents = obj.property.documents.all()

        if not documents.exists():
            return "No documents uploaded."

        document_html = []

        for document in documents:

            # Document record exists but no file was uploaded
            if not document.document:
                document_html.append(
                    format_html(
                        """
                        <div style="
                            margin-bottom: 20px;
                            padding: 15px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                        ">
                            <strong>{}</strong>
                            <br>
                            <span>No document file uploaded.</span>
                        </div>
                        """,
                        document.document_type,
                    )
                )
                continue

            document_url = document.document.url

            document_html.append(
                format_html(
                    """
                    <div style="
                        margin-bottom: 25px;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                    ">

                        <strong>{}</strong>

                        <br><br>

                        <img
                            src="{}"
                            alt="{}"
                            style="
                                max-width: 600px;
                                max-height: 700px;
                                width: auto;
                                height: auto;
                                object-fit: contain;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                            "
                        >

                        <br><br>

                        <a
                            href="{}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open Full Size
                        </a>

                    </div>
                    """,
                    document.document_type,
                    document_url,
                    document.document_type,
                    document_url,
                )
            )

        # Django 6 requires format_html() to receive
        # arguments. The individual HTML blocks above
        # have already been safely formatted.
        return mark_safe(
            "".join(document_html)
        )

    def save_model(self, request, obj, form, change):

        # Automatically record which admin reviewed
        # the property.
        if (
            obj.status in [
                PropertyVerification.Status.VERIFIED,
                PropertyVerification.Status.REJECTED,
            ]
            and not obj.verified_by
        ):
            obj.verified_by = request.user

        super().save_model(
            request,
            obj,
            form,
            change,
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