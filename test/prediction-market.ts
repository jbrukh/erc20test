
import { ethers } from "@nomiclabs/buidler";
import chai, { expect } from "chai";

import { PredictionMarket } from "../typechain/PredictionMarket"


describe("PreditionMarket", () => {
    
    let pm: PredictionMarket;
    let ownerAddr : string;
    let userAddr : string;

    beforeEach(async () => {
        const [owner, user] = await ethers.getSigners();
        ownerAddr = await owner.getAddress();
        userAddr = await user.getAddress();    
        const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
        pm = await PredictionMarketFactory.deploy() as PredictionMarket;
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