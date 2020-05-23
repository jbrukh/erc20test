import { BuidlerConfig, usePlugin } from "@nomiclabs/buidler/config";

usePlugin("@nomiclabs/buidler-waffle");
usePlugin("@nomiclabs/buidler-ganache");
usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("buidler-typechain");

const config: BuidlerConfig = {
  solc: {
    version: "0.6.2"
  },
  typechain: {
    outDir: "typechain",
    target: "ethers"
  }
};

export default config;