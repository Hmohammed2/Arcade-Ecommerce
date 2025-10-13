from django.contrib import admin
from .models import Category, Product, Order, OrderItem, Payment
from import_export import resources
from import_export.admin import ImportExportModelAdmin

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock')
    prepopulated_fields = {"slug": ("name",)}
    
# Register your models here.
admin.site.register(Category)
admin.site.register(Payment)

class OrderItemResource(resources.ModelResource):
    class Meta:
        model = OrderItem

class OrderResource(resources.ModelResource):
    class Meta:
        model = Order
        fields = ('id', 'status', 'created_at', 'total_price',)

class ProductResource(resources.ModelResource):
    class Meta:
        model = Product

@admin.register(OrderItem)
class OrderItemAdmin(ImportExportModelAdmin):
    resource_class = OrderItemResource

@admin.register(Order)
class OrderAdmin(ImportExportModelAdmin):
    resource_class = OrderResource

@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin):
    resource_class = ProductResource