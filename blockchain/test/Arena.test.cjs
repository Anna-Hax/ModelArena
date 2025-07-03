const { expect } = require("chai");
const { ethers } = require("hardhat");
const { AbiCoder } = require("ethers");

describe("Arena", function () {
  let arena;
  let owner, backend, player1, player2, player3;
  const stakeAmount = ethers.parseEther("1");

  beforeEach(async () => {
    [owner, backend, player1, player2, player3] = await ethers.getSigners();

    const Arena = await ethers.getContractFactory("Arena");
    arena = await Arena.deploy();

    const BACKEND_ROLE = await arena.BACKEND_ROLE();
    await arena.connect(owner).grantRole(BACKEND_ROLE, backend.address);
  });

  it("should deploy and assign owner/backend roles", async () => {
    expect(await arena.owner()).to.equal(owner.address);
    const hasRole = await arena.hasRole(await arena.BACKEND_ROLE(), backend.address);
    expect(hasRole).to.be.true;
  });

  it("should allow owner to create a hackathon", async () => {
    const block = await ethers.provider.getBlock("latest");
    const startTime = block.timestamp + 100;
    await expect(arena.createHackathon(startTime))
      .to.emit(arena, "HackathonCreated");

    const hackathon = await arena.hackathons(0);
    expect(hackathon.startTime).to.equal(startTime);
    expect(hackathon.endTime).to.equal(startTime + 3600);
  });

  it("should allow player to join with valid stake", async () => {
    const block = await ethers.provider.getBlock("latest");
    const startTime = block.timestamp + 300;
    await arena.createHackathon(startTime);

    await expect(
      arena.connect(player1).joinHackathon(0, { value: stakeAmount })
    ).to.emit(arena, "PlayerJoined");

    const players = await arena.getPlayers(0);
    expect(players).to.include(player1.address);
  });


  it("checkUpkeep should return true when hackathon ends", async () => {
    const block = await ethers.provider.getBlock("latest");
    const startTime = block.timestamp + 20;
    await arena.createHackathon(startTime);
    await arena.connect(player1).joinHackathon(0, { value: stakeAmount });

    // Simulate 1 hour + 5 seconds
    await ethers.provider.send("evm_increaseTime", [3625]);
    await ethers.provider.send("evm_mine");

    const upkeep = await arena.checkUpkeep("0x");
    expect(upkeep.upkeepNeeded).to.be.true;

    const abi = new AbiCoder();
    const decoded = abi.decode(["uint256"], upkeep.performData);
    expect(decoded[0]).to.equal(0);
  });

  it("should allow backend to finalize a hackathon via fulfill()", async () => {
    const block = await ethers.provider.getBlock("latest");
    const startTime = block.timestamp + 100;
    await arena.createHackathon(startTime);

    await arena.connect(player1).joinHackathon(0, { value: stakeAmount });

    await ethers.provider.send("evm_increaseTime", [3600 + 100]); // 1 hr + 100s
    await ethers.provider.send("evm_mine");

    const abi = new AbiCoder();
    const encoded = abi.encode(["uint256", "address"], [0, player1.address]);

    const beforeBalance = await ethers.provider.getBalance(player1.address);

    const tx = await arena.connect(backend).fulfill(encoded);
    const receipt = await tx.wait();

    const rgasUsed = receipt.gasUsed;
    const gasPrice = receipt.effectiveGasPrice || tx.gasPrice; // fallback if EIP-1559 is undefined

    const gasUsed = rgasUsed * gasPrice;
    //const gasUsed = receipt.gasUsed * BigInt(receipt.effectiveGasPrice);

    const afterBalance = await ethers.provider.getBalance(player1.address);
    const expectedPrize = (stakeAmount * 70n) / 100n;

    expect(afterBalance - beforeBalance + gasUsed).to.be.closeTo(
      expectedPrize,
      ethers.parseEther("0.01")
    );

    const hackathon = await arena.hackathons(0);
    expect(hackathon.ended).to.be.true;
    expect(hackathon.winner).to.equal(player1.address);
  });

  it("should fail finalize if winner is not a participant", async () => {
    const block = await ethers.provider.getBlock("latest");
    const startTime = block.timestamp + 10; // FIX: safely in the future
    await arena.createHackathon(startTime);
    await arena.connect(player1).joinHackathon(0, { value: stakeAmount });

    // Simulate time passing
    await ethers.provider.send("evm_increaseTime", [3600 + 15]); // simulate hackathon ended
    await ethers.provider.send("evm_mine");

    const abi = new AbiCoder();
    const invalidData = abi.encode(
      ["uint256", "address"],
      [0, player3.address] // player3 did NOT join
    );

    await expect(
      arena.connect(backend).fulfill(invalidData)
    ).to.be.revertedWith("Winner must be a participant");
  });


  it("should reject fulfill from non-backend address", async () => {
    const block = await ethers.provider.getBlock("latest");
    const startTime = block.timestamp + 100;
    await arena.createHackathon(startTime);
    await arena.connect(player1).joinHackathon(0, { value: stakeAmount });

    await ethers.provider.send("evm_increaseTime", [3600 + 120]);
    await ethers.provider.send("evm_mine");

    const abi = new AbiCoder();
    const data = abi.encode(["uint256", "address"], [0, player1.address]);

    await expect(
      arena.connect(player1).fulfill(data)
    ).to.be.reverted;
  });
});
