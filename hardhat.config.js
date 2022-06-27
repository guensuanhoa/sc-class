require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: process.env.PRIVATE_KEY_TESTNET !== undefined ? [process.env.PRIVATE_KEY_TESTNET] : [],
    },
    //   mainnet: {
    //     url: "https://bsc-dataseed.binance.org/",
    //     chainId: 56,
    //     gasPrice: 20000000000,
    //     accounts: {mnemonic: mnemonic} // process.env.PRIVATE_KEY_MAINNET
    //   }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
