// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const Gold = await hre.ethers.getContractFactory("Gold");
  gold = await Gold.deploy()
  await gold.deployed()

  const Reserve = await hre.ethers.getContractFactory("StakingReserve");
  reserve = await Reserve.deploy()
  await reserve.deployed()

  const Staking = await hre.ethers.getContractFactory("Staking");
  staking = await Staking.deploy(gold.address, reserve.address)
  await staking.deployed()

  console.log("Gold deployed to:", gold.address);
  console.log("Reserve deployed to:", reserve.address);
  console.log("Staking deployed to:", Staking.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
