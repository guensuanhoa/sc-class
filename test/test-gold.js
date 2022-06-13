const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gold", function () {
    let [accountA, accountB, accountC] = []
    let token
    let amount = 100
    let address0 = "0x0000000000000000000000000000000000000000"
    let totalSupply = ethers.utils.parseUnits("1000000", "ether")
    beforeEach(async () => {
        [accountA, accountB, accountC] = await ethers.getSigners()
        const Token = await ethers.getContractFactory("Gold")
        token = await Token.deploy()
        await token.deployed()
    })
    describe("common", function () { 
        it("total supply returns right", async function () {
            expect(await token.totalSupply()).to.be.equal(totalSupply)
        })
        it("balance of account A returns right", async function () {
            expect(await token.balanceOf(accountA.address)).to.be.equals(totalSupply)
        })
        it("balance of account B returns right", async function () {
            expect(await token.balanceOf(accountB.address)).to.be.equals(0)
        })
        it("allowance of account B to account A return right", async function () {
            expect(await token.allowance(accountA.address, accountB.address)).to.be.equals(0)
        })
    })

    describe("pause", function () {
        it("revert if has been paused", async function () {
            // Do pause from accountA (owner)
            await token.pause()
            // Do pause again, it should revert
            await expect(token.pause()).to.be.revertedWith("Pausable: paused")
        })
        it("revert if not pauser role", async function () {
            // Connect to accountB that doesnt have pauser role
            // Do pause, it should revert
            await expect(token.connect(accountB).pause()).to.be.reverted
        })
        it("pause success", async function () {
            // Do pause from accountA, it should be success and emit an event
            await expect(await token.pause()).to.be.emit(token, "Paused").withArgs(accountA.address)
            // Do transfer, it should revert
            await expect(token.transfer(accountB.address, amount)).to.be.revertedWith("Pausable: paused")
        })
    })

    describe("unpause", function () {
        it("revert if has been not paused", async function () {})
        it("revert if not pauser role", async function () {})
        it("pause success", async function () {})
    })

    describe("addToBlackList", function () {})

    describe("removeFromBlackList", function () {})
})