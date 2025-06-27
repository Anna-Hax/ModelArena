from django.urls import path

from .views import JWTTokenObtainPairView, RegisterAPIView


urlpatterns = [
    path('token/', JWTTokenObtainPairView.as_view()),
    path('register/', RegisterAPIView.as_view()),
]
