from django.urls import path
from .views import ProductListCreateView, GenreListCreateView, CreateCheckoutSessionView, stripe_webhook, get_csrf_token

urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product-list-create'),
    path('genres/', GenreListCreateView.as_view(), name='genre-list-create'),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('stripe-webhook/', stripe_webhook, name='stripe-webhook'), 
    path('csrf-token/', get_csrf_token, name='get_csrf_token'),
]
