from django import forms
from .models import Facility

class FacilityAdminForm(forms.ModelForm):
    class Meta:
        model = Facility
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()
        amenities = list(self.instance.amenities.values_list('id', flat=True))
        if len(amenities) != len(set(amenities)):
            raise forms.ValidationError("Duplicate amenities detected.")
        return cleaned_data
