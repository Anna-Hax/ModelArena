from django.urls import path
from .views import RunPredictionView, LeaderboardView

urlpatterns = [
    path('run-prediction/', RunPredictionView.as_view(), name='run-prediction'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard')
]
