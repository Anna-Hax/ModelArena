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
        help_text="ID of this hackathon on the blockchain"
    )
    
    is_active = models.BooleanField(default=True)  # Add this field to manage active hackathons
    
    @property
    def end_time(self):
        return self.start_time + timedelta(minutes=self.duration_minutes)
    
    @property
    def status(self):
        from django.utils import timezone
        now = timezone.now()
        
        if now < self.start_time:
            return "upcoming"
        elif self.start_time <= now <= self.end_time:
            return "ongoing"
        else:
            return "ended"
    
    def __str__(self):
        return f"{self.title} - {self.status}"
    
    class Meta:
        ordering = ['-start_time']  # Latest first