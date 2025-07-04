# 🧠 ModelArena

**ModelArena** is a decentralized hackathon platform designed to gamify the deployment and evaluation of machine learning models. Participants can stake tokens, submit models, and compete in time-bound hackathons. Investors can bet on submitted models based on real-time statistics. The platform combines smart contracts, Chainlink automation, a Django REST backend, and a React frontend for a seamless Web3 experience.

---

## 💡 Key Features

### ✨ Hackathon Hosting (Arena.sol)

* Owners can create hackathons with a fixed start and automatic 1-hour duration.
* Users join by staking ETH into the prize pool.
* Prize pool is distributed 70% to the winner and 30% to the platform owner.
* Chainlink Automation triggers the end of hackathons.
* Winner is submitted by the backend via a secure `fulfill()` function.

### 📈 Staking & Model Upload (Staking.sol)

* Users must pay a one-time **platform entry fee** (in ERC20 tokens).
* After entry, users can stake additional tokens per model.
* Investors can also pay the entry fee and bet tokens on submitted models.
* All stakes are tracked, and investors are linked to models.

### 💰 ERC20 Token Economy (ModelArenaToken.sol)

* Custom ERC20 token: **ModelArenaToken (MAT)**
* Used for all platform staking, betting, and rewards.
* Mintable by the contract owner (used for test deployments).

### ⌛ Chainlink Automation

* `checkUpkeep`: Called periodically by Chainlink nodes to check for ended hackathons.
* `performUpkeep`: Called by Chainlink when a hackathon needs to be finalized.
* `fulfill`: Called by the backend to submit the winner and trigger prize distribution.

### 📝 Backend (Django REST Framework)

* Stores user profiles, model metadata, evaluation results.
* Triggers the `fulfill()` function based on model evaluation.
* Manages admin roles for Chainlink integration and authorization.

### 💻 Frontend (React.js + Ethers.js)

* Real-time hackathon list and model uploads.
* Interacts with Arena and Staking contracts.
* Displays stats for investors to decide bets.
* Wallet integration for staking, betting, and claiming rewards.

---

## 🏒 Deployment Steps

### 🔧 Smart Contracts (Hardhat)

```bash
npx hardhat compile
npx hardhat run scripts/deploy.cjs --network sepolia
```

This deploys the Token, Arena, and Staking contracts.

### 🌐 Register Chainlink Automation

* Go to [https://automation.chain.link](https://automation.chain.link)
* Register Arena contract address
* Provide `checkUpkeep()` and `performUpkeep()` ABI
* Use testnet LINK + ETH

### 🌐 Connect Backend

* Install `web3.py` or `ethers` via JS backend if needed.
* Call `fulfill(hackathonId, winnerAddress)` after evaluation.

---

## 🔐 Environment Example

```env
PRIVATE_KEY=0xYourPrivateKey
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
TOKEN_ADDRESS=0x...
ARENA_ADDRESS=0x...
STAKING_ADDRESS=0x...
```

---

## 🕹️ Testing

```bash
npx hardhat test
```

Tests written for:

* Hackathon creation & joining
* Staking entry & model stake
* Investor functionality
* Chainlink keeper simulation

---

## 🚀 Tech Stack

| Layer           | Stack                        |
| --------------- | ---------------------------- |
| Smart Contracts | Solidity, Hardhat, Chainlink |
| Backend         | Django, Django REST          |
| Frontend        | React, Ethers.js, Tailwind   |
| Token           | OpenZeppelin ERC20           |

---


