from django.db import models
from django.utils.translation import gettext_lazy as _

class Genre(models.Model):
    name_en = models.CharField(max_length=100, unique=True, verbose_name=_("Name (English)"), default="未設定")
    name_ja = models.CharField(max_length=100, unique=True, verbose_name=_("Name (Japanese)"), default="未設定")
    def __str__(self):
        return self.name_ja

class Product(models.Model):
    name_en = models.CharField(max_length=255, verbose_name=_("Product Name (English)"), default="未設定")
    name_ja = models.CharField(max_length=255, verbose_name=_("Product Name (Japanese)"), default="未設定")
    description_en = models.TextField(blank=True, verbose_name=_("Description (English)"), default="")
    description_ja = models.TextField(blank=True, verbose_name=_("Description (Japanese)"), default="")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Price"))
    image = models.ImageField(upload_to='product_images/', blank=True, null=True, verbose_name=_("Image"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))
    genres = models.ManyToManyField(Genre, related_name='products', verbose_name=_("Genres"))
    stock = models.PositiveIntegerField(default=0, verbose_name=_("Stock"))

    def __str__(self):
        return self.name_ja

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE, verbose_name=_("Product"))
    image = models.ImageField(upload_to='product_images/', verbose_name=_("Image"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    def __str__(self):
        return f"Image for {self.product.name_ja}"

class BuyerInfo(models.Model):
    name = models.CharField(max_length=100, verbose_name=_("Name"))
    phone = models.CharField(max_length=50, verbose_name=_("Phone"))
    email = models.EmailField(max_length=255, verbose_name=_("Email"))
    nationality = models.CharField(max_length=50, verbose_name=_("Nationality"))
    postal_code = models.CharField(max_length=10, verbose_name=_("Postal Code"))
    address1 = models.CharField(max_length=255, verbose_name=_("Address 1"))
    address2 = models.CharField(max_length=255, blank=True, verbose_name=_("Address 2"))

    # 新しいフィールド
    product_name = models.CharField(max_length=255, verbose_name=_("Product Name"), blank=True, null=True,)  # 商品名
    quantity = models.PositiveIntegerField(verbose_name=_("Quantity"), default=1, blank=True, null=True,)  # 点数
    purchase_date = models.DateTimeField(auto_now_add=True, verbose_name=_("Purchase Date"), blank=True, null=True,)  # 購入日時
    product_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Product Price"), blank=True, null=True,)  # 商品の金額
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Shipping Cost"), blank=True, null=True,)  # 配送料
    total_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Total Price"), blank=True, null=True,)  # 合計金額

    def __str__(self):
        return f"{self.name} - {self.product_name} x{self.quantity} on {self.purchase_date}"

