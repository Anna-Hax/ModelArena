import os
import sys
import django
import asyncio

# --- Django Setup ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "modelArena.settings")
django.setup()

# --- Web3 Setup ---
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware

from blockchain.web3_config import web3  # Use your configured Web3 instance here
from blockchain.arena_contract import contract, fulfill_winner  # Your custom contract interaction

# Inject POA middleware (for networks like Sepolia, Polygon, etc.)
web3.middleware_onion.inject(geth_poa_middleware, layer=0)

# --- Django Models ---
from prediction.models import PredictionResult
from hackathon.models import HackathonConfig
from django.db.models import F, FloatField, ExpressionWrapper

# --- Constants ---
PERFORM_UPKEEP_SELECTOR = web3.keccak(text="performUpkeep(bytes)").hex()[:10]


# --- Main Event Handler ---
async def handle_perform_upkeep(tx_hash):
    try:
        tx = web3.eth.get_transaction(tx_hash)
        if not tx.get("to") or tx["to"].lower() != contract.address.lower():
            return

        if not tx["input"].startswith(PERFORM_UPKEEP_SELECTOR):
            return

        # Decode performData to extract hackathonId
        encoded_data = tx["input"][10:]  # remove function selector (first 4 bytes = 8 hex chars = 10 with '0x')
        hackathon_id = int.from_bytes(bytes.fromhex(encoded_data[64:128]), byteorder='big')
        print(f"🔔 Detected performUpkeep for hackathon ID: {hackathon_id}")

        # Fetch hackathon from DB
        hackathon = HackathonConfig.objects.get(blockchain_id=hackathon_id)

        # Find winner
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

        # Call fulfill
        tx_hash = fulfill_winner(hackathon_id, wallet)
        print(f"✅ Fulfill sent! Tx: {tx_hash}")

    except HackathonConfig.DoesNotExist:
        print(f"❌ Hackathon {hackathon_id} not found in DB")
    except Exception as e:
        print(f"❌ Error in handle_perform_upkeep: {e}")


# --- Blockchain Monitoring Loop ---
async def monitor_blockchain():
    print("📡 Monitoring for performUpkeep calls...")
    latest_block = web3.eth.block_number

    while True:
        try:
            new_block = web3.eth.block_number
            for block_num in range(latest_block + 1, new_block + 1):
                block = web3.eth.get_block(block_num, full_transactions=True)
                for tx in block.transactions:
                    await handle_perform_upkeep(tx.hash.hex())
            latest_block = new_block
        except Exception as e:
            print(f"❌ Error in monitor_blockchain: {e}")
        await asyncio.sleep(10)


# --- Main Entry ---
if __name__ == "__main__":
    asyncio.run(monitor_blockchain())
