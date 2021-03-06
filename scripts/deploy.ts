import { ethers } from "@nomiclabs/buidler";


async function main() {

  // deploy the NiftyDollar ERC20 contract
  const niftyDollarFactory = await ethers.getContract("NiftyDollar");
  const niftyDollar = await niftyDollarFactory.deploy(100);

  // The address the Contract WILL have once mined
  console.log(niftyDollar.address);
  // The transaction that was sent to the network to deploy the Contract
  console.log(niftyDollar.deployTransaction.hash);
  // The contract is NOT deployed yet; we must wait until it is mined
  await niftyDollar.deployed();
  console.log('NiftyDollar deployed.\n');

  const pmf = await ethers.getContract("PredictionMarket");
  const pm = await pmf.deploy(niftyDollar.address);
  console.log(pm.address);
  console.log(pm.deployTransaction.hash);
  await pm.deployed();
  console.log('PredictionMarket deployed.\n');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });