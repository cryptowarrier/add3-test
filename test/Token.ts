import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";

describe("Token", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {

    const [owner, another] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Add3");
    const token = await Token.deploy();

    return { token, owner, another };
  }

  describe("Mint", function () {
    it("Should allow to mint tokens to an arbitrary wallet", async function () {
      const { token, another } = await loadFixture(deployFixture);
      // mint token to another address by owner
      await token.mint(another.address, parseEther("100"));
      const balance = await token.balanceOf(another.address);
      expect(balance).to.deep.eq(parseEther("100"));
    });

    it("Should not allow to mint tokens by not owner", async function () {
      const { token, another } = await loadFixture(deployFixture);
      // check revertion when mint token by not owner
      await expect(token.connect(another).mint(another.address, parseEther("100"))).revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });

  describe("Burn", function () {
    it("Should allow to burn by owner", async function () {
      const { token, owner } = await loadFixture(deployFixture);
      // mint token before burning
      await token.mint(owner.address, parseEther("1"));
      let balance = await token.balanceOf(owner.address);
      expect(balance).to.deep.eq(parseEther("1"));
      // burn by owner
      await token.burn(parseEther("1"));
      balance = await token.balanceOf(owner.address);
      // check balance of owner to check if burning worked
      expect(balance).to.deep.eq(0);
    });

    it("Should not allow to burn by not owner", async function ()  {
      const { token, another} = await loadFixture(deployFixture);
      // mint token before burning
      await token.mint(another.address, parseEther("1"));
      let balance = await token.balanceOf(another.address);
      expect(balance).to.deep.eq(parseEther("1"));
      // check revertion of burn method when called by not owner
      await expect(token.connect(another).burn(parseEther("1"))).revertedWith(
        'Only owner can burn tokens'
      );
    })
  });

  describe("Pause", function () {
    it ("Should not set paused as default", async function() {
      const { token } = await loadFixture(deployFixture);
      // check paused state once deployed
      expect(await token.paused()).to.be.false;
    });

    it("Should allow to pause token by owner", async function () {
      const { token } = await loadFixture(deployFixture);
      // pause
      await token.pause();
      // check paused stated after pause token
      expect(await token.paused()).to.be.true;
    });

    it("Should not allow to pause token by not owner", async function () {
      const { token, another } = await loadFixture(deployFixture);
      // check revertion of pause function when called by not owner
      await expect(token.connect(another).pause()).revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it ("Should not allow transfer token when paused", async function () {
      const { token, owner, another } = await loadFixture(deployFixture);
      // mint token for owner
      await token.mint(owner.address, parseEther("100"));
      let balance = await token.balanceOf(owner.address);
      expect(balance).to.deep.eq(parseEther("100"));
      // transfer token to another address
      await token.transfer(another.address, parseEther("100"));
      // check balance of another address after transfer
      balance = await token.balanceOf(another.address);
      expect(balance).to.deep.eq(parseEther("100"));
      // pause token
      await token.pause();
      // check revertion of transfer function after paused
      await expect(token.connect(another).transfer(owner.address, parseEther("100"))).revertedWith(
        'Pausable: paused'
      );
    })
  })
});
