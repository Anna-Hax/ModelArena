// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const Arena = await hre.ethers.getContractFactory("Arena");
  const arena = await Arena.deploy();
  await arena.waitForDeployment();

  console.log("Arena deployed to:", arena.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
  });
