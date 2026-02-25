from django.contrib import admin
from .models import Article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "author",
        "is_published",
        "published_at",
        "updated_at",
    )
    list_filter = ("is_published", "author")
    search_fields = ("title", "excerpt", "content")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (None, {
            "fields": ("title", "slug", "author", "excerpt")
        }),
        ("Media", {
            "fields": ("thumbnail",)
        }),
        ("Content", {
            "fields": ("content",)
        }),
        ("Sticky CTA", {   # 👈 new section
            "fields": ("cta_label", "cta_url"),
            "description": "Leave blank to disable sticky CTA for this article."
        }),
        ("Publishing", {
            "fields": ("is_published", "published_at")
        }),
    )
