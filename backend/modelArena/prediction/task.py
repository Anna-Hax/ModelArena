# In tasks.py (if using Celery)
from celery import shared_task
from datetime import datetime, timedelta
from .views import calculate_and_award_rewards 

@shared_task
def award_rewards_task():
    """
    Periodic task to award rewards for predictions older than 5 minutes
    """
    calculate_and_award_rewards()

# Or create a Django management command
# management/commands/award_rewards.py
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Award reward tokens to models with best accuracy'

    def handle(self, *args, **options):
        calculate_and_award_rewards()
        self.stdout.write(self.style.SUCCESS('Rewards calculated and awarded!'))