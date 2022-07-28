import "@nomiclabs/hardhat-waffle";
import * as dotenv from 'dotenv';
import 'hardhat-contract-sizer';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat'

dotenv.config();


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {
      accounts: [{
        balance: "10000000000000000000000000000",
        privateKey: process.env.PRIVATE_KEY
      }],
      forking: {
        url: "https://bsc-dataseed.binance.org/"
      },
      loggingEnabled: false
    }
  },
  typechain: {
    outDir: 'scripts/types',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    externalArtifacts: ['externalArtifacts/*.json'], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
    // dontOverrideCompile: false // defaults to false
  },
};
