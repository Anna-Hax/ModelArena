from web3 import Web3
from .web3 import web3, account, CHAIN_ID, PUBLIC_ADDRESS
from .arena_abi import arena_abi

ARENA_CONTRACT_ADDRESS = Web3.to_checksum_address("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")

contract = web3.eth.contract(address=ARENA_CONTRACT_ADDRESS, abi=arena_abi)

def _send_transaction(tx):
    signed_tx = web3.eth.account.sign_transaction(tx, private_key=account.key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
    return web3.to_hex(tx_hash)

def create_hackathon(start_time: int):
    tx = contract.functions.createHackathon(start_time).build_transaction({
        "chainId": CHAIN_ID,
        "from": PUBLIC_ADDRESS,
        "nonce": web3.eth.get_transaction_count(PUBLIC_ADDRESS),
        "gas": 300000,
        "gasPrice": web3.eth.gas_price
    })
    return _send_transaction(tx)

def join_hackathon(hackathon_id: int, amount_in_wei: int):
    tx = contract.functions.joinHackathon(hackathon_id).build_transaction({
        "chainId": CHAIN_ID,
        "from": PUBLIC_ADDRESS,
        "nonce": web3.eth.get_transaction_count(PUBLIC_ADDRESS),
        "value": amount_in_wei,
        "gas": 300000,
        "gasPrice": web3.eth.gas_price
    })
    return _send_transaction(tx)

def fulfill_winner(hackathon_id: int, winner_address: str):
    data = contract.encodeABI(fn_name="fulfill", args=[[hackathon_id, winner_address]])
    tx = {
        "chainId": CHAIN_ID,
        "from": PUBLIC_ADDRESS,
        "to": ARENA_CONTRACT_ADDRESS,
        "nonce": web3.eth.get_transaction_count(PUBLIC_ADDRESS),
        "gas": 300000,
        "gasPrice": web3.eth.gas_price,
        "data": data
    }
    return _send_transaction(tx)

def get_players(hackathon_id: int):
    return contract.functions.getPlayers(hackathon_id).call()
