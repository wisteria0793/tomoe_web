from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import Facility, Amenity, Feature, FacilityImage, FAQ, Reservation


class AmenityInline(admin.TabularInline):
    model = Facility.amenities.through
    extra = 1

    def save_formset(self, request, form, formset, change):
        if formset.model == self.model:
            existing = set(self.model.objects.values_list("facility_id", "amenity_id"))
            for obj in formset.save(commit=False):
                if (obj.facility_id, obj.amenity_id) in existing:
                    raise ValidationError("This amenity is already assigned to the facility.")
        formset.save()


class FeatureInline(admin.TabularInline):
    model = Facility.features.through
    extra = 1


class FacilityImageInline(admin.TabularInline):
    model = FacilityImage
    extra = 1


@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'capacity', 'base_price']
    search_fields = ['name', 'description']
    list_filter = ['capacity', 'created_at']


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ['name_ja', 'name_en']
    search_fields = ['name_ja', 'name_en']


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ['name_ja', 'name_en']
    search_fields = ['name_ja', 'name_en']


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question_ja', 'created_at', 'updated_at']
    search_fields = ['question_ja', 'answer_ja', 'question_en', 'answer_en']
    list_filter = ['created_at', 'updated_at']


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'room_name', 'final_price', 'created_at')
    list_filter = ('created_at', 'room_name')
    search_fields = ('first_name', 'last_name', 'email')


@admin.register(FacilityImage)
class FacilityImageAdmin(admin.ModelAdmin):
    list_display = ['facility', 'alt_text_ja', 'alt_text_en']
    search_fields = ['facility__name', 'alt_text_ja', 'alt_text_en']
