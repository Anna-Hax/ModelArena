from django.urls import path

from .views import AiModelUploadView


urlpatterns = [
    path('', AiModelUploadView.as_view()),
]
