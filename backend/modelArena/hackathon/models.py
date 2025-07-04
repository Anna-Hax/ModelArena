from django.db import models
from datetime import timedelta

class HackathonConfig(models.Model):
    title = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)

    dataset = models.FileField(
        upload_to='hackathon_datasets/',
        blank=True,
        null=True,
        help_text="Upload dataset file (CSV, JSON, ZIP, etc.)"
    )

    blockchain_id = models.IntegerField(
    null=True,
    blank=True,
    unique=True,  # <-- Add this
    help_text="ID of this hackathon on the blockchain"
   )

    fulfilled = models.BooleanField(default=False)
    @property
    def end_time(self):
        return self.start_time + timedelta(minutes=self.duration_minutes)

    def __str__(self):
        return self.title

    
  
