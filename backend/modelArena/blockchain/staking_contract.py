# from web3 import Web3
# from .web3 import web3, account, CHAIN_ID, PUBLIC_ADDRESS
# from .staking_abi import staking_abi

# STAKING_CONTRACT_ADDRESS = Web3.to_checksum_address("StakingContractAddress") 

# contract = web3.eth.contract(address=STAKING_CONTRACT_ADDRESS, abi=staking_abi)


# def enter_platform():
#     tx = contract.functions.enterPlatform().build_transaction({
#         "chainId": CHAIN_ID,
#         "from": PUBLIC_ADDRESS,
#         "nonce": web3.eth.get_transaction_count(PUBLIC_ADDRESS),
#         "gas": 300000,
#         "gasPrice": web3.eth.gas_price
#     })

#     signed_tx = web3.eth.account.sign_transaction(tx, private_key=account.key)
#     tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
#     return web3.to_hex(tx_hash)


# def stake_for_model(amount_wei: int):
#     tx = contract.functions.stakeForModel(amount_wei).build_transaction({
#         "chainId": CHAIN_ID,
#         "from": PUBLIC_ADDRESS,
#         "nonce": web3.eth.get_transaction_count(PUBLIC_ADDRESS),
#         "gas": 300000,
#         "gasPrice": web3.eth.gas_price
#     })

#     signed_tx = web3.eth.account.sign_transaction(tx, private_key=account.key)
#     tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
#     return web3.to_hex(tx_hash)


# def get_total_stake(user_address: str):
#     return contract.functions.totalStakeOf(Web3.to_checksum_address(user_address)).call()
