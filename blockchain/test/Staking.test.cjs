// test/Staking.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking Contract", function () {
  let Token, token, Staking, staking, owner, user1, user2, investor;
  const ENTRY_FEE = ethers.parseEther("10");
  const MODEL_MIN_STAKE = ethers.parseEther("5");

  beforeEach(async () => {
    [owner, user1, user2, investor] = await ethers.getSigners();

    Token = await ethers.getContractFactory("ModelArenaToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(await token.getAddress(), ENTRY_FEE, MODEL_MIN_STAKE);
    await staking.waitForDeployment();

    // Distribute tokens to all users
    for (let user of [user1, user2, investor]) {
      await token.connect(owner).mint(user.address, ethers.parseEther("100"));
    }
  });

  it("should allow a user to enter the platform", async () => {
    await token.connect(user1).approve(await staking.getAddress(), ENTRY_FEE);
    await staking.connect(user1).enterPlatform();
    const entered = await staking.hasEntered(user1.address);
    expect(entered).to.be.true;
  });

  it("should allow a user to stake for their model", async () => {
    await token.connect(user1).approve(await staking.getAddress(), ENTRY_FEE + MODEL_MIN_STAKE);
    await staking.connect(user1).enterPlatform();
    await staking.connect(user1).stakeForModel(MODEL_MIN_STAKE);

    const totalStake = await staking.totalStakeOf(user1.address);
    expect(totalStake).to.equal(ENTRY_FEE + MODEL_MIN_STAKE);
  });

  it("should allow an investor to place a bet on a model", async () => {
    // user2 = model owner, investor = investor
    await token.connect(user2).approve(await staking.getAddress(), ENTRY_FEE + MODEL_MIN_STAKE);
    await staking.connect(user2).enterPlatform();
    await staking.connect(user2).stakeForModel(MODEL_MIN_STAKE);

    await token.connect(investor).approve(await staking.getAddress(), ENTRY_FEE + ethers.parseEther("20"));
    await staking.connect(investor).enterPlatform();
    await staking.connect(investor).placeBet(0, user2.address, ethers.parseEther("20"));

    const investorBet = await staking.getBet(investor.address, 0, user2.address);
    expect(investorBet).to.equal(ethers.parseEther("20"));

    const totalBets = await staking.getTotalBetsOnModel(0, user2.address);
    expect(totalBets).to.equal(ethers.parseEther("20"));
  });

  it("should not allow betting without entering platform", async () => {
    await expect(
      staking.connect(investor).placeBet(0, user1.address, ethers.parseEther("10"))
    ).to.be.revertedWith("Investor must enter platform first");
  });

  it("should not allow staking before entering platform", async () => {
    await token.connect(user1).approve(await staking.getAddress(), MODEL_MIN_STAKE);
    await expect(
      staking.connect(user1).stakeForModel(MODEL_MIN_STAKE)
    ).to.be.revertedWith("Must enter platform first");
  });
});
