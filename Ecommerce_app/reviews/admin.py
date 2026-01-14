# reviews/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    # What you see in the main list
    list_display = (
        "id",
        "order_public_id",
        "rating_badge",
        "short_body",
        "display_name",
        "verified_purchase",
        "status",
        "created_at",
    )

    # Sidebar filters
    list_filter = (
        "status",
        "rating",
        "verified_purchase",
        "created_at",
    )

    # Top search box
    search_fields = (
        "order_public_id",
        "display_name",
        "email",
        "body",
        "title",
    )

    # Default ordering
    ordering = ("-created_at",)

    # Readonly fields (audit protection)
    readonly_fields = (
        "created_at",
        "ip_address",
        "user_agent",
        "order",
        "order_public_id",
    )

    # Quick moderation actions
    actions = ["approve_reviews", "reject_reviews"]

    # Field layout
    fieldsets = (
        ("Order", {
            "fields": ("order", "order_public_id", "verified_purchase")
        }),
        ("Review Content", {
            "fields": ("rating", "title", "body")
        }),
        ("Customer", {
            "fields": ("display_name", "email", "consent_to_publish_name")
        }),
        ("Moderation", {
            "fields": ("status",)
        }),
        ("Audit", {
            "classes": ("collapse",),
            "fields": ("ip_address", "user_agent", "created_at")
        }),
    )

    # ⭐ Star rating visual
    def rating_badge(self, obj):
        stars = "★" * obj.rating + "☆" * (5 - obj.rating)
        return format_html(
            '<span style="color:#f59e0b;font-weight:600;">{}</span>',
            stars
        )
    rating_badge.short_description = "Rating"

    # Short preview of review
    def short_body(self, obj):
        if len(obj.body) > 60:
            return obj.body[:60] + "…"
        return obj.body
    short_body.short_description = "Review"

    # Admin bulk approve
    def approve_reviews(self, request, queryset):
        updated = queryset.update(status=Review.Status.APPROVED)
        self.message_user(request, f"{updated} reviews approved.")
    approve_reviews.short_description = "Approve selected reviews"

    # Admin bulk reject
    def reject_reviews(self, request, queryset):
        updated = queryset.update(status=Review.Status.REJECTED)
        self.message_user(request, f"{updated} reviews rejected.")
    reject_reviews.short_description = "Reject selected reviews"
