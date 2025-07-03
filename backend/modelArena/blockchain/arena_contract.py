from blockchain.web3_config import Web3
from .web3_config import web3, account, CHAIN_ID, PUBLIC_ADDRESS
from .arena_abi import arena_abi
from eth_abi import encode 

ARENA_CONTRACT_ADDRESS = Web3.to_checksum_address("0x5FbDB2315678afecb367f032d93F642f64180aa3")

contract = web3.eth.contract(address=ARENA_CONTRACT_ADDRESS, abi=arena_abi)

def _send_transaction(tx):
    try:
        signed_tx = web3.eth.account.sign_transaction(tx, private_key=account.key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        print(" Sent TX:", web3.to_hex(tx_hash))
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(" Receipt status:", receipt.status)
        print(" Receipt logs:", receipt.logs)
        return web3.to_hex(tx_hash)
    except Exception as e:
        print(" Transaction failed:", e)
        raise


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
    # Step 1: Encode (uint256, address) as bytes
    encoded_data = encode(["uint256", "address"], [hackathon_id, winner_address])

    tx = contract.functions.fulfill(encoded_data).build_transaction({
        "chainId": CHAIN_ID,
        "from": PUBLIC_ADDRESS,
        "nonce": web3.eth.get_transaction_count(PUBLIC_ADDRESS),
        "gas": 300000,
        "gasPrice": web3.eth.gas_price
    })

    return _send_transaction(tx)


def get_players(hackathon_id: int):
    return contract.functions.getPlayers(hackathon_id).call()
