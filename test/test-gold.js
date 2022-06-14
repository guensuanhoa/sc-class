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
        beforeEach(async () => {
            await token.pause()
        })
        it("revert if has been unpaused", async function () {
            await token.unpause()
            await expect(token.unpause()).to.be.revertedWith("Pausable: not paused")
        })
        it("revert if not pauser role", async function () {
            await expect(token.connect(accountB).unpause()).to.be.reverted
        })
        it("unpause success", async function () {
            await expect(await token.unpause()).to.be.emit(token, "Unpaused").withArgs(accountA.address)
            await expect(await token.transfer(accountB.address, amount)).to.be.emit(token, "Transfer").withArgs(accountA.address, accountB.address, amount)
        })
    })

    describe("addToBlackList", function () {
        it("revert if sender is not admin", async function() {
            await expect(token.connect(accountB.address).addToBlackList(accountC.address)).to.be.reverted
        })
        it("revert if add sender to blacklist", async function() {
            await expect(token.addToBlackList(accountA.address)).to.be.revertedWith("Gold: must not add sender to blacklist")
        })
        it("revert if account was in backlist", async function() {
            await token.addToBlackList(accountB.address)
            await expect(token.addToBlackList(accountB.address)).to.be.revertedWith("Gold: account was on blacklist")
        })
        it("addToBlackList success", async function () {
            expect(await token.addToBlackList(accountB.address)).to.be.emit(token, "BlackListAdded").withArgs(accountB.address)
            await expect(token.transfer(accountB.address, amount)).to.be.revertedWith("Gold: account recipient was on blacklist")
            await expect(token.connect(accountB).transfer(accountC.address, amount)).to.be.revertedWith("Gold: account sender was on blacklist")
        })
    })

    describe("removeFromBlackList", function () {
        it("revert if sender is not addmin", async function() {
            await expect(token.connect(accountB.address).removeFromBlackList(accountC.address)).to.be.reverted
        })
        it("revert if account was not in blacklist", async function() {
            await expect(token.removeFromBlackList(accountB.address)).to.be.revertedWith("Gold: account was not on blacklist")
        })
        it("remove success", async function() {
            await token.addToBlackList(accountB.address)
            expect(await token.removeFromBlackList(accountB.address)).to.be.emit(token, "BlackListRemoved").withArgs(accountB.address)
            await expect(token.transfer(accountB.address, amount)).to.be.emit(token, "Transfer").withArgs(accountA.address, accountB.address, amount)
        })
    })
})