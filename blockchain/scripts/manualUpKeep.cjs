const hre = require("hardhat");

async function main() {
  const HACKATHON_ID = 0; // change if needed
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const ethers = hre.ethers;
  const arena = await ethers.getContractAt("Arena", CONTRACT_ADDRESS);

  // ⏩ Simulate 2 hours time passing (in seconds)
  await ethers.provider.send("evm_increaseTime", [7200]);
  await ethers.provider.send("evm_mine");
  console.log("⏩ Time fast-forwarded by 2 hours");

  // 🧠 Encode performData: abi.encode(uint256)
  const data = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [HACKATHON_ID]);

  // 🛠️ Trigger performUpkeep manually
  const tx = await arena.performUpkeep(data);
  console.log("📤 performUpkeep transaction sent...");
  await tx.wait();
  console.log("✅ performUpkeep confirmed!");

  // Now wait and watch your backend logs — it should call fulfill() on its own!
}

main().catch((error) => {
  console.error("❌ Error running upkeep:", error);
  process.exitCode = 1;
});
