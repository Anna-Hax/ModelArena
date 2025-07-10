from django.db import models
from hackathon.models import HackathonConfig
from django.contrib.auth.models import User

# Create your models here.
# In your models.py
class AiModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    model = models.FileField(upload_to='uploads/models/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    reward_token = models.IntegerField(default=0)  # New field for reward tokens
    hackathon = models.ForeignKey(HackathonConfig, on_delete=models.CASCADE) 
    
    def __str__(self):
        return f"{self.user.username} - {self.model.name}"