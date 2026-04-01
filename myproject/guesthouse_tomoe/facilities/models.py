from django.db import models
from django.core.exceptions import ValidationError
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile


class Amenity(models.Model):
    name_ja = models.CharField("アメニティ名（日本語）", max_length=100)
    name_en = models.CharField("Amenity Name (English)", max_length=100)

    def __str__(self):
        return self.name_ja


class Feature(models.Model):
    name_ja = models.CharField("設備名（日本語）", max_length=100)
    name_en = models.CharField("Feature Name (English)", max_length=100)

    def __str__(self):
        return self.name_ja


class Facility(models.Model):
    id = models.CharField("施設ID", max_length=50, primary_key=True, unique=True)
    roomid = models.CharField("部屋ID", max_length=50, unique=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    name_en = models.CharField(max_length=200, blank=True)
    name_zh = models.CharField(max_length=200, blank=True)
    location_ja = models.CharField("所在地（日本語）", max_length=255)
    location_en = models.CharField("Location (English)", max_length=255)
    location_zh = models.CharField(max_length=255, blank=True)
    map_link = models.URLField("Google Maps Link", max_length=500, blank=True, null=True)
    capacity = models.PositiveIntegerField("定員", default=1)
    description = models.TextField(default="")
    description_en = models.TextField(blank=True)
    description_zh = models.TextField(blank=True)
    amenities = models.ManyToManyField(Amenity, related_name="facilities", blank=True)
    amenities_text = models.TextField(blank=True)  # 多言語対応用のテキストフィールド
    amenities_text_en = models.TextField(blank=True)
    amenities_text_zh = models.TextField(blank=True)
    features = models.ManyToManyField("Feature", related_name="facilities", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    catchphrase_ja = models.CharField("キャッチコピー（日本語）", max_length=255, blank=True)
    catchphrase_en = models.CharField("Catchphrase (English)", max_length=255, blank=True)
    base_guests = models.PositiveIntegerField("ベース人数", default=2)
    base_price = models.PositiveIntegerField("ベース料金 (JPY)", default=10000)
    extra_guest_price = models.PositiveIntegerField("追加ゲスト1人あたりの料金 (JPY)", default=2000)
    prop_key = models.CharField("プロパティキー", max_length=255, blank=True, null=True)
    address = models.CharField(max_length=200, null=True, blank=True)
    address_en = models.CharField(max_length=200, blank=True)
    address_zh = models.CharField(max_length=200, blank=True)
    parking_spaces = models.PositiveIntegerField("駐車可能台数", default=0)
    booking_url = models.URLField("Booking.com Link", max_length=500, blank=True, null=True)


    def calculate_total_price(self, total_guests):
        if total_guests <= self.base_guests:
            return self.base_price
        extra_guests = total_guests - self.base_guests
        return self.base_price + extra_guests * self.extra_guest_price

    def clean(self):
        super().clean()
        amenities = list(self.amenities.values_list('id', flat=True))
        if len(amenities) != len(set(amenities)):
            raise ValidationError("Duplicate amenities detected.")

    def __str__(self):
        return self.name or self.name_en or self.name_zh


class FacilityImage(models.Model):
    facility = models.ForeignKey(Facility, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to='facility_images/')
    alt_text_ja = models.CharField("代替テキスト（日本語）", max_length=255, blank=True)
    alt_text_en = models.CharField("Alt Text (English)", max_length=255, blank=True)

    def save(self, *args, **kwargs):
        # 最大容量（例: 1MB = 1 * 1024 * 1024 bytes）
        max_file_size = 1 * 1024 * 1024

        if self.image:
            img = Image.open(self.image)
            
            # RGBに変換（JPEG以外のフォーマット対応）
            if img.mode != "RGB":
                img = img.convert("RGB")

            # 圧縮を試みる
            quality = 85  # 初期品質
            buffer = BytesIO()

            # ファイルサイズが制限以下になるまで品質を調整
            while True:
                buffer.seek(0)
                img.save(buffer, format="JPEG", quality=quality)
                file_size = buffer.tell()

                if file_size <= max_file_size or quality <= 10:
                    # サイズが制限内、または品質が最低値に達したら終了
                    break

                # 品質を下げて再試行
                quality -= 5

            # 新しい画像として保存
            buffer.seek(0)
            self.image = ContentFile(buffer.read(), name=self.image.name)

	# 元のsave()メソッドを呼び出し
        super().save(*args, **kwargs)


    def __str__(self):
        return self.alt_text_ja or self.alt_text_en or "No Alt Text"


class FAQ(models.Model):
    question_ja = models.CharField("質問（日本語）", max_length=255)
    answer_ja = models.TextField("回答（日本語）")
    question_en = models.CharField("Question (English)", max_length=255)
    answer_en = models.TextField("Answer (English)")
    created_at = models.DateTimeField("作成日", auto_now_add=True)
    updated_at = models.DateTimeField("更新日", auto_now=True)

    def __str__(self):
        return self.question_ja or self.question_en


class Reservation(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    room_name = models.CharField(max_length=255)
    check_in_date = models.DateField(null=True, blank=True)
    check_out_date = models.DateField(null=True, blank=True)
    guests = models.JSONField(default=dict)
    total_price = models.IntegerField()
    discount = models.IntegerField(default=0)
    final_price = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField("備考", blank=True, null=True)

    def __str__(self):
        return f"Reservation for {self.first_name} {self.last_name}"
