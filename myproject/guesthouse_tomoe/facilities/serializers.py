from rest_framework import serializers
from .models import Facility, Amenity, Feature, FacilityImage, FAQ, Reservation
from django.utils.translation import get_language
import logging

logger = logging.getLogger(__name__)

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['name_ja', 'name_en']

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['name_ja', 'name_en']

class FacilityImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacilityImage
        fields = ['image', 'alt_text_ja', 'alt_text_en']

class FacilitySerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    features = FeatureSerializer(many=True, read_only=True)
    images = FacilityImageSerializer(many=True, read_only=True)
    
    # 言語に応じたフィールドを定義
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    amenities_text = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    catchphrase = serializers.SerializerMethodField()

    def get_name(self, obj):
        lang = self.context.get('language', 'ja')
        logger.debug(f"Serializer language context: {lang}")  # 言語コンテキストをログに出力
        if lang == 'en':
            return obj.name_en or obj.name
        elif lang == 'zh':
            return obj.name_zh or obj.name
        return obj.name

    def get_description(self, obj):
        lang = self.context.get('language', 'ja')
        if lang == 'en':
            return obj.description_en or obj.description
        elif lang == 'zh':
            return obj.description_zh or obj.description
        return obj.description

    def get_location(self, obj):
        lang = self.context.get('language', 'ja')
        if lang == 'en':
            return obj.location_en
        elif lang == 'zh':
            return obj.location_zh
        return obj.location_ja

    def get_amenities_text(self, obj):
        lang = self.context.get('language', 'ja')
        if lang == 'en':
            return obj.amenities_text_en or obj.amenities_text
        elif lang == 'zh':
            return obj.amenities_text_zh or obj.amenities_text
        return obj.amenities_text

    def get_address(self, obj):
        lang = self.context.get('language', 'ja')
        if lang == 'en':
            return obj.address_en or obj.address
        elif lang == 'zh':
            return obj.address_zh or obj.address
        return obj.address

    def get_catchphrase(self, obj):
        lang = self.context.get('language', 'ja')
        if lang == 'en':
            return obj.catchphrase_en
        return obj.catchphrase_ja

    class Meta:
        model = Facility
        fields = [
            'id',
            'roomid',
            'name',           # 言語に応じた名前
            'description',    # 言語に応じた説明
            'location',       # 言語に応じた場所
            'amenities_text', # 言語に応じたアメニティ情報
            'address',        # 言語に応じた住所
            'catchphrase',    # 言語に応じたキャッチフレーズ
            'map_link',
            'capacity',
            'amenities',
            'features',
            'images',
            'base_guests',
            'base_price',
            'extra_guest_price',
            'parking_spaces',
            'booking_url',
        ]



class FAQSerializer(serializers.ModelSerializer):
    # 言語に応じたフィールドを定義
    question = serializers.SerializerMethodField()
    answer = serializers.SerializerMethodField()

    def get_question(self, obj):
        lang = self.context.get('language', 'ja')
        logger.debug(f"FAQ Serializer language context: {lang}")
        if lang == 'en':
            return obj.question_en or obj.question_ja
        return obj.question_ja

    def get_answer(self, obj):
        lang = self.context.get('language', 'ja')
        if lang == 'en':
            return obj.answer_en or obj.answer_ja
        return obj.answer_ja

    class Meta:
        model = FAQ
        fields = [
            'id',
            'question',    # 言語に応じた質問
            'answer',      # 言語に応じた回答
            'created_at',
            'updated_at'
        ]
        
        
class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'  # すべてのフィールドをシリアライズ