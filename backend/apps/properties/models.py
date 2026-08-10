from django.db import models
from apps.accounts.models import User

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
        return f"{self.sub_city} - Woreda {self.woreda} - {self.neighborhood}"






class Property(models.Model):
    
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



class PropertyListing(models.Model):
    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="listings"
    )

    title = models.CharField(
        max_length=255
    )

    listing_type = models.CharField(
        max_length=50
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
        default="Draft"
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



class PropertyDocument(models.Model):

    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    document_type = models.CharField(
        max_length=100
    )

    document_url = models.URLField()

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.document_type



from apps.accounts.models import User


class PropertyVerification(models.Model):

    property = models.OneToOneField(
        Property,
        on_delete=models.CASCADE,
        related_name="verification"
    )

    verified_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="verified_properties"
    )

    status = models.CharField(
        max_length=50
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

    def __str__(self):
        return f"{self.user.phone_number} - {self.property_listing.title}"




