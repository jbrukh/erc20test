import { BuidlerConfig, usePlugin } from "@nomiclabs/buidler/config";

usePlugin("@nomiclabs/buidler-waffle");
usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("@nomiclabs/buidler-etherscan");
usePlugin("buidler-typechain");

const INFURA_API_KEY = process.env.INFURA_API_KEY;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: BuidlerConfig = {
  solc: {
    version: "0.6.2"
  },
  typechain: {
    outDir: "typechain",
    target: "ethers"
  },
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`${RINKEBY_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    url: "https://api-rinkeby.etherscan.io/api",
    apiKey: `${ETHERSCAN_API_KEY}`
  }
};

export default config;