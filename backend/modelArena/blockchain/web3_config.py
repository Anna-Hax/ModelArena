from web3 import Web3, AsyncWeb3
import os
from dotenv import load_dotenv

load_dotenv()

RPC_HTTP = os.getenv("RPC_HTTP")
RPC_WS = os.getenv("RPC_WS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
PUBLIC_ADDRESS = os.getenv("PUBLIC_ADDRESS")
CHAIN_ID = int(os.getenv("CHAIN_ID"))

# ✅ HTTP for transactions (sync)
web3 = Web3(Web3.HTTPProvider(RPC_HTTP))

if not web3.is_connected():
    raise Exception("❌ HTTP Web3 failed to connect.")

# ✅ WebSocket for listening to events (async, web3.py v7+)
web3_ws = AsyncWeb3(AsyncWeb3.WebSocketProvider(RPC_WS))
# Usage of web3_ws must be in an async context, e.g.:
# connected = await web3_ws.is_connected()

# 🧾 Wallet for sending transactions
account = web3.eth.account.from_key(PRIVATE_KEY)