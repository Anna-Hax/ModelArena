const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  const Arena = await ethers.getContractFactory("Arena");
  const arena = await Arena.deploy();
  await arena.waitForDeployment();
  const arenaAddress = await arena.getAddress();
  console.log("Arena deployed to:", arenaAddress);

  const Token = await ethers.getContractFactory("ModelArenaToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token deployed to:", tokenAddress);

  const entryAmount = ethers.parseEther("10");
  const modelStake = ethers.parseEther("25");

  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(tokenAddress, entryAmount, modelStake);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("Staking deployed to:", stakingAddress);

  // Save addresses
  const addresses = {
    Arena: arenaAddress,
    Token: tokenAddress,
    Staking: stakingAddress,
  };

  const outputPath = path.resolve(__dirname, "../deployedContracts.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log("Deployed addresses written to deployedContracts.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

