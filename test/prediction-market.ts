
import { ethers } from "@nomiclabs/buidler";
import chai, { expect } from "chai";
import * as Web3 from "web3";

import { PredictionMarket } from "../typechain/PredictionMarket"
import { NiftyDollar } from "../typechain/NiftyDollar";


const timeMachine = require('ganache-time-traveler');

async function goToBlock(block : number) {
    let currentBlock = await ethers.provider.getBlockNumber();

    // wait until expiration of the market
    for (let i = 0; i < (block - currentBlock); i++) {
        await timeMachine.advanceBlock();
    }
}

describe("PreditionMarket", () => {
    
    let pm: PredictionMarket;
    let niftyDollar : NiftyDollar;

    let ownerAddr : string;
    let userAddr : string;

    before(async () => {
        // get users
        const [owner, user] = await ethers.getSigners();
        ownerAddr = await owner.getAddress();
        userAddr = await user.getAddress();
    });

    beforeEach(async () => {
        // deploy dollar
        const niftyDollarFactory = await ethers.getContractFactory("NiftyDollar");
        niftyDollar = await niftyDollarFactory.deploy(100) as NiftyDollar;
        await niftyDollar.deployed();

        // deploy factory with dollar address
        const pmFactory = await ethers.getContractFactory("PredictionMarket");
        pm = await pmFactory.deploy(niftyDollar.address) as PredictionMarket;
        await pm.deployed();

        // allow contract to spend owner's dollars
        await niftyDollar.approve(pm.address, 1000000);
    });


    it("should have basic state", async () => {
        expect(await niftyDollar.balanceOf(ownerAddr)).to.equal(100);
        expect(await niftyDollar.balanceOf(pm.address)).to.equal(0);
    });

    it("currrent price should be 0", async () => {
        expect(await pm.getCurrentPrice()).to.equal(0);
    });

    it("should revert if trying to sell", async () => {
        await expect(pm.predictPriceDown(10)).to.be.reverted;
    });

    it("should succeed if trying to buy", async () => {
        await expect(pm.predictPriceUp(10)).not.to.be.reverted;
    });

    it("should revert if the minimum size is not met for buys", async () => {
        await expect(pm.predictPriceUp(0)).to.be.reverted;
    });

    it("should revert if the minimum size is not met for sells", async () => {
        await expect(pm.predictPriceUp(10)).not.to.be.reverted;
        await expect(pm.predictPriceDown(0)).to.be.reverted;
    });

    it("should update correctly after the first buy", async () => {
        await expect(pm.predictPriceUp(10)).not.to.be.reverted;
        expect(await pm.getCurrentPrice()).to.equal(10);
    });

    it("should update correctly after a buy and a sell", async () => {
        await expect(pm.predictPriceUp(10)).not.to.be.reverted;
        expect(await pm.getCurrentPrice()).to.equal(10);
        
        await expect(pm.predictPriceDown(5)).not.to.be.reverted;
        expect(await pm.getCurrentPrice()).to.equal(5);
    });

    it("should revert on a sale which exceeds the price", async () => {
        await expect(pm.predictPriceUp(10)).not.to.be.reverted;
        await expect(pm.predictPriceDown(10)).to.be.reverted;
    });

    it("should track the correct balance", async () => {
        await expect(pm.predictPriceUp(10)).not.to.be.reverted;
        await expect(pm.predictPriceUp(20)).not.to.be.reverted;
        expect(await pm.getBalance(ownerAddr)).to.equal(30);
    });

    it("should revert if withdrawing before market closes", async () => {
        await expect(pm.withdraw()).to.be.reverted;
    });

    it("should succeed if withdrawing after market closes", async () => {
        // bid in the market, creating a balance
        await expect(pm.predictPriceUp(10)).not.to.be.reverted;

        // go to market expiration
        let expirationBlock = (await pm.getExpirationBlock()).toNumber();
        goToBlock(expirationBlock);

        // check balances
        expect(await pm.getBalance(ownerAddr)).to.equal(10);
        expect(await niftyDollar.balanceOf(ownerAddr)).to.equal(90);
        expect(await niftyDollar.balanceOf(pm.address)).to.equal(10);

        // withdraw
        await expect(pm.withdraw()).not.to.be.reverted;

        // check balances
        expect(await niftyDollar.balanceOf(ownerAddr)).to.equal(100);
        expect(await niftyDollar.balanceOf(pm.address)).to.equal(0);
        expect(await pm.getBalance(ownerAddr)).to.equal(0);
    });

});