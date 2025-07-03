const { expect } = require("chai");
const { ethers } = require("hardhat");
const { AbiCoder } = require("ethers");

describe("Staking", function () {
  let staking, token;
  let owner, user1, user2;

  const entryStakeAmount = ethers.parseEther("10");
  const minModelStake = ethers.parseEther("50");

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("ModelArenaToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    // Deploy staking contract
    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(token.target, entryStakeAmount, minModelStake);
    await staking.waitForDeployment();

    // Give test users tokens and approve
    for (const user of [user1, user2]) {
      await token.transfer(user.address, ethers.parseEther("1000"));
      await token.connect(user).approve(staking.target, ethers.parseEther("1000"));
    }
  });

  it("should allow user to enter platform with entry stake", async () => {
    await expect(staking.connect(user1).enterPlatform())
      .to.emit(staking, "EnteredPlatform")
      .withArgs(user1.address, entryStakeAmount);

    const hasEntered = await staking.hasEntered(user1.address);
    expect(hasEntered).to.be.true;
  });

  it("should prevent double entry", async () => {
    await staking.connect(user1).enterPlatform();

    await expect(staking.connect(user1).enterPlatform()).to.be.revertedWith("Already entered");
  });

  it("should not allow model staking without entering platform", async () => {
    await expect(
      staking.connect(user1).stakeForModel(minModelStake)
    ).to.be.revertedWith("Must enter platform first");
  });

  it("should not allow model staking below minimum", async () => {
    await staking.connect(user1).enterPlatform();

    await expect(
      staking.connect(user1).stakeForModel(ethers.parseEther("10"))
    ).to.be.revertedWith("Below minimum model stake");
  });

  it("should allow valid model staking", async () => {
    await staking.connect(user1).enterPlatform();

    await expect(staking.connect(user1).stakeForModel(minModelStake))
      .to.emit(staking, "ModelStaked")
      .withArgs(user1.address, minModelStake);

    const staked = await staking.modelStakes(user1.address);
    expect(staked).to.equal(minModelStake);
  });

  it("should return total stake of user", async () => {
    await staking.connect(user1).enterPlatform();
    await staking.connect(user1).stakeForModel(minModelStake);

    const total = await staking.totalStakeOf(user1.address);
    expect(total).to.equal(entryStakeAmount + minModelStake);
  });

  it("should return 0 for users who have not entered", async () => {
    const total = await staking.totalStakeOf(user2.address);
    expect(total).to.equal(0);
  });
});