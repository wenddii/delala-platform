from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/accounts/",
        include("apps.accounts.urls"),
    ),

    path(
        "api/properties/",
        include("apps.properties.urls"),
    ),

    path(
        "api/chat/",
        include("apps.chat.urls"),
    ),
]