from django.contrib import admin
from .models import Genre, Product, ProductImage, BuyerInfo

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    max_num = 5

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('id', 'name_en', 'name_ja')
    search_fields = ('name_en', 'name_ja')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name_en', 'name_ja', 'price', 'created_at', 'updated_at', 'display_genres')
    list_filter = ('genres',)
    search_fields = ('name_en', 'name_ja', 'description_en', 'description_ja')
    filter_horizontal = ('genres',)
    readonly_fields = ('image_preview',)
    inlines = [ProductImageInline]

    def display_genres(self, obj):
        return ", ".join([genre.name_ja for genre in obj.genres.all()])
    display_genres.short_description = 'Genres'

    def image_preview(self, obj):
        if obj.image:
            from django.utils.html import format_html
            return format_html('<img src="{}" width="150" height="150" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Image Preview'
    
    

@admin.register(BuyerInfo)
class BuyerInfoAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email', 'nationality', 'postal_code', 'address1', 'address2', 'product_name', 'quantity', 'purchase_date', 'product_price', 'shipping_cost', 'total_price', )
    search_fields = ('name', 'email', 'phone')
    readonly_fields = ('purchase_date',)  # 購入日時は自動設定なので編集不可

