from django.db import models
from django.db.models import Q

from apps.accounts.models import User
from apps.properties.models import PropertyListing


class Conversation(models.Model):

    property_listing = models.ForeignKey(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name="conversations"
    )

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="customer_conversations"
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owner_conversations"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "property_listing",
                    "customer",
                ],
                name="unique_customer_property_conversation",
            ),

            models.CheckConstraint(
                condition=~Q(customer=models.F("owner")),
                name="customer_cannot_be_owner",
            ),
        ]

        indexes = [
            models.Index(
                fields=["property_listing"]
            ),
            models.Index(
                fields=["customer"]
            ),
            models.Index(
                fields=["owner"]
            ),
        ]

    def __str__(self):
        return (
            f"{self.customer.full_name} -> "
            f"{self.owner.full_name} | "
            f"{self.property_listing.title}"
        )


class Message(models.Model):

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    content = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        indexes = [
            models.Index(
                fields=["conversation", "created_at"]
            ),
            models.Index(
                fields=["sender"]
            ),
        ]

        ordering = [
            "created_at"
        ]

    def __str__(self):
        return f"Message from {self.sender.full_name}"

