from django.contrib import admin

from .models import PropertyType, Location

admin.site.register(PropertyType)
admin.site.register(Location)