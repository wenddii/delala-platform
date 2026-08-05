from django.urls import path
from .views import (
    ConversationListView,
    ConversationDetailView,
    MessageListView,
    MessageDetailView,
)

urlpatterns = [
    # Conversations
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    
    # Messages
    path('messages/', MessageListView.as_view(), name='message-list'),
    path('messages/<int:pk>/', MessageDetailView.as_view(), name='message-detail'),
]