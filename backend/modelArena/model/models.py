from django.db import models
from hackathon.models import HackathonConfig
from django.contrib.auth.models import User

# Create your models here.
class AiModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    model = models.FileField(upload_to='uploads/')
    hackathon = models.ForeignKey(HackathonConfig, on_delete=models.CASCADE, null=True, blank=True) 