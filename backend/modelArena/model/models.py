from django.db import models

from django.contrib.auth.models import User

# Create your models here.
class AiModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    model = models.FileField(upload_to='uploads/')
    wallet_address = models.CharField()