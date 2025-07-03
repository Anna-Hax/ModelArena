from django.db import models
from model.models import AiModel
from django.contrib.auth.models import User
from hackathon.models import HackathonConfig
# Create your models here.
class PredictionResult(models.Model):
    model = models.ForeignKey(AiModel, on_delete=models.CASCADE)
    hackathon = models.ForeignKey(HackathonConfig, on_delete=models.CASCADE, null=True, blank=True)#optional right now
    timestamp = models.DateTimeField(auto_now_add=True)

    pred_5 = models.FloatField()
    pred_10 = models.FloatField()
    pred_15 = models.FloatField()

    actual_5 = models.FloatField(null=True, blank=True)
    actual_10 = models.FloatField(null=True, blank=True)
    actual_15 = models.FloatField(null=True, blank=True)

    error_5 = models.FloatField(null=True, blank=True)
    error_10 = models.FloatField(null=True, blank=True)
    error_15 = models.FloatField(null=True, blank=True)