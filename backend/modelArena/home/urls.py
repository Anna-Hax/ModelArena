from django.urls import path

from .views import JWTTokenObtainPairView, RegisterAPIView,save_wallet_address


urlpatterns = [
    path('token/', JWTTokenObtainPairView.as_view()),
    path('register/', RegisterAPIView.as_view()),
    path('save-wallet/', save_wallet_address, name='save_wallet_address'),
]
