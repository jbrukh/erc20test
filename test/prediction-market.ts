
import { ethers } from "@nomiclabs/buidler";
import chai, { expect } from "chai";

import { PredictionMarket } from "../typechain/PredictionMarket"
import { NiftyDollar } from "../typechain/NiftyDollar";
import { BigNumber } from "ethers/utils";
import { Signer } from "ethers";


const timeMachine = require('ganache-time-traveler');

async function goToBlock(block : number) {
    let currentBlock = await ethers.provider.getBlockNumber();

    // wait until expiration of the market
    for (let i = 0; i < (block - currentBlock); i++) {
        await timeMachine.advanceBlock();
    }
}

function n(num : number) {
    return num + '000000000000000000';
}

describe("PreditionMarket", () => {
    
    let pm: PredictionMarket;
    let niftyDollar : NiftyDollar;

    let ownerAddr : string;
    let userAddr : string;
    let owner : Signer, user : Signer;

    before(async () => {
        // get users
        [owner, user] = await ethers.getSigners();
        ownerAddr = await owner.getAddress();
        userAddr = await user.getAddress();
    });

    beforeEach(async () => {
        // deploy dollar
        const niftyDollarFactory = await ethers.getContractFactory("NiftyDollar");
        niftyDollar = await niftyDollarFactory.deploy(n(100)) as NiftyDollar;
        await niftyDollar.deployed();

        // deploy factory with dollar address
        const pmFactory = await ethers.getContractFactory("PredictionMarket");
        pm = await pmFactory.deploy(niftyDollar.address) as PredictionMarket;
        await pm.deployed();

        // allow contract to spend owner's dollars
        await niftyDollar.approve(pm.address, n(1000000));

        // give each user some money
        await niftyDollar.transfer(userAddr, n(30));
    });


    it("should have basic state", async () => {
        expect(await niftyDollar.balanceOf(ownerAddr)).to.equal(n(70));
        expect(await niftyDollar.balanceOf(userAddr)).to.equal(n(30));
        expect(await niftyDollar.balanceOf(pm.address)).to.equal(0);
    });

    it("current price should be 0", async () => {
        expect(await pm.getCurrentPrice()).to.equal(0);
    });

    it("should revert if trying to sell", async () => {
        await expect(pm.moveMarketDown(n(10))).to.be.reverted;
    });

    it("should succeed if trying to buy", async () => {
        await expect(pm.moveMarketUp(n(10))).not.to.be.reverted;
    });

    it("should revert if the minimum size is not met for buys", async () => {
        await expect(pm.moveMarketUp(0)).to.be.reverted;
    });

    it("should revert if the minimum size is not met for sells", async () => {
        await expect(pm.moveMarketUp(n(10))).not.to.be.reverted;
        await expect(pm.moveMarketDown(0)).to.be.reverted;
    });

    it("should update correctly after the first buy", async () => {
        await expect(pm.moveMarketUp(n(10))).not.to.be.reverted;
        expect(await pm.getCurrentPrice()).to.equal(n(10));
    });

    it("should update correctly after a buy and a sell", async () => {
        await expect(pm.moveMarketUp(n(10))).not.to.be.reverted;
        expect(await pm.getCurrentPrice()).to.equal(n(10));
        
        await expect(pm.moveMarketDown(n(10))).not.to.be.reverted;
        expect(await pm.getCurrentPrice()).to.equal(n(5));
    });

    it("should revert on a sale which exceeds the price", async () => {
        await expect(pm.moveMarketUp(n(10))).not.to.be.reverted;
        await expect(pm.moveMarketDown(n(22))).to.be.reverted;
    });

    it("should track the correct balance", async () => {
        await expect(pm.moveMarketUp(n(10))).not.to.be.reverted;
        await expect(pm.moveMarketUp(n(20))).not.to.be.reverted;
        expect(await pm.getDeposits(ownerAddr)).to.equal(n(30));
    });

    it("should track the correct price", async () => {
        await expect(pm.moveMarketUp(n(10))).not.to.be.reverted;
        await expect(pm.moveMarketUp(n(20))).not.to.be.reverted;
        expect(await pm.getCurrentPrice()).to.equal(n(20));
    });

    it("should revert if withdrawing before market closes", async () => {
        await expect(pm.withdraw()).to.be.reverted;
    });

    it("should not allow claims", async () => {
        await expect(pm.claimRewards()).to.be.reverted;
    });

    it("should not allow buys right away", async () => {
        await expect(pm.buy()).to.be.reverted;
    });

    it("should not allow withdrawals", async () => {
        await expect(pm.withdraw()).to.be.reverted;
    });

    describe("after some trading", () => {
        beforeEach(async () => {
            // as owner
            await pm.moveMarketUp(n(10));  // up by 10/1 = 10
            await pm.moveMarketUp(n(10));  // up by 10/2 = 5 (total: 15)

            // as user, get approvals
            let niftyDollarUser = niftyDollar.connect(user);
            let pmUser = pm.connect(user);
            await niftyDollarUser.approve(pm.address, n(1000000));

            // as user, trade
            await pmUser.moveMarketDown(n(9));  // down by 9/3 = 3 (total: 12)
            await pmUser.moveMarketDown(n(12)); // down by 12/4 = 3 (total: 9)
        });

        it("should have correct deposits", async () => {
            expect(await pm.getDeposits(ownerAddr)).to.equal(n(20));
            expect(await pm.getDeposits(userAddr)).to.equal(n(21));
        });

        it("should have the correct market price", async () => {
            expect(await pm.getCurrentPrice()).to.equal(n(9));
        });

        it("the challenge period should end in five blocks", async () => {
            let currentBlock = await ethers.provider.getBlockNumber();
            let challengeBlock = (await pm.getChallengeBlock()).toNumber();
            expect(challengeBlock - currentBlock).to.equal(5);
        });

        describe("before the challenge period ends", async () => {
            beforeEach(async () => {
                timeMachine.advanceBlock();
            });

            it("should not allow a buy", async () => {
                await expect(pm.buy()).to.be.reverted;
            });

            it("should not allow a claim", async () => {
                await expect(pm.claimRewards()).to.be.reverted;
            });

            it("should not allow a withdraw", async () => {
                await expect(pm.withdraw()).to.be.reverted;
            });

            it("should allow more predictions", async () => {
                await expect(pm.moveMarketUp(n(5))).not.to.be.reverted;
            });
        });

        describe("after the challenge period ends", async () => {
            beforeEach(async () => {
                for (let i = 0; i <= 5; i++) {
                    timeMachine.advanceBlock();
                }
            });

            it("should allow a buy", async () => {
                await expect(pm.buy()).not.to.be.reverted;
            });

            it("should not allow a claim", async () => {
                await expect(pm.claimRewards()).to.be.reverted;
            });

            it("should not allow a withdraw", async () => {
                await expect(pm.withdraw()).to.be.reverted;
            });

            it("should have the correct final price", async () => {
                expect(await pm.getCurrentPrice()).to.equal(n(9));
            });
        });
    });

    describe("after some trading and a purchase", () => {
        let niftyDollarUser : NiftyDollar;
        let pmUser : PredictionMarket;

        beforeEach(async () => {
            // as owner
            await pm.moveMarketUp(n(10));  // up by 10/1 = 10
            await pm.moveMarketUp(n(10));  // up by 10/2 = 5 (total: 15)

            // as user, get approvals
            niftyDollarUser = niftyDollar.connect(user);
            pmUser = pm.connect(user);
            await niftyDollarUser.approve(pm.address, n(1000000));

            // as user, trade
            await pmUser.moveMarketDown(n(9));  // down by 9/3 = 3 (total: 12)
            await pmUser.moveMarketDown(n(12)); // down by 12/4 = 3 (total: 9)

            // wait for the challenge period to be over
            for (let i = 0; i <= 5; i++) {
                timeMachine.advanceBlock();
            }

            // owner buys
            await pm.buy();
        });

        it("should have the correct balances", async () => {
            expect(await niftyDollar.balanceOf(ownerAddr)).to.equal(n(41));
            expect(await niftyDollar.balanceOf(userAddr)).to.equal(n(9));
            expect(await niftyDollar.balanceOf(pm.address)).to.equal(n(50));
        });

        it("should allow a claim", async () => {
            await expect(pm.claimRewards()).not.to.be.reverted;
        });

        it("should not allow muliple claims", async () => {
            await expect(pm.claimRewards()).not.to.be.reverted;
            await expect(pm.claimRewards()).to.be.reverted;
        });

        it("should not allow moving the market", async () => {
            await expect(pm.moveMarketUp(n(10))).to.be.reverted;
            await expect(pmUser.moveMarketDown(n(1))).to.be.reverted;
        });

    });

    describe("after some trading, a purchase, and claims", () => {
        let niftyDollarUser : NiftyDollar;
        let pmUser : PredictionMarket;

        beforeEach(async () => {
            // owner started with 70 - 20 in bids - 9 in purchase + 20 in withdrawals - 2 in fine

            // as owner
            await pm.moveMarketUp(n(10));  // up by 10/1 = 10
            await pm.moveMarketUp(n(10));  // up by 10/2 = 5 (total: 15)

            // as user, get approvals
            niftyDollarUser = niftyDollar.connect(user);
            pmUser = pm.connect(user);
            await niftyDollarUser.approve(pm.address, n(1000000));

            // as user, trade
            await pmUser.moveMarketDown(n(9));  // down by 9/3 = 3 (total: 12)
            await pmUser.moveMarketDown(n(12)); // down by 12/4 = 3 (total: 9)

            // wait for the challenge period to be over
            for (let i = 0; i <= 5; i++) {
                timeMachine.advanceBlock();
            }

            // owner buys
            await pm.buy();

            // claims
            await pm.claimRewards();
            await pmUser.claimRewards();

            // wait for claims to expire
            for (let i = 0; i <= 10; i++) {
                timeMachine.advanceBlock();
            }
        });

        it("should not allow claims", async () => {
            await expect(pm.claimRewards()).to.be.reverted;
        });

        it("should allow withdrawals", async () => {
            await expect(pm.withdraw()).not.to.be.reverted;
        });

        it("should not allow moving the market", async () => {
            await expect(pm.moveMarketUp(n(10))).to.be.reverted;
            await expect(pmUser.moveMarketDown(n(1))).to.be.reverted;
        });

        it("should withdraw the correct amounts", async () => {
            // for the owner, who deposited 20 and was wrong about the price
            await expect(pm.withdraw()).not.to.be.reverted;
            expect(await niftyDollar.balanceOf(pm.address)).to.equal(n(31));
            expect(await niftyDollar.balanceOf(ownerAddr)).to.equal(n(60));

            // for the user, who deposited 21 and was right (21/21 = 100% of the reward)
            await expect(pmUser.withdraw()).not.to.be.reverted;
            expect(await niftyDollar.balanceOf(pm.address)).to.equal(n(1));
            expect(await niftyDollar.balanceOf(userAddr)).to.equal(n(39));
        });

    });
    

});