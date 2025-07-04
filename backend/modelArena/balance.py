from web3 import Web3

# Use the same RPC URL and address from your `.env`
rpc_url = "https://eth-sepolia.g.alchemy.com/v2/5YAZvezwXXtIqbzLFtVCu"
web3 = Web3(Web3.HTTPProvider(rpc_url))

address = "0xEC00C5D4d2A7721A29E3E24625e6fFA3922879b4"

balance_wei = web3.eth.get_balance(address)
balance_eth = web3.from_wei(balance_wei, "ether")

print(f"💰 Balance of {address}: {balance_eth} ETH")