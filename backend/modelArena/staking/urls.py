from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StakeViewSet

router = DefaultRouter()
router.register(r"", StakeViewSet, basename='staking')

urlpatterns = [
    path('', include(router.urls)),
]
