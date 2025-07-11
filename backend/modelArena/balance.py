from web3 import Web3

rpc_url = "https:"
web3 = Web3(Web3.HTTPProvider(rpc_url))

address = ""

balance_wei = web3.eth.get_balance(address)
balance_eth = web3.from_wei(balance_wei, "ether")

print(f" Balance of {address}: {balance_eth} ETH")
