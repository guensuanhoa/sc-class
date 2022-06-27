const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Staking", function () {
    let [admin, staker, staker2] = []
    let gold
    let reserve
    let staking

    let address0 = "0x0000000000000000000000000000000000000000"
    let reserveBalance = ethers.utils.parseUnits("1000000", "ether")
    let stakerBalance = ethers.utils.parseUnits("1000000", "ether")

    let oneWeek = 86400 * 7
    let oneYear = 86400 * 365

    let defaultRate = 158548 // 50% / year = 0.00000158548% / second
    let defaultDecimal = 13
    let defaultMinStaking = ethers.utils.parseEther('100')
    let defaultStakeAmount = ethers.utils.parseEther('10000')

    beforeEach(async () => {
        [admin, staker, staker2] = await ethers.getSigners();
        // init contract
        const Gold = await ethers.getContractFactory("Gold");
        gold = await Gold.deploy()
        await gold.deployed()

        const Reserve = await ethers.getContractFactory("StakingReserve");
        reserve = await Reserve.deploy()
        await reserve.deployed()

        const Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(gold.address, reserve.address)
        await staking.deployed()

        // Init gold token
        await gold.transfer(staker.address, stakerBalance)
        await gold.transfer(reserve.address, reserveBalance)
        await gold.connect(staker).approve(staking.address, defaultStakeAmount.mul(4))
    })
})