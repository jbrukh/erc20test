
import { ethers } from "@nomiclabs/buidler";
import chai, { expect } from "chai";

import { NiftyDollar } from "../typechain/NiftyDollar"


describe("NiftyDollar", () => {
    
    let dollar: NiftyDollar;
    let ownerAddr : string;
    let userAddr : string;

    const TOTAL_SUPPLY = 100;

    beforeEach(async () => {
        const [owner, user] = await ethers.getSigners();
        ownerAddr = await owner.getAddress();
        userAddr = await user.getAddress();    
        const NiftyDollarFactory = await ethers.getContractFactory("NiftyDollar");
        dollar = await NiftyDollarFactory.deploy(TOTAL_SUPPLY) as NiftyDollar;
    });
  
    it("should have a total supply of 100", async () => {
        expect(await dollar.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("owner should hold the total supply", async() => {
        expect(await dollar.balanceOf(ownerAddr)).to.equal(TOTAL_SUPPLY);
    });

    it("should support transfers", async () => {
        await dollar.transfer(userAddr, 50);
        expect(await dollar.balanceOf(ownerAddr)).to.equal(50);
        expect(await dollar.balanceOf(userAddr)).to.equal(50);
    });

    it("should mint stuff", async () => {
        await dollar.mint(99);
        expect(await dollar.balanceOf(ownerAddr)).to.equal(TOTAL_SUPPLY + 99);
    });

});