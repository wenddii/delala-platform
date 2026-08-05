from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    MessageSerializer,
    
)


class ConversationListView(generics.ListCreateAPIView):

    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]


class MessageListView(generics.ListCreateAPIView):

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]