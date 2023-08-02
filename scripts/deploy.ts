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

  // deploy with upgradable proxy
  const stake = await upgrades.deployProxy(Stake, ["0xaBd5B1a3FA266e5FC5bbB59dB3d0Eae7A9d6e717", 100], { initializer: 'intialize' });

  
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

// token =>  0xaBd5B1a3FA266e5FC5bbB59dB3d0Eae7A9d6e717
// stake =>  0xCbd2404E725E5D5245eD6CC0DcBDF5370954ecd0