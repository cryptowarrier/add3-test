import { parseEther } from "ethers";
import { ethers, upgrades } from "hardhat";

async function main() {
  const [owner, user] = await ethers.getSigners();
  // const Token = await ethers.getContractFactory("Add3");
  // const token = await Token.deploy();

  // console.log("token => ", token.target);

  // mint tokens to user address
  // await token.mint(owner.address, parseEther("10000"));

  const Stake = await ethers.getContractFactory("AddStakingV1");
  // const Stake = await ethers.getContractAt("AddStakingV1", "0xedCbFf91cF2858C1Bc17969012AE9757D3F905eA");

  // deploy with upgradable proxy
  const stake = await upgrades.deployProxy(Stake, ["0x362514bf9D9B51A842A3c66bdb50e523ACc6d311", 100], { initializer: 'intialize' });

  
  // console.log(await upgrades.erc1967.getImplementationAddress(await stake.getAddress())," getImplementationAddress")
  // console.log(await upgrades.erc1967.getAdminAddress(await stake.getAddress())," getAdminAddress") 

  // mint tokens to stake smart contract
  // await token.mint(stake.target, parseEther("1000000"));

  console.log("stake => ", stake.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// token =>  0x62a13eA6b285fd6C3261B82797669E78146BB0b1
// stake =>  0xb9711aB21dbBc9FD310f11838e5569E576cbdc72

