const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Petty", function () {
    let [accountA, accountB, accountC] = []
    let petty
    let address0 = "0x0000000000000000000000000000000000000000"
    let uri = "sampleurl.com/"
    
    beforeEach(async () => {
        [accountA, accountB, accountC] = await ethers.getSigners();
        const Petty = await ethers.getContractFactory("Petty");
        petty = await Petty.deploy();
        await petty.deployed();
    })

    describe("mint", function () {
        // revert if mint without owner account
        it("revert if mint without owner account", async function () {
            await expect(petty.connect(accountB).mint(accountA.address)).to.be.reverted
        })
        // mint success
        it("mint success", async function () {
            await expect(await petty.mint(accountA.address)).to.be.emit(petty, "Transfer").withArgs(address0, accountA.address, 1);
            expect(await petty.balanceOf(accountA.address)).to.be.equals(1);
            expect(await petty.ownerOf(1)).to.be.equals(accountA.address);
        })
    })

    describe("update base URI", function () {
        it("revert if update without owner account", async function () {
            await expect(petty.connect(accountB).updateBaseTokenURI(uri)).to.be.reverted
        })

        it("update success", async function () {
            await petty.updateBaseTokenURI(uri);
            expect(await petty.getBaseTokenURI()).to.be.equals(uri);
        })
    })
})