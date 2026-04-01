from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FacilityViewSet, search_facilities, create_checkout_session, FAQListView, stripe_webhook, get_csrf_token, availability, contact_view



router = DefaultRouter()
router.register(r'facilities', FacilityViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('search/', search_facilities),
    path('create-checkout-session/', create_checkout_session, name='create_checkout_session'),
    path('faqs/', FAQListView.as_view(), name='faq_list'),
    path('stripe-webhook/', stripe_webhook, name='stripe-webhook'),
    path('csrf/', get_csrf_token, name='get_csrf_token'),
    path('contact/', contact_view, name='contact'),
    path('facilities/<str:facility_id>/availability/', availability, name='facility-availability'),

]
