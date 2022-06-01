require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");

require("hardhat-contract-sizer");
require("solidity-coverage");

require("dotenv").config();

require("./tasks/burn.js");
require("./tasks/migrate.js");
require("./tasks/mint.js");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_URL || "",
        //        url: process.env.BINANCE_URL || ''
        //        url: process.env.MUMBAI_URL || ''
        //url: process.env.OPTIMISM_URL || "",
      },
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.BRIDGE_PRIVATE_KEY,
        process.env.ECOSYSTEM_PRIVATE_KEY,
        process.env.MARKETING_PRIVATE_KEY,
      ],
      //gasPrice: 600000000000,
      timeout: 300000,
    },
    binance: {
      url: process.env.BINANCE_URL || "",
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.BRIDGE_PRIVATE_KEY,
        process.env.ECOSYSTEM_PRIVATE_KEY,
        process.env.MARKETING_PRIVATE_KEY,
      ],
      //gasPrice: 5000000000,
      timeout: 300000,
    },
    binancetest: {
      url: process.env.BINANCETEST_URL || "",
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.BRIDGE_PRIVATE_KEY,
        process.env.ECOSYSTEM_PRIVATE_KEY,
        process.env.MARKETING_PRIVATE_KEY,
      ],
      chainId: 97,
      //gasPrice: 5000000000,
      timeout: 300000,
    },
    mumbai: {
      url: process.env.MUMBAI_URL || "",
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.BRIDGE_PRIVATE_KEY,
        process.env.ECOSYSTEM_PRIVATE_KEY,
        process.env.MARKETING_PRIVATE_KEY,
      ],
      chainId: 80001,
      //gasPrice: 5000000000,
      timeout: 300000,
    },
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.BRIDGE_PRIVATE_KEY,
        process.env.ECOSYSTEM_PRIVATE_KEY,
        process.env.MARKETING_PRIVATE_KEY,
      ],
      chainId: 4,
      timeout: 300000,
      //gasPrice: 1000000000
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.BRIDGE_PRIVATE_KEY,
        process.env.ECOSYSTEM_PRIVATE_KEY,
        process.env.MARKETING_PRIVATE_KEY,
      ],
      chainId: 3,
      timeout: 300000,
      //gasPrice: 100000000000
    },
    kovan: {
      url: process.env.KOVAN_URL || "",
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.BRIDGE_PRIVATE_KEY,
        process.env.ECOSYSTEM_PRIVATE_KEY,
        process.env.MARKETING_PRIVATE_KEY,
      ],
      timeout: 300000,
      gasPrice: 1000000000,
    },
    optimism: {
      url: process.env.OPTIMISM_URL,
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.BRIDGE_PRIVATE_KEY,
        process.env.ECOSYSTEM_PRIVATE_KEY,
        process.env.MARKETING_PRIVATE_KEY,
      ],
      timeout: 300000,
    },
  },
  mocha: {
    timeout: 300000,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      bsc: process.env.BINANCESCAN_API_KEY,
      bscTestnet: process.env.BINANCESCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },
};
