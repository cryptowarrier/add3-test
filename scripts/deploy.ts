import { parseEther } from "ethers";
import { ethers, upgrades } from "hardhat";

async function main() {
  const [owner, user] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("Add3");
  const token = await Token.deploy();

  console.log("token => ", token.target);

  // mint tokens to user address
  await token.mint(owner.address, parseEther("10000"));

  const Stake = await ethers.getContractFactory("AddStakingV1");

  // deploy with upgradable proxy
  const stake = await upgrades.deployProxy(Stake, [token.target, 100], { initializer: 'intialize' });

  // mint tokens to stake smart contract
  await token.mint(stake.target, parseEther("1000000"));

  console.log("stake => ", stake.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
