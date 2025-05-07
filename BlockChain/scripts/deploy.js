// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying AIArtNFT contract...");

  // Get the contract factory
  const AIArtNFTFactory = await ethers.getContractFactory("AIArtNFT");

  // Deploy the contract
  const aiArtNFT = await AIArtNFTFactory.deploy();

  // Wait for deployment to finish
  await aiArtNFT.waitForDeployment();

  // Get the contract address
  const contractAddress = await aiArtNFT.getAddress();

  console.log(`AIArtNFT deployed to: ${contractAddress}`);
  console.log("Deployment complete!");

  // For verification purposes, log the initial mint fee
  const mintFee = await aiArtNFT.mintFee();
  console.log(`Initial mint fee: ${ethers.formatEther(mintFee)} ETH`);
}

// Execute the deployment function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });