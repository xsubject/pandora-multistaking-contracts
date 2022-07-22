import "@nomiclabs/hardhat-waffle";
import * as dotenv from 'dotenv';
import 'hardhat-contract-sizer';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-ethers';

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
  }
};
