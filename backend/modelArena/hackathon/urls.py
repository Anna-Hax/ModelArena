from django.urls import path
from .views import HackathonStatusView, HackathonCreateView

urlpatterns = [
    path("status/", HackathonStatusView.as_view(), name="hackathon-status"),
    path("create/", HackathonCreateView.as_view(), name="hackathon-create"),
]
