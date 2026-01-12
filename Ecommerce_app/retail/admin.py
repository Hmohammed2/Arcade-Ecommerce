from django.contrib import admin
from .models import Category, Product, Order, OrderItem, Payment, ProductImage, ProductVariant
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .tasks import handle_order_status_change
from .models import Coupon

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1  # allows adding new ones quickly

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    
# Register your models here.
admin.site.register(Category)
admin.site.register(Payment)

class OrderItemResource(resources.ModelResource):
    class Meta:
        model = OrderItem

class OrderResource(resources.ModelResource):
    class Meta:
        model = Order
        fields = ('id', 'status', 'created_at', 'total_price', "delivery_method", "delivery_fee",)

class ProductResource(resources.ModelResource):
    class Meta:
        model = Product

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_percent", "is_active", "usage_count", "usage_limit")
    search_fields = ("code",)

@admin.register(OrderItem)
class OrderItemAdmin(ImportExportModelAdmin):
    resource_class = OrderItemResource

@admin.register(Order)
class OrderAdmin(ImportExportModelAdmin):
    resource_class = OrderResource
    list_display = ("id", "email", "status", "total_price", "created_at")
    list_filter = ("status",)
    search_fields = ("email", "first_name", "last_name")

    def save_model(self, request, obj, form, change):
        if change:
            old = Order.objects.get(pk=obj.pk)
            if old.status != obj.status:
                handle_order_status_change.delay(obj.id, old.status, obj.status)

        super().save_model(request, obj, form, change)

@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin):
    resource_class = ProductResource
    inlines = [ProductImageInline, ProductVariantInline]
    list_display = ('name', 'price', 'stock')
    prepopulated_fields = {"slug": ("name",)}
    
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.variants.exists():
            return ['stock']
        return []
    
    def display_stock(self, obj):
        return obj.total_stock
    display_stock.short_description = 'Total Stock'