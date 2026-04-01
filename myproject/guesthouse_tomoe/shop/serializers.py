from rest_framework import serializers
from .models import Product, Genre, ProductImage, BuyerInfo

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name_en', 'name_ja']

class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.ImageField(source='image.url', read_only=True)

    class Meta:
        model = ProductImage
        fields = ['id', 'image_url']

class ProductSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__' 

class BuyerInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerInfo
        fields = ['name', 'phone', 'email', 'nationality', 'postal_code', 'address1', 'address2'] 
