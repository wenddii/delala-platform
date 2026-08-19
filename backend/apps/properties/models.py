from django.db import models
from apps.accounts.models import User
from django.utils.html import format_html, mark_safe
# ============================================================
# PROPERTY TYPE
# ============================================================

class PropertyType(models.Model):

    name = models.CharField(
        max_length=100
    )

    def __str__(self):
        return self.name



class Location(models.Model):

    city = models.CharField(
        max_length=100
    )

    sub_city = models.CharField(
        max_length=100
    )

    woreda = models.CharField(
        max_length=100
    )

    neighborhood = models.CharField(
        max_length=100
    )

    latitude = models.FloatField(
        null=True,
        blank=True
    )

    longitude = models.FloatField(
        null=True,
        blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "city",
                    "sub_city",
                    "woreda",
                    "neighborhood",
                ],
                name="unique_location_combination",
            )
        ]

    def __str__(self):
        return (
            f"{self.sub_city} - "
            f"Woreda {self.woreda} - "
            f"{self.neighborhood}"
        )


# ============================================================
# PROPERTY
# ============================================================

class Property(models.Model):

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING_PAYMENT = "pending_payment", "Pending Payment"
        PENDING_PAYMENT_VERIFICATION = (
            "pending_payment_verification",
            "Pending Payment Verification"
        )
        PUBLISHED = "published", "Published"
        UNPUBLISHED = "unpublished", "Unpublished"
        REJECTED = "rejected", "Rejected"

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="properties"
    )

    property_type = models.ForeignKey(
        "PropertyType",
        on_delete=models.CASCADE,
        related_name="properties"
    )

    location = models.ForeignKey(
        "Location",
        on_delete=models.CASCADE,
        related_name="properties"
    )

    bedrooms = models.IntegerField()

    bathrooms = models.IntegerField()

    area_sqm = models.FloatField()

    description = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.description[:50]
# ============================================================
# PROPERTY DOCUMENT
# ============================================================

class PropertyDocument(models.Model):

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    document_type = models.CharField(
        max_length=100
    )

    document = models.ImageField(
        upload_to="property_documents/"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.document_type


# ============================================================
# PROPERTY VERIFICATION
# ============================================================

class PropertyVerification(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    property = models.OneToOneField(
        Property,
        on_delete=models.CASCADE,
        related_name="verification"
    )

    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_properties"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.property.id} - {self.status}"


# ============================================================
# PROPERTY LISTING
# ============================================================

class PropertyListing(models.Model):

    class ListingType(models.TextChoices):
        RENT = "rent", "Rent"
        SALE = "sale", "Sale"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        UNPUBLISHED = "unpublished", "Unpublished"

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="listings"
    )

    title = models.CharField(
        max_length=255
    )

    listing_type = models.CharField(
        max_length=50,
        choices=ListingType.choices
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    currency = models.CharField(
        max_length=10,
        default="ETB"
    )

    price_period = models.CharField(
        max_length=50
    )

    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.DRAFT
    )

    published_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title


# ============================================================
# PROPERTY IMAGE
# ============================================================

class PropertyImage(models.Model):

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image_url = models.URLField()

    is_primary = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.property.id} Image"


# ============================================================
# FAVORITE
# ============================================================

from django.db import models

class Favorite(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="favorites"
    )

    property_listing = models.ForeignKey(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name="favorites"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "property_listing"],
                name="unique_user_favorite"
            )
        ]

    def __str__(self):
        return (
            f"{self.user.phone_number} - "
            f"{self.property_listing.title}"
        )

class Payment(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    listing = models.OneToOneField(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name="payment"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="payments"
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_provider = models.CharField(
        max_length=50
    )   # Telebirr, CBE, Awash...

    payment_method = models.CharField(
        max_length=50
    )   # Mobile Money, Bank Transfer

    screenshot = models.ImageField(
        upload_to="payment_screenshots/"
    )

    transaction_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_payments"
    )

    rejection_reason = models.TextField(
        blank=True,
        null=True
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )