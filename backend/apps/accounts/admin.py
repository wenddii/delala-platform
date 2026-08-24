from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, UserProfile, PhoneOTP


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile Information"
    fk_name = "user"


class UserCreationForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput,
        required=True
    )

    email = forms.EmailField(
        required=False
    )

    class Meta:
        model = User
        fields = (
            "phone_number",
            "full_name",
            "email",
            "password",
        )

    def save(self, commit=True):
        user = super().save(commit=False)

        user.set_password(
            self.cleaned_data["password"]
        )

        if commit:
            user.save()

        return user


@admin.register(User)
class UserAdmin(BaseUserAdmin):

    add_form = UserCreationForm
    form = forms.ModelForm

    inlines = (
        UserProfileInline,
    )

    list_display = (
        "phone_number",
        "id",
        "full_name",
        "email",
        "is_staff",
        "phone_verified",
    )

    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        "phone_verified",
    )

    search_fields = (
        "phone_number",
        "id",
        "full_name",
        "email",
    )

    ordering = (
        "-created_at",
    )

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "phone_number",
                    "password",
                )
            },
        ),
        (
            "Personal Details",
            {
                "fields": (
                    "full_name",
                    "email",
                )
            },
        ),
        (
            "Permissions & Status",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "phone_verified",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Activity Metadata",
            {
                "fields": (
                    "last_login",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": (
                    "wide",
                ),
                "fields": (
                    "phone_number",
                    "full_name",
                    "email",
                    "password",
                ),
            },
        ),
    )



@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):

    list_display = (
        "get_full_name",
        "get_phone",
        "get_property_count",
        "address",
        "created_at",
    )

    search_fields = (
        "user__full_name",
        "user__phone_number",
        "address",
        "user__id",
    )

    list_filter = (
        "created_at",
    )

    readonly_fields = (
        "properties_list",
        "created_at",
        "updated_at",
    )

    @admin.display(
        ordering="user__full_name",
        description="Full Name"
    )
    def get_full_name(self, obj):
        return obj.user.full_name

    @admin.display(
        ordering="user__phone_number",
        description="Phone Number"
    )
    def get_phone(self, obj):
        return obj.user.phone_number

    @admin.display(
        description="Properties"
    )
    def get_property_count(self, obj):
        return obj.user.properties.count()

    @admin.display(
        description="Uploaded Properties"
    )
    def properties_list(self, obj):
        properties = obj.user.properties.select_related(
            "property_type",
            "location",
            "verification",
        ).all()

        if not properties:
            return "No properties uploaded."

        result = []

        for property in properties:
            try:
                verification_status = property.verification.status
            except Property.verification.RelatedObjectDoesNotExist:
                verification_status = "Not verified"

            result.append(
                f"#{property.id} | "
                f"{property.property_type.name} | "
                f"{property.location} | "
                f"{property.bedrooms} bedrooms | "
                f"Verification: {verification_status}"
            )

        return "\n".join(result)

@admin.register(PhoneOTP)
class PhoneOTPAdmin(admin.ModelAdmin):

    list_display = (
        "phone_number",
        "code",
        "is_used",
        "created_at",
        "expires_at",
    )

    list_filter = (
        "is_used",
        "created_at",
    )

    search_fields = (
        "phone_number",
        "code",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = (
        "-created_at",
    )