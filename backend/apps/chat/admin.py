from django.contrib import admin

from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "property_listing",
        "customer",
        "owner",
        "created_at",
    )

    search_fields = (
        "customer__phone_number",
        "customer__full_name",
        "owner__phone_number",
        "owner__full_name",
        "property_listing__title",
    )

    list_filter = (
        "created_at",
    )

    autocomplete_fields = (
        "property_listing",
        "customer",
        "owner",
    )

    readonly_fields = (
        "created_at",
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "sender",
        "content_preview",
        "is_read",
        "created_at",
    )

    search_fields = (
        "content",
        "sender__phone_number",
        "sender__full_name",
        "conversation__customer__phone_number",
        "conversation__owner__phone_number",
        "conversation__property_listing__title",
    )

    list_filter = (
        "is_read",
        "created_at",
    )

    autocomplete_fields = (
        "conversation",
        "sender",
    )

    readonly_fields = (
        "created_at",
    )

    @admin.display(description="Content")
    def content_preview(self, obj):
        if len(obj.content) > 60:
            return obj.content[:60] + "..."
        return obj.content