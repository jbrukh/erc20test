
import { ethers } from "@nomiclabs/buidler";
import chai, { expect } from "chai";

import { PredictionMarket } from "../typechain/PredictionMarket"
import { NiftyDollar } from "../typechain/NiftyDollar";


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

        // deploy dollar
        const niftyDollarFactory = await ethers.getContractFactory("NiftyDollar");
        niftyDollar = await niftyDollarFactory.deploy(100) as NiftyDollar;
        await niftyDollar.deployed();
    });

    beforeEach(async () => {
        // deploy factory with dollar address
        const pmFactory = await ethers.getContractFactory("PredictionMarket");
        pm = await pmFactory.deploy(niftyDollar.address) as PredictionMarket;
        await pm.deployed();
    });

    it("should revert when getting the current price before market is active", async () => {
        await expect(pm.getCurrentPrice()).to.be.reverted;
    });

    it("should be a closed market", async () => {
        expect(await pm.isMarketOpen()).to.be.false;
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
        expect(await pm.isMarketOpen()).to.be.true;
        expect(await pm.getCurrentPrice()).to.equal(10);
    });

    it("should update correctly after a buy and a sell", async () => {
        await expect(pm.predictPriceUp(10)).not.to.be.reverted;
        expect(await pm.isMarketOpen()).to.be.true;
        expect(await pm.getCurrentPrice()).to.equal(10);
        
        await expect(pm.predictPriceDown(5)).not.to.be.reverted;
        expect(await pm.isMarketOpen()).to.be.true;
        expect(await pm.getCurrentPrice()).to.equal(5);
    });

    it("should revert on a sale which exceeds the price", async () => {
        await expect(pm.predictPriceUp(10)).not.to.be.reverted;
        await expect(pm.predictPriceDown(10)).to.be.reverted;
    });

});