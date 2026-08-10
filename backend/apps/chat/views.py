from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    MessageSerializer,
)


# ============================================================
# CONVERSATIONS
# ============================================================

class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            Conversation.objects
            .filter(
                customer=user
            ) |
            Conversation.objects.filter(
                owner=user
            )
        ).select_related(
            "property_listing",
            "property_listing__property",
            "customer",
            "owner",
        ).distinct()

    def perform_create(self, serializer):
        serializer.save()


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            Conversation.objects
            .filter(
                customer=user
            ) |
            Conversation.objects.filter(
                owner=user
            )
        ).select_related(
            "property_listing",
            "property_listing__property",
            "customer",
            "owner",
        ).distinct()


# ============================================================
# MESSAGES
# ============================================================

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            Message.objects
            .filter(
                conversation__customer=user
            ) |
            Message.objects.filter(
                conversation__owner=user
            )
        ).select_related(
            "conversation",
            "sender",
        ).order_by("created_at")

    def perform_create(self, serializer):
        serializer.save()


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            Message.objects
            .filter(
                conversation__customer=user
            ) |
            Message.objects.filter(
                conversation__owner=user
            )
        ).select_related(
            "conversation",
            "sender",
        )
