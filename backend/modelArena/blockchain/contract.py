from .web3 import web3, account, CHAIN_ID, PUBLIC_ADDRESS
from .arena_abi import arena_abi
from web3 import Web3

ARENA_CONTRACT_ADDRESS = Web3.to_checksum_address("0x5fbdb2315678afecb367f032d93f642f64180aa3")  # Replace with actual deployed address

contract = web3.eth.contract(address=ARENA_CONTRACT_ADDRESS, abi=arena_abi)

def call_fulfill(hackathon_id: int, winner_address: str):
    data = contract.encodeABI(fn_name="fulfill", args=[[hackathon_id, winner_address]])  # args is a list

    tx = {
        "chainId": CHAIN_ID,
        "from": PUBLIC_ADDRESS,
        "to": ARENA_CONTRACT_ADDRESS,
        "nonce": web3.eth.get_transaction_count(PUBLIC_ADDRESS),
        "gas": 300000,
        "gasPrice": web3.eth.gas_price,
        "data": data
    }

    signed_tx = web3.eth.account.sign_transaction(tx, private_key=account.key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    return web3.to_hex(tx_hash)
