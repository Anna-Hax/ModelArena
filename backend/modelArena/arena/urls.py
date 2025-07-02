from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArenaViewSet

router = DefaultRouter()
router.register(r"", ArenaViewSet, basename='arena')

urlpatterns = [
    path('', include(router.urls)),
]
