import os
import sys
import django
import asyncio

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "modelArena.settings")
django.setup()

from blockchain.web3_config import web3  # ✅ Use HTTP provider here
from blockchain.arena_contract import contract, fulfill_winner
from prediction.models import PredictionResult
from hackathon.models import HackathonConfig
from django.db.models import F, FloatField, ExpressionWrapper

async def handle_event(event):
    hackathon_id = event["args"]["id"]
    print(f"🔔 HackathonEnded event detected for ID: {hackathon_id}")

    try:
        hackathon = HackathonConfig.objects.get(blockchain_id=hackathon_id)
    except HackathonConfig.DoesNotExist:
        print("❌ Hackathon not found in DB")
        return

    predictions = PredictionResult.objects.filter(hackathon=hackathon).annotate(
        avg_error=ExpressionWrapper(
            (F('error_5') + F('error_10') + F('error_15')) / 3.0,
            output_field=FloatField()
        )
    ).order_by('avg_error')

    if not predictions.exists():
        print("⚠️ No predictions available")
        return

    best = predictions.first()
    user = best.model.user
    wallet = user.profile.wallet_address
    if not wallet:
        print("❌ No wallet address found")
        return

    try:
        tx_hash = fulfill_winner(hackathon_id, wallet)
        print(f"✅ Fulfill sent! Tx: {tx_hash}")
    except Exception as e:
        print(f"❌ Fulfill error: {e}")

async def log_loop():
    print("📡 Listening for HackathonEnded events...")

    latest_block = web3.eth.block_number

    while True:
        try:
            new_events = contract.events.HackathonEnded().get_logs(from_block=latest_block + 1)
            for event in new_events:
                await handle_event(event)
            if new_events:
                latest_block = new_events[-1]["blockNumber"]
        except Exception as e:
            print(f"❌ Error in event loop: {e}")
        await asyncio.sleep(10)

if __name__ == "__main__":
    asyncio.run(log_loop())
