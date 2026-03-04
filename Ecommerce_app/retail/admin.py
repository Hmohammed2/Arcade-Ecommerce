from django.contrib import admin
from django_json_widget.widgets import JSONEditorWidget
from django.db import models
import nested_admin
from .models import (
    Category, Product, Order, OrderItem, Payment,
    ProductImage, ProductVariant,
    Bundle, BundleItem, BundleOption,
    BundleOptionValue, BundleComponent, Coupon, NewsletterSubscriber
)
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .tasks import handle_order_status_change

# ------------------------------------------------------------------
# UTIL: make bundle options readable everywhere in admin
# ------------------------------------------------------------------

def format_bundle_options(meta: dict | None) -> str:
    """
    Convert your bundle_options_meta JSON into something readable.

    Example input:
    {
      "10": {"21": 6, "22": 2}
    }

    Output:
    "Button Colour: 6× Red, 2× Black"
    """
    if not meta:
        return "No options"

    lines = []

    for option_id, values_map in meta.items():
        try:
            option = BundleOption.objects.get(id=option_id)
            label = option.name
        except BundleOption.DoesNotExist:
            label = f"Option {option_id}"

        parts = []
        for value_id, qty in values_map.items():
            try:
                val = BundleOptionValue.objects.get(id=value_id)
                name = val.label
            except BundleOptionValue.DoesNotExist:
                name = f"Value {value_id}"

            parts.append(f"{qty}× {name}")

        lines.append(f"{label}: " + ", ".join(parts))

    return " | ".join(lines)

# ------------------------------------------------------------------
# BASIC REGISTRATION
# ------------------------------------------------------------------

admin.site.register(Category)
admin.site.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "status",
        "payment_method_label",
        "created_at",
    )
    readonly_fields = (
        "payment_method_type",
        "payment_method_label",
    )

# ------------------------------------------------------------------
# IMPORT / EXPORT RESOURCES
# ------------------------------------------------------------------

class OrderItemResource(resources.ModelResource):
    class Meta:
        model = OrderItem

class OrderResource(resources.ModelResource):
    class Meta:
        model = Order
        fields = (
            "id", "status", "created_at",
            "total_price", "delivery_method", "delivery_fee",
        )

class ProductResource(resources.ModelResource):
    class Meta:
        model = Product

# ------------------------------------------------------------------
# COUPON ADMIN
# ------------------------------------------------------------------

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_percent", "is_active", "usage_count", "usage_limit")
    search_fields = ("code",)

# ------------------------------------------------------------------
# ORDER ITEM INLINE (inside Order page)
# ------------------------------------------------------------------

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    can_delete = False
    show_change_link = True

    fields = (
        "display_item",
        "quantity",
        "price",
        "colour",
        "display_bundle_options",
    )

    readonly_fields = ("display_item", "display_bundle_options")

    def display_item(self, obj):
        if obj.bundle:
            return f"🧰 BUNDLE — {obj.bundle.name}"
        if obj.product:
            colour = f" ({obj.colour})" if obj.colour else ""
            return f"📦 {obj.product.name}{colour}"
        return "⚠️ Unknown item"

    display_item.short_description = "Item"

    def display_bundle_options(self, obj):
        if obj.bundle:
            return format_bundle_options(obj.bundle_options_meta)
        return "—"

    display_bundle_options.short_description = "Bundle Options"

# ------------------------------------------------------------------
# ORDER ITEM ADMIN (standalone list view)
# ------------------------------------------------------------------

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "pretty_item",
        "quantity",
        "price",
        "colour",
        "pretty_bundle_options",
    )

    list_filter = ("order", "bundle", "product")
    search_fields = ("order__email", "product__name", "bundle__name")

    def pretty_item(self, obj):
        if obj.bundle:
            return f"BUNDLE: {obj.bundle.name}"
        if obj.product:
            colour = f" ({obj.colour})" if obj.colour else ""
            return f"{obj.product.name}{colour}"
        return "Unknown item"

    pretty_item.short_description = "Item"

    def pretty_bundle_options(self, obj):
        if obj.bundle:
            return format_bundle_options(obj.bundle_options_meta)
        return "—"

    pretty_bundle_options.short_description = "Bundle Breakdown"

# ------------------------------------------------------------------
# ORDER ADMIN
# ------------------------------------------------------------------

@admin.register(Order)
class OrderAdmin(ImportExportModelAdmin):
    resource_class = OrderResource

    list_display = (
        "id", "public_id", "email",
        "status", "total_price",
        "review_token", "created_at",
    )

    list_filter = ("status",)
    search_fields = ("email", "first_name", "last_name")
    inlines = [OrderItemInline]

    def save_model(self, request, obj, form, change):
        if change:
            old = Order.objects.get(pk=obj.pk)
            if old.status != obj.status:
                handle_order_status_change.delay(obj.id, old.status, obj.status)

        super().save_model(request, obj, form, change)

# ------------------------------------------------------------------
# PRODUCT ADMIN
# ------------------------------------------------------------------

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin):
    formfield_overrides = {
        models.JSONField: {"widget": JSONEditorWidget}
    }
    filter_horizontal = ("frequently_bought_together",)
    resource_class = ProductResource
    inlines = [ProductImageInline, ProductVariantInline]

    list_display = ("id", "name", "price", "stock")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "slug")

    def get_readonly_fields(self, request, obj=None):
        if obj and obj.variants.exists():
            return ["stock"]
        return []

# ------------------------------------------------------------------
# VARIANT ADMIN
# ------------------------------------------------------------------

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    search_fields = ("product__name", "colour")
    list_display = ("product", "colour", "stock")
    autocomplete_fields = ("product",)

# ------------------------------------------------------------------
# BUNDLE STRUCTURE ADMIN
# ------------------------------------------------------------------

class BundleItemInline(admin.TabularInline):
    model = BundleItem
    extra = 1
    autocomplete_fields = ["product"]
    min_num = 1

class BundleOptionValueInline(nested_admin.NestedTabularInline):
    model = BundleOptionValue
    extra = 1

class BundleOptionInline(nested_admin.NestedTabularInline):
    model = BundleOption
    inlines = [BundleOptionValueInline]
    extra = 1

class BundleComponentInline(nested_admin.NestedTabularInline):
    model = BundleComponent
    extra = 1

    autocomplete_fields = [
        "product",
        "variant",      # <-- THIS IS THE KEY LINE
        "option_value",
    ]

    fields = (
        "product",
        "variant",
        "option_value",
        "quantity",
    )

    verbose_name = "Bundle Component"
    verbose_name_plural = "Bundle Components"


@admin.register(Bundle)
class BundleAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "price",
        "discount_percent",
        "is_active",
        "is_featured",
        "max_available",
        "sort_order",
    )

    list_filter = ("is_active", "is_featured")
    search_fields = ("name", "slug", "short_description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")
    readonly_fields = ("price", "max_available")

    fieldsets = (
        ("Core", {
            "fields": (
                "name",
                "slug",
                "short_description",
                "description",
                "image",
            )
        }),
        ("Visibility", {
            "fields": (
                "is_active",
                "is_featured",
                "sort_order",
            )
        }),
        ("Pricing", {
            "fields": (
                "discount_percent",
                "price_override",
                "price",
            )
        }),
    )

    inlines = [
        BundleItemInline,
        BundleOptionInline,
        BundleComponentInline,
    ]

@admin.register(BundleItem)
class BundleItemAdmin(admin.ModelAdmin):
    list_display = ("bundle", "product", "quantity")
    autocomplete_fields = ("bundle", "product")
    list_filter = ("bundle",)

@admin.register(BundleOption)
class BundleOptionAdmin(admin.ModelAdmin):
    search_fields = ("name", "bundle__name")
    list_display = ("name", "bundle", "required")
    autocomplete_fields = ("bundle",)

@admin.register(BundleOptionValue)
class BundleOptionValueAdmin(admin.ModelAdmin):
    search_fields = ("label", "option__name")
    list_display = ("label", "option")
    autocomplete_fields = ("option",)

# ------------------------------------------------------------------
# NEWSLETTER SUBSCRIBER ADMIN
# --------------------------------------------------

@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = (
        "email",
        "is_active",
        "source",
        "created_at",
    )

    list_filter = (
        "is_active",
        "source",
        "created_at",
    )

    search_fields = (
        "email",
    )

    ordering = ("-created_at",)

    readonly_fields = ("created_at",)

    actions = [
        "mark_active",
        "mark_inactive",
        "export_as_csv",
    ]

    def mark_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} subscribers activated.")

    mark_active.short_description = "Activate selected subscribers"

    def mark_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} subscribers deactivated.")

    mark_inactive.short_description = "Deactivate selected subscribers"
