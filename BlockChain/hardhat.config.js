require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    holesky: {
      url: "https://eth-holesky.g.alchemy.com/v2/AwRVKLSRwjQC-KsDK84kkpq4e-TlWodv", // or Infura/Alchemy Holesky URL
      chainId: 17000,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      holesky: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "holesky",
        chainId: 17000,
        urls: {
          apiURL: "https://api-holesky.etherscan.io/api", // double-check if your key is for this endpoint
          browserURL: "https://holesky.etherscan.io",
        },
      },
    ],
  },
};