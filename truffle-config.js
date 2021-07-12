const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const secret = require("./client/src/secret.json");
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },

    mumbai: {
      provider: () =>
        new HDWalletProvider(
          process.env.val2,
          `https://matic-mumbai.chainstacklabs.com`
        ),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },

    rinkeby: {
      provider: function () {
        return new HDWalletProvider(process.env.val2, secret.rinkeby);
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    },

    bsc_testnet: {
      provider: () =>
        new HDWalletProvider(
          process.env.val2,
          `https://data-seed-prebsc-1-s1.binance.org:8545`
        ),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    bsc: {
      provider: () =>
        new HDWalletProvider(
          process.env.val2,
          `https://bsc-dataseed1.binance.org`
        ),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.3",
    },
  },
};
