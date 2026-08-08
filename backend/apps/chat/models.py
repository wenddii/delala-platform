from django.db import models

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

    def __str__(self):
        return f"{self.customer.full_name} -> {self.owner.full_name}"


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

    def __str__(self):
        return f"Message from {self.sender.full_name}"