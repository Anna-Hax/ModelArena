from django.db import models
from datetime import timedelta

class HackathonConfig(models.Model):
    title = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)  # e.g. 1 hour

    dataset = models.FileField(
        upload_to='hackathon_datasets/',  # This is the subfolder inside MEDIA_ROOT
        blank=True,
        null=True,
        help_text="Upload dataset file (CSV, JSON, ZIP, etc.)"
    )


    @property
    def end_time(self):
        return self.start_time + timedelta(minutes=self.duration_minutes)

    def __str__(self):
        return self.title
    
  
