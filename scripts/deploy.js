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
  const stakeAddress = "0x6810c8f75CEc539E1FA20A098984702B8dA581b5"
  reserve = await Reserve.deploy(gold.address, stakeAddress)
  await reserve.deployed()

  const Staking = await hre.ethers.getContractFactory("Staking");
  staking = await Staking.deploy(gold.address, reserve.address)
  await staking.deployed()

  console.log("Gold deployed to:", gold.address);
  console.log("Reserve deployed to:", reserve.address);
  console.log("Staking deployed to:", staking.address);

  // Gold deployed to: 0xc2ec2AEC36f1B6Ea48f0e69892789C7B38dCB0cC
  // Reserve deployed to: 0xc015C01725B2b40d0B05700B6fe84c1Ca268F048
  // Staking deployed to: 0x9d03f40E0eBc02cc0319306aBA67b59524Fd8509
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
