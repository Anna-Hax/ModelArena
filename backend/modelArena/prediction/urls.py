from django.urls import path
from .views import RunPredictionView

urlpatterns = [
    path('run-prediction/', RunPredictionView.as_view(), name='run-prediction'),
]
