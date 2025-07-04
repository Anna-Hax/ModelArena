
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import HackathonConfig
from time import time
from blockchain.arena_contract import create_hackathon as create_onchain_hackathon
from blockchain.arena_contract import contract
from blockchain.web3_config import web3, account

@receiver(post_save, sender=HackathonConfig)
def sync_to_blockchain(sender, instance, created, **kwargs):
    if created and instance.blockchain_id is None:
        try:
            start_timestamp = int(instance.start_time.timestamp())
            print("📅 start_timestamp being passed:", start_timestamp)
            print("🕒 now (block.timestamp):", int(time()))
            
            print("🧾 Using account:", account.address)
            balance = web3.eth.get_balance(account.address)
            print("💰 Account balance:", web3.from_wei(balance, "ether"), "ETH")
            tx_hash = create_onchain_hackathon(start_timestamp)
            receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
            
            print("🔍 Raw logs in receipt:", receipt['logs'])

            logs = contract.events.HackathonCreated().process_receipt(receipt)

            if not logs:
                print("❌ No HackathonCreated event found in transaction receipt.")
                print("🔍 Receipt:", receipt)
                return  # don't crash, just exit

            onchain_id = logs[0]['args']['id']
            instance.blockchain_id = onchain_id
            instance.save(update_fields=["blockchain_id"])
            print(f"✅ Blockchain hackathon created with ID {onchain_id}")

        except Exception as e:
            print(f"❌ Failed to sync hackathon to blockchain:", e)

