from django.urls import path
from .views import HackathonStatusView

urlpatterns = [
    path("status/", HackathonStatusView.as_view(), name="hackathon-status"),
]
