const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIArtNFT", function () {
  let AIArtNFT;
  let aiArtNFT;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  
  const ipfsURI = "ipfs://QmXyZ123456789AbCdEfGhIjKlMnOpQrStUvWxYz";
  const mintFee = ethers.parseEther("0.01");

  beforeEach(async function () {
    // Get the contract factory and signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    AIArtNFT = await ethers.getContractFactory("AIArtNFT");

    // Deploy the contract
    aiArtNFT = await AIArtNFT.deploy();
    // Wait for deployment
    await aiArtNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await aiArtNFT.owner()).to.equal(owner.address);
    });

    it("Should initialize tokenCounter to 0", async function () {
      expect(await aiArtNFT.tokenCounter()).to.equal(0);
    });

    it("Should initialize with correct mint fee", async function () {
      expect(await aiArtNFT.mintFee()).to.equal(mintFee);
    });
  });

  describe("Minting", function () {
    it("Should revert when insufficient ETH sent", async function () {
      const insufficientFee = ethers.parseEther("0.005");
      await expect(
        aiArtNFT.connect(addr1).mintArt(ipfsURI, { value: insufficientFee })
      ).to.be.revertedWith("Insufficient ETH sent");
    });

    it("Should mint NFT when correct fee is sent", async function () {
      await aiArtNFT.connect(addr1).mintArt(ipfsURI, { value: mintFee });
      
      // Token ID should be 0 for first mint
      const tokenId = 0;
      
      // Check ownership
      expect(await aiArtNFT.ownerOf(tokenId)).to.equal(addr1.address);
      
      // Check tokenURI
      expect(await aiArtNFT.tokenURI(tokenId)).to.equal(ipfsURI);
      
      // Check tokenCounter increased
      expect(await aiArtNFT.tokenCounter()).to.equal(1);
    });

    it("Should accept overpayment", async function () {
      const overpayment = ethers.parseEther("0.02");
      await aiArtNFT.connect(addr1).mintArt(ipfsURI, { value: overpayment });
      
      // Token should still be minted correctly
      expect(await aiArtNFT.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should increment token ID for sequential mints", async function () {
      await aiArtNFT.connect(addr1).mintArt(ipfsURI, { value: mintFee });
      await aiArtNFT.connect(addr2).mintArt(ipfsURI + "2", { value: mintFee });
      
      // Check ownership of second token
      expect(await aiArtNFT.ownerOf(1)).to.equal(addr2.address);
      
      // Check tokenURI of second token
      expect(await aiArtNFT.tokenURI(1)).to.equal(ipfsURI + "2");
      
      // Check tokenCounter increased again
      expect(await aiArtNFT.tokenCounter()).to.equal(2);
    });
  });

  describe("Owner functions", function () {
    it("Should allow owner to withdraw funds", async function () {
      // First mint an NFT to add funds to the contract
      await aiArtNFT.connect(addr1).mintArt(ipfsURI, { value: mintFee });
      
      // Get initial balance
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      // Withdraw
      const tx = await aiArtNFT.connect(owner).withdraw();
      const receipt = await tx.wait();
      
      // Calculate gas cost
      const gasCost = receipt.gasUsed * tx.gasPrice;
      
      // Get final balance
      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      // Check that owner received the funds (accounting for gas costs)
      expect(finalBalance).to.equal(
        initialBalance + mintFee - gasCost
      );
      
      // Contract balance should be 0
      expect(await ethers.provider.getBalance(aiArtNFT.address)).to.equal(0);
    });

    it("Should prevent non-owners from withdrawing", async function () {
      // First mint an NFT to add funds to the contract
      await aiArtNFT.connect(addr1).mintArt(ipfsURI, { value: mintFee });
      
      // Try to withdraw as non-owner
      await expect(
        aiArtNFT.connect(addr1).withdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to update mint fee", async function () {
      const newFee = ethers.parseEther("0.02");
      await aiArtNFT.connect(owner).setMintFee(newFee);
      
      expect(await aiArtNFT.mintFee()).to.equal(newFee);
      
      // Test minting with new fee
      await expect(
        aiArtNFT.connect(addr1).mintArt(ipfsURI, { value: mintFee })
      ).to.be.revertedWith("Insufficient ETH sent");
      
      // Should work with new fee
      await aiArtNFT.connect(addr1).mintArt(ipfsURI, { value: newFee });
      expect(await aiArtNFT.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should prevent non-owners from updating mint fee", async function () {
      const newFee = ethers.utils.parseEther("0.02");
      
      await expect(
        aiArtNFT.connect(addr1).setMintFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      // Fee should remain unchanged
      expect(await aiArtNFT.mintFee()).to.equal(mintFee);
    });
  });
});