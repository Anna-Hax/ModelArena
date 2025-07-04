
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import HackathonConfig

from blockchain.arena_contract import create_hackathon as create_onchain_hackathon
from blockchain.arena_contract import contract
from blockchain.web3 import web3

@receiver(post_save, sender=HackathonConfig)
def sync_to_blockchain(sender, instance, created, **kwargs):
    if created and instance.blockchain_id is None:
        try:
            start_timestamp = int(instance.start_time.timestamp())

            tx_hash = create_onchain_hackathon(start_timestamp)
            receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

            logs = contract.events.HackathonCreated().process_receipt(receipt)
            onchain_id = logs[0]['args']['id']

            instance.blockchain_id = onchain_id
            instance.save(update_fields=["blockchain_id"])
            print(f"✅ Blockchain hackathon created with ID {onchain_id}")

        except Exception as e:
            print(f"❌ Failed to sync hackathon to blockchain:", e)
