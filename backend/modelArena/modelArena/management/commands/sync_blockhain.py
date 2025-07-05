
# management/commands/sync_blockchain.py
from django.core.management.base import BaseCommand
from hackathon.models import HackathonConfig
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sync hackathons with blockchain'
    
    def handle(self, *args, **options):
        """
        Sync existing hackathons with blockchain
        """
        hackathons = HackathonConfig.objects.filter(
            is_active=True,
            blockchain_created=False
        )
        
        for hackathon in hackathons:
            self.stdout.write(f"Syncing hackathon: {hackathon.title}")
            
            blockchain_id = hackathon.create_on_blockchain()
            
            if blockchain_id:
                self.stdout.write(
                    self.style.SUCCESS(f"Successfully synced hackathon {hackathon.id} with blockchain ID {blockchain_id}")
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f"Failed to sync hackathon {hackathon.id}")
                )
