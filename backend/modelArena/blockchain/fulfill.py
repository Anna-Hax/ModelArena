import os
import sys
import django
import asyncio
from web3.middleware import ExtraDataToPOAMiddleware
from asgiref.sync import sync_to_async
from django.db.models import F, FloatField, ExpressionWrapper

# --- Django Setup ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "modelArena.settings")
django.setup()

# --- Web3 Setup ---
from blockchain.web3_config import web3
from blockchain.arena_contract import contract, fulfill_winner
web3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

# --- Django Models ---
from prediction.models import PredictionResult
from hackathon.models import HackathonConfig

# --- Constants ---
PERFORM_UPKEEP_SELECTOR = web3.keccak(text="performUpkeep(bytes)")[:4].hex()
print("🧩 Expected performUpkeep selector:", PERFORM_UPKEEP_SELECTOR)

# --- Enhanced ORM Logic ---
@sync_to_async
def get_winner_wallet(hackathon_id):
    print(f"\n🔍 [DEBUG] Looking up hackathon_id: {hackathon_id}")
    
    try:
        # Convert to integer explicitly
        hackathon_id = int(hackathon_id)
        
        # Debug: Print all hackathons for verification
        all_hackathons = HackathonConfig.objects.all().values('id', 'blockchain_id')
        print(f"📋 All hackathons in DB: {list(all_hackathons)}")
        
        hackathon = HackathonConfig.objects.get(blockchain_id=hackathon_id)
        print(f"✅ Found hackathon: DB ID {hackathon.id}, blockchain_id {hackathon.blockchain_id}")
        
        predictions = PredictionResult.objects.filter(hackathon=hackathon).annotate(
            avg_error=ExpressionWrapper(
                (F('error_5') + F('error_10') + F('error_15')) / 3.0,
                output_field=FloatField()
            )
        ).order_by('avg_error')

        if not predictions.exists():
            print("⚠️ No predictions found for this hackathon")
            return None, None, None

        best = predictions.first()
        user = best.model.user
        wallet = user.profile.wallet_address
        
        if not wallet:
            print(f"⚠️ User {user.username} has no wallet address")
            return None, None, None
            
        print(f"🏆 Found winner: {user.username} ({wallet})")
        return user.username, wallet, hackathon_id

    except HackathonConfig.DoesNotExist:
        print(f"❌ Hackathon {hackathon_id} not found in database")
        return None, None, None
    except Exception as e:
        print(f"❌ Unexpected error in get_winner_wallet: {str(e)}")
        return None, None, None

# --- Transaction Handler ---
async def handle_perform_upkeep(tx_hash):
    try:
        print(f"\n{'='*50}")
        print(f"🔎 Processing transaction: {tx_hash}")
        
        tx = web3.eth.get_transaction(tx_hash)
        if not tx:
            print("⛔ Failed to fetch transaction")
            return

        # Validate transaction target
        if not tx.get("to") or tx["to"].lower() != contract.address.lower():
            print(f"⛔ Not targeting Arena contract (target: {tx.get('to')})")
            return

        # Process input data
        input_data = tx["input"]
        if isinstance(input_data, bytes):
            input_data = input_data.hex()
            
        if not input_data.startswith(PERFORM_UPKEEP_SELECTOR):
            print("⏭️ Not a performUpkeep call")
            return

        # Extract hackathon ID
        encoded_data = input_data[10:]
        hackathon_id = int.from_bytes(bytes.fromhex(encoded_data[:64]), byteorder='big')
        original_id = hackathon_id
        print(f"ℹ️ Extracted Hackathon ID from tx input: {hackathon_id}")
        
        print(f"ℹ️ Raw ID: {original_id} | Normalized ID: {hackathon_id}")
        
        # Get winner details
        username, wallet, _ = await get_winner_wallet(hackathon_id)
        
        if not wallet:
            print(f"❌ Could not determine winner for hackathon {hackathon_id}")
            return
            
        # Execute fulfillment
        print(f"🏆 Submitting winner: {username} ({wallet})")
        try:
            tx_hash = fulfill_winner(hackathon_id, wallet)
            print(f"🎉 Success! Tx hash: {tx_hash.hex()}")
        except Exception as e:
            print(f"❌ Failed to submit fulfillment: {str(e)}")

    except Exception as e:
        print(f"❌ Critical error in handle_perform_upkeep: {str(e)}")
        import traceback
        traceback.print_exc()

# --- Blockchain Monitor ---
async def monitor_blockchain():
    print("\n📡 Starting blockchain monitor...")
    latest_block = max(0, web3.eth.block_number - 5)
    
    # Initial state report
    initial_hackathons = await sync_to_async(list)(HackathonConfig.objects.all().values('id', 'blockchain_id'))
    print(f"📋 Initial hackathon state: {initial_hackathons}")
    print(f"⚙️ Contract address: {contract.address}")
    print(f"⛓ Current block: {web3.eth.block_number}")
    
    while True:
        try:
            current_block = web3.eth.block_number
            if current_block <= latest_block:
                await asyncio.sleep(5)
                continue
                
            print(f"\n🔄 Processing blocks {latest_block + 1} to {current_block}")
            
            for block_num in range(latest_block + 1, current_block + 1):
                block = web3.eth.get_block(block_num, full_transactions=True)
                print(f"🔍 Scanning block #{block_num} ({len(block.transactions)} txns)")
                
                for tx in block.transactions:
                    await handle_perform_upkeep(tx.hash.hex())
                    
            latest_block = current_block
            
        except Exception as e:
            print(f"❌ Monitor error: {str(e)}")
            
        await asyncio.sleep(5)

# --- Entry Point ---
if __name__ == "__main__":
    # Manual test block
    username, wallet, hid = asyncio.run(get_winner_wallet(0))  # replace 0 with your real blockchain ID
    if wallet:
        print(f"🏁 Triggering fulfill() with wallet {wallet} for hackathon {hid}")
        tx_hash = fulfill_winner(hid, wallet)
        print("🎉 Fulfill tx sent:", tx_hash)
    else:
        print("❌ Could not find wallet. Ensure prediction & profile setup.")