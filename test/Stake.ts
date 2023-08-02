import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { parseEther } from "ethers";

describe("Stake", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {

    const [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Add3");
    const token = await Token.deploy();

    // mint tokens to user address
    await token.mint(user.address, parseEther("10000"));

    const Stake = await ethers.getContractFactory("AddStakingV1");

    // deploy with upgradable proxy
    const stake = await upgrades.deployProxy(Stake, [token.target , 100], { initializer: 'intialize' });

    // mint tokens to stake smart contract
    await token.mint(stake.target , parseEther("1000000"));

    return { token, stake, owner, user };
  }

  describe("Deployment", function () {
    it("Should set the right token address and reward rate", async function () {
      const { token, stake } = await loadFixture(deployFixture);
      // get token address from stake smart contract
      const tokenAddress = await stake.token();
      // should be equal inputted token address with deployed token address
      expect(tokenAddress).to.eq(token.target);
      // get reward rate from stake smart contract
      const rewardRate = await stake.rewardRate();
      // should be equal reward rate with inputted value
      expect(rewardRate).to.deep.eq(100);
    });

    it("Should not allow to  set token address and reward rate", async function () {
      const { token, stake } = await loadFixture(deployFixture);
      // check revertion of intialize function after deployed
      await expect(stake.intialize(token.target , 1000)).revertedWith(
        'Already initialized'
      );
    });
  });

  describe("Stake, Unstake, Claim", function () {
    it("Should allow to stake tokens by user", async function () {
      const { token, stake, owner, user } = await loadFixture(
        deployFixture
      );
      // approve user tokens for stake smart contract before stake
      await token.connect(user).approve(stake.target , parseEther("10000"));
      // check user balance before stake
      let balance = await token.balanceOf(user.address);
      expect(balance).to.eq(parseEther("10000"));
      // stake token
      // @ts-ignore
      await stake.connect(user).stake(parseEther("10000"));
      // check user balance after staked
      balance = await token.balanceOf(user.address);
      expect(balance).to.eq(0);
      // get staked info
      const staked = await stake.stakes(user.address);
      expect(staked[0]).to.deep.eq(parseEther("10000"));
    });

    it("Should allow to unstake tokens by user", async function () {
      const { token, stake, owner, user } = await loadFixture(
        deployFixture
      );
      // approve user tokens for stake smart contract before stake
      await token.connect(user).approve(stake.target , parseEther("10000"));
      // check user balance before stake
      let balance = await token.balanceOf(user.address);
      expect(balance).to.eq(parseEther("10000"));
      // stake token
      // @ts-ignore
      await stake.connect(user).stake(parseEther("10000"));
      // check user balance after staked
      balance = await token.balanceOf(user.address);
      expect(balance).to.eq(0);
      // get staked info
      let staked = await stake.stakes(user.address);
      expect(staked[0]).to.deep.eq(parseEther("10000"));
      // unstake tokens
      // @ts-ignore
      await stake.connect(user).unstake(parseEther("1000"));
      // check staked info once unstake
      staked = await stake.stakes(user.address);
      expect(staked[0]).to.deep.eq(parseEther("9000"));
    });

    it ("Should allow to claim rewards by user", async function () {
      const { token, stake, owner, user } = await loadFixture(
        deployFixture
      );
      // approve user tokens for stake smart contract before stake
      await token.connect(user).approve(stake.target , parseEther("10000"));
      // check user balance before stake
      let balance = await token.balanceOf(user.address);
      expect(balance).to.eq(parseEther("10000"));
      // stake token
      // @ts-ignore
      await stake.connect(user).stake(parseEther("10000"));
      // check user balance after staked
      balance = await token.balanceOf(user.address);
      expect(balance).to.eq(0);
      // get staked info
      let staked = await stake.stakes(user.address);
      expect(staked[0]).to.deep.eq(parseEther("10000"));
      // get rewards info
      let rewards = await stake.calculateRewards(user.address);
      // rewards must be zero once stake
      expect(rewards).to.deep.eq(0);
      // increase time 365 days
      await time.increase(3600 * 24 * 365);
      // get rewards info after 365 days
      rewards = await stake.calculateRewards(user.address);
      // reward must be equal with staked amount after 365 days
      expect(rewards).to.deep.eq(parseEther("10000"));
      // claim rewards
      // @ts-ignore
      await stake.connect(user).claimRewards();
      // check user balance after claim rewards
      balance = await token.balanceOf(user.address);
      expect(balance).to.greaterThanOrEqual(parseEther("10000"));
      // get staked info after claimed
      staked = await stake.stakes(user.address);
      expect(staked[0]).to.deep.eq(parseEther("10000"));
    })
  });

});
