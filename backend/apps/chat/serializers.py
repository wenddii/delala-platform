from rest_framework import serializers

from .models import Conversation, Message
from apps.properties.models import PropertyListing


class ConversationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Conversation
        fields = [
            "id",
            "property_listing",
            "customer",
            "owner",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "customer",
            "owner",
            "created_at",
        ]

    def validate_property_listing(self, listing):

        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        customer = request.user

        # Get the actual owner from the property listing.
        owner = listing.property.owner

        # The owner cannot contact themselves.
        if customer == owner:
            raise serializers.ValidationError(
                "You cannot start a conversation with yourself."
            )

        # Only listed properties can be contacted.
        if listing.status.lower() not in [
            "published",
            "available",
        ]:
            raise serializers.ValidationError(
                "This property listing is not available for contact."
            )

        # The property must be verified.
        try:
            verification = listing.property.verification
        except PropertyListing.property.RelatedObjectDoesNotExist:
            raise serializers.ValidationError(
                "This property has not been verified."
            )

        if verification.status != "verified":
            raise serializers.ValidationError(
                "You can only contact owners of verified properties."
            )

        return listing

    def create(self, validated_data):

        request = self.context["request"]

        customer = request.user
        listing = validated_data["property_listing"]

        owner = listing.property.owner

        # Reuse an existing conversation instead of
        # creating duplicate conversations.
        conversation, created = Conversation.objects.get_or_create(
            property_listing=listing,
            customer=customer,
            defaults={
                "owner": owner,
            },
        )

        # This protects against an inconsistent existing record.
        if conversation.owner != owner:
            conversation.owner = owner
            conversation.save(update_fields=["owner"])

        return conversation


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message

        fields = [
            "id",
            "conversation",
            "sender",
            "content",
            "is_read",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "sender",
            "is_read",
            "created_at",
        ]

    def validate_conversation(self, conversation):

        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        # Only the customer or owner can participate.
        if user not in [
            conversation.customer,
            conversation.owner,
        ]:
            raise serializers.ValidationError(
                "You are not a participant in this conversation."
            )

        return conversation

    def create(self, validated_data):

        request = self.context["request"]

        conversation = validated_data["conversation"]

        # The sender is always the authenticated user.
        validated_data["sender"] = request.user

        return Message.objects.create(**validated_data)
