const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Arena", function () {
  let arena;
  let owner, backend, player1, player2, player3;
  const stakeAmount = ethers.utils.parseEther("1");

  beforeEach(async () => {
    [owner, backend, player1, player2, player3] = await ethers.getSigners();

    const Arena = await ethers.getContractFactory("Arena");
    arena = await Arena.deploy();
    await arena.deployed();

    const BACKEND_ROLE = await arena.BACKEND_ROLE();
    await arena.connect(owner).grantRole(BACKEND_ROLE, backend.address);
  });

  it("should deploy and assign owner/backend roles", async () => {
    expect(await arena.owner()).to.equal(owner.address);
    const hasRole = await arena.hasRole(await arena.BACKEND_ROLE(), backend.address);
    expect(hasRole).to.be.true;
  });

  it("should allow owner to create a hackathon", async () => {
    const startTime = Math.floor(Date.now() / 1000) + 100;
    await expect(arena.createHackathon(startTime))
      .to.emit(arena, "HackathonCreated");

    const hackathon = await arena.hackathons(0);
    expect(hackathon.startTime).to.equal(startTime);
    expect(hackathon.endTime).to.equal(startTime + 3600);
  });

  it("should allow player to join with valid stake", async () => {
    const startTime = Math.floor(Date.now() / 1000) + 300;
    await arena.createHackathon(startTime);

    await expect(
      arena.connect(player1).joinHackathon(0, { value: stakeAmount })
    ).to.emit(arena, "PlayerJoined");

    const players = await arena.getPlayers(0);
    expect(players).to.include(player1.address);
  });

  it("should reject joining after hackathon start", async () => {
    const startTime = Math.floor(Date.now() / 1000) + 2;
    await arena.createHackathon(startTime);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    await expect(
      arena.connect(player1).joinHackathon(0, { value: stakeAmount })
    ).to.be.revertedWith("Hackathon already started");
  });

  it("checkUpkeep should return true when hackathon ends", async () => {
    const startTime = Math.floor(Date.now() / 1000) + 2;
    await arena.createHackathon(startTime);
    await arena.connect(player1).joinHackathon(0, { value: stakeAmount });

    await new Promise((resolve) => setTimeout(resolve, 4000)); // wait until after endTime

    const upkeep = await arena.checkUpkeep("0x");
    expect(upkeep.upkeepNeeded).to.be.true;

    const decoded = ethers.utils.defaultAbiCoder.decode(["uint256"], upkeep.performData);
    expect(decoded[0].toNumber()).to.equal(0);
  });

  it("should allow backend to finalize a hackathon via fulfill()", async () => {
    const startTime = Math.floor(Date.now() / 1000) + 2;
    await arena.createHackathon(startTime);
    await arena.connect(player1).joinHackathon(0, { value: stakeAmount });

    await new Promise((resolve) => setTimeout(resolve, 4000)); // wait for time to pass

    const encoded = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address"],
      [0, player1.address]
    );

    const beforeBalance = await ethers.provider.getBalance(player1.address);

    const tx = await arena.connect(backend).fulfill(encoded);
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

    const afterBalance = await ethers.provider.getBalance(player1.address);
    const expectedPrize = stakeAmount.mul(70).div(100);

    expect(afterBalance.sub(beforeBalance).add(gasUsed)).to.be.closeTo(
      expectedPrize,
      ethers.utils.parseEther("0.01")
    );

    const hackathon = await arena.hackathons(0);
    expect(hackathon.ended).to.be.true;
    expect(hackathon.winner).to.equal(player1.address);
  });

  it("should fail finalize if winner is not a participant", async () => {
    const startTime = Math.floor(Date.now() / 1000) + 1;
    await arena.createHackathon(startTime);
    await arena.connect(player1).joinHackathon(0, { value: stakeAmount });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const invalidData = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address"],
      [0, player3.address]
    );

    await expect(
      arena.connect(backend).fulfill(invalidData)
    ).to.be.revertedWith("Winner must be a participant");
  });

  it("should reject fulfill from non-backend address", async () => {
    const data = ethers.utils.defaultAbiCoder.encode(["uint256", "address"], [0, player1.address]);
    await expect(arena.connect(player1).fulfill(data)).to.be.reverted;
  });
});
