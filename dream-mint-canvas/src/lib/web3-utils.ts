// lib/web3-utils.js
import { ethers } from 'ethers';
import process from 'process';
// Import your NFT contract ABI
// In a real project, you would import this from a JSON file

const NFT_CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721IncorrectOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721InsufficientApproval",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOperator",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721NonexistentToken",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_fromTokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_toTokenId",
        "type": "uint256"
      }
    ],
    "name": "BatchMetadataUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "MetadataUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_tokenUri",
        "type": "string"
      }
    ],
    "name": "mintArt",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mintFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newFee",
        "type": "uint256"
      }
    ],
    "name": "setMintFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract address (replace with your actual deployed contract address)
// NFT Contract Address (with 0x prefix as required by ethers.js)
// const NFT_CONTRACT_ADDRESS = "0xa21037bd78add506b7a4865d84630cae14d48a4bf91a576b8777d95a19245b8e";
const NFT_CONTRACT_ADDRESS = "0x5B79c304eD72Dd32c0ACF51d517A44D60B668d02";

// Network configuration for Holesky Testnet
const NETWORK = {
  name: "Ethereum Holesky Testnet",
  networkId: 17000, // Holesky Testnet Chain ID
  blockExplorer: "https://holesky.etherscan.io",
  rpcUrl: "https://ethereum-holesky.publicnode.com"
};

// Pinata JWT (kept the same as provided)
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYzYxMGM5OS0yMmQ3LTQxODktYWRjZC0zMzRmYjVkOGNmOWMiLCJlbWFpbCI6Imppc2hudWdob3NoMjAyM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMWI5ZDgzZDE1NzE1ZjQ0MTY0OWMiLCJzY29wZWRLZXlTZWNyZXQiOiJiNzQzNTUwZmQ4N2Y0ODBhZWFjNDIwMDE1MmQ3YTI0NDNlYjZhY2NjMmNhYWQ1ZTJkZjQyMGM1ODI5NWI3MjE0IiwiZXhwIjoxNzc4MDkxODg5fQ.s2BXFllCUKnSC8dZs9erp-fq61QeikTFb_u9Pta4L0Y";

/**
 * Store image on IPFS using Pinata
 * @param {string} imageUrl - The URL or base64 data of the image
 * @returns {Promise<string>} - IPFS hash
 */
export const storeOnIPFS = async (imageUrl) => {
  try {
    // Convert the image URL to a File object if it's a data URL
    let imageFile;
    
    if (imageUrl.startsWith('data:image')) {
      // Convert base64 to blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      imageFile = new File([blob], "artwork.png", { type: "image/png" });
    } else {
      // If it's a regular URL, fetch it and convert to File
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      imageFile = new File([blob], "artwork.png", { type: blob.type });
    }
    // Create form data for Pinata API
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // Upload image to IPFS via Pinata
    const resFile = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });
    if (!resFile.ok) {
      const errorData = await resFile.json();
      throw new Error(`Pinata error: ${errorData.message || 'Failed to upload to IPFS'}`);
    }
    const fileData = await resFile.json();
    const imageHash = fileData.IpfsHash;
    console.log("Image uploaded to IPFS:", imageHash);
    return imageHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

/**
 * Create and upload NFT metadata to IPFS using Pinata
 * @param {string} imageHash - IPFS hash of the image
 * @param {string} name - Name of the NFT
 * @param {string} description - Description of the NFT
 * @param {Array} attributes - Optional array of trait attributes
 * @returns {Promise<string>} - IPFS hash of the metadata
 */
export const createAndUploadMetadata = async (imageHash, name, description, attributes = []) => {
  try {
    // Create metadata object (OpenSea compatible)
    const metadata = {
      name: name,
      description: description,
      image: `ipfs://${imageHash}`,
      external_url: `https://ipfs.io/ipfs/${imageHash}`,
      attributes: [
        ...attributes,
        {
          trait_type: "Creation Date",
          value: new Date().toISOString().split('T')[0]
        }
      ]
    };
    
    // Upload metadata to IPFS via Pinata
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata metadata error: ${errorData.message || 'Failed to upload metadata'}`);
    }
    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error("Error creating metadata:", error);
    throw new Error(`Failed to create NFT metadata: ${error.message}`);
  }
};

/**
 * Store NFT data and prepare for OpenSea using Pinata
 * @param {string} imageUrl - The URL or base64 data of the image
 * @param {string} name - Name of the NFT
 * @param {string} description - Description of the NFT
 * @param {Array} attributes - Optional array of trait attributes
 * @returns {Promise<{success: boolean, metadataHash: string, imageHash: string, tokenURI: string}>}
 */
export const storeAndPrepareForOpenSea = async (imageUrl, name, description, attributes = []) => {
  try {
    console.log("Uploading image to IPFS via Pinata...");
    const imageHash = await storeOnIPFS(imageUrl);
    console.log("Image stored on IPFS:", imageHash);
    
    // Create and upload metadata with OpenSea compatibility
    console.log("Creating and uploading metadata...");
    const metadataHash = await createAndUploadMetadata(
      imageHash,
      name || "AI Generated Art",
      description || "Created with AI",
      attributes
    );
    console.log("Metadata stored on IPFS:", metadataHash);
    
    // Create tokenURI using the metadata hash
    const tokenURI = `ipfs://${metadataHash}`;
    return {
      success: true,
      imageHash,
      metadataHash,
      tokenURI,
      ipfsImageUrl: `ipfs://${imageHash}`,
      ipfsMetadataUrl: tokenURI,
      gatewayImageUrl: `https://ipfs.io/ipfs/${imageHash}`,
      gatewayMetadataUrl: `https://ipfs.io/ipfs/${metadataHash}`
    };
  } catch (error) {
    console.error("Error preparing NFT for OpenSea:", error);
    return {
      success: false,
      error: error.message || "Unknown error preparing NFT"
    };
  }
};

/**
 * Connect to the Ethereum wallet (typically MetaMask)
 * @param {number} [chainId=17000] - The chain ID to connect to (17000 = Holesky Testnet)
 * @returns {Promise<{success: boolean, address?: string, chainId?: number, error?: string}>}
 */
export const connectWallet = async (chainId = 17000) => {
  try {
    // Check if ethereum is injected
    if (!window.ethereum) {
      throw new Error("Ethereum wallet not detected. Please install MetaMask or another wallet.");
    }
    // Request accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Check if any accounts were returned
    if (accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your wallet and try again.");
    }
    // Get the current chain ID
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    const currentChainIdDecimal = parseInt(currentChainId, 16);
    
    // If we're not on the requested chain, try to switch
    if (currentChainIdDecimal !== chainId) {
      try {
        // Request chain switch
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
        
        console.log(`Switched to chain ID: ${chainId}`);
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          console.log("Holesky testnet not available in wallet, adding it");
          
          // Add Holesky testnet to MetaMask
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: 'Ethereum Holesky Testnet',
                nativeCurrency: {
                  name: 'Holesky ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: [NETWORK.rpcUrl],
                blockExplorerUrls: [NETWORK.blockExplorer]
              }
            ],
          });
        } else {
          console.error("Error switching chains:", switchError);
          throw switchError;
        }
      }
    }
    
    // Get the updated chain ID
    const updatedChainId = await window.ethereum.request({ method: 'eth_chainId' });
    const updatedChainIdDecimal = parseInt(updatedChainId, 16);
    
    // Return the connected account and chain
    return {
      success: true,
      address: accounts[0],
      chainId: updatedChainIdDecimal
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    return {
      success: false,
      error: error.message || "Unknown error connecting wallet"
    };
  }
};

/**
 * Get the address of the currently connected wallet
 * @returns {Promise<string|null>} Connected wallet address or null if not connected
 */
export const getConnectedWalletAddress = async () => {
  try {
    // Check if ethereum is injected
    if (!window.ethereum) {
      return null;
    }
    
    // Get accounts without prompting
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    
    // Return the first account or null if none found
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error("Error getting connected wallet:", error);
    return null;
  }
};

/**
 * Truncate an Ethereum address for display
 * @param {string} address - The full Ethereum address
 * @param {number} [startChars=6] - Number of characters to show at the start
 * @param {number} [endChars=4] - Number of characters to show at the end
 * @returns {string} Truncated address or empty string if invalid
 */
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address || typeof address !== 'string' || address.length < (startChars + endChars + 3)) {
    return '';
  }
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Store image on IPFS using Pinata
 * @param {string|File} imageData - The URL, base64 data of the image, or File object
 * @returns {Promise<{success: boolean, hash?: string, url?: string, error?: string}>}
 */
export const storeOnIPFSWithPinata = async (imageData) => {
  try {
    // Convert the image data to a File object
    let imageFile;
    
    if (imageData instanceof File) {
      // Already a File object
      imageFile = imageData;
    } else if (typeof imageData === 'string') {
      // Check if it's an IPFS URL - we need to convert it to HTTP first
      if (imageData.startsWith('ipfs://')) {
        const ipfsHash = imageData.replace('ipfs://', '');
        // Convert IPFS URL to HTTP gateway URL
        imageData = `https://ipfs.io/ipfs/${ipfsHash}`;
      }
      
      if (imageData.startsWith('data:image')) {
        // Convert base64 to blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        imageFile = new File([blob], "artwork.png", { type: "image/png" });
      } else {
        // If it's a regular URL, fetch it and convert to File
        try {
          const response = await fetch(imageData);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          const blob = await response.blob();
          const fileType = blob.type || "image/png"; // Default to png if type not detected
          const fileName = "artwork." + (fileType.split('/')[1] || "png");
          imageFile = new File([blob], fileName, { type: fileType });
        } catch (fetchError) {
          console.error("Error fetching image:", fetchError);
          throw new Error(`Failed to fetch image: ${fetchError.message}`);
        }
      }
    } else {
      throw new Error("Invalid image data. Please provide a URL, base64 data, or File object.");
    }
    // Create form data for Pinata API
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // Add metadata (optional)
    const metadata = JSON.stringify({
      name: `AI Generated Art - ${new Date().toISOString()}`,
      keyvalues: {
        uploadDate: new Date().toISOString(),
        fileType: imageFile.type
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Add pinata options (optional)
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);
    
    // Upload image to IPFS via Pinata
    console.log("Uploading to IPFS via Pinata...");
    const resFile = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });
    if (!resFile.ok) {
      const errorData = await resFile.json();
      throw new Error(`Pinata error: ${errorData.message || 'Failed to upload to IPFS'}`);
    }
    const fileData = await resFile.json();
    const ipfsHash = fileData.IpfsHash;
    
    return {
      success: true,
      hash: ipfsHash,
      url: `ipfs://${ipfsHash}`,
      gatewayUrl: `https://ipfs.io/ipfs/${ipfsHash}`,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    };
  } catch (error) {
    console.error("Error uploading to IPFS with Pinata:", error);
    return {
      success: false,
      error: error.message || "Unknown error uploading to IPFS"
    };
  }
};

/**
 * Mint an NFT on Holesky testnet
 * @param {string} tokenURI - IPFS URI of the metadata
 * @param {string} contractAddress - Address of the NFT contract
 * @returns {Promise<{success: boolean, tokenId: string|null, txHash?: string, etherscanUrl?: string}>}
 */
export const mintNFTOnHolesky = async (tokenURI, contractAddress = NFT_CONTRACT_ADDRESS) => {
  try {
    // Check if ethereum is injected
    if (!window.ethereum) {
      throw new Error("Ethereum wallet not detected. Please install MetaMask or another wallet.");
    }
    
    // Make sure the contract address starts with 0x
    if (!contractAddress.startsWith("0x")) {
      contractAddress = "0x" + contractAddress;
    }
    
    // Import ethers
    const { ethers } = await import('ethers');
    
    // Connect to provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Holesky testnet chainId
    const chainId = 17000;
    
    // Check current chain
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
    
    // If not on Holesky, request network switch
    if (currentChainId !== chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      } catch (switchError) {
        // If the network is not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: 'Ethereum Holesky Testnet',
                nativeCurrency: {
                  name: 'Holesky ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: [NETWORK.rpcUrl],
                blockExplorerUrls: [NETWORK.blockExplorer]
              }
            ],
          });
        } else {
          throw switchError;
        }
      }
    }
    
    // Get signer after ensuring correct network
    const signer = await provider.getSigner();
    
    // Make sure we have the correct ABI
    const NFT_CONTRACT_ABI = [
      // Basic ERC721 functions
      "function mint(address to, string memory tokenURI) public",
      "function mintArt(string memory tokenURI) public payable",
      "function tokenCounter() public view returns (uint256)",
      "function totalSupply() public view returns (uint256)",
      "function mintFee() public view returns (uint256)",
      // Transfer event
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    ];
    
    const contract = new ethers.Contract(
      contractAddress,
      NFT_CONTRACT_ABI,
      signer
    );
    
    console.log("Getting mint fee from contract...");
    
    // Get the mint fee (if applicable)
    let mintFee;
    try {
      mintFee = await contract.mintFee();
      console.log("Mint fee:", ethers.formatEther(mintFee), "ETH");
    } catch (feeError) {
      console.log("No mint fee function or error getting fee:", feeError);
      // If we can't get the fee, default to zero
      mintFee = 0n;
    }
    
    console.log("Minting NFT on Holesky testnet...");
    
    // Try mintArt first (common in NFT contracts)
    let tx;
    try {
      tx = await contract.mintArt(tokenURI, {
        value: mintFee
      });
    } catch (mintArtError) {
      console.log("mintArt failed, trying basic mint function:", mintArtError);
      
      // If mintArt fails, try the basic mint function
      const signerAddress = await signer.getAddress();
      tx = await contract.mint(signerAddress, tokenURI);
    }
    
    console.log("Transaction submitted:", tx.hash);
    
    // Wait for transaction to be confirmed
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    // Extract the token ID from the transaction receipt
    let tokenId = null;
    
    // Loop through logs to find the Transfer event
    for (const log of receipt.logs) {
      try {
        // Parse each log to see if it's the Transfer event
        const iface = new ethers.Interface(NFT_CONTRACT_ABI);
        const parsedLog = iface.parseLog({
          topics: log.topics,
          data: log.data
        });
        
        // Check if this is the Transfer event
        if (parsedLog && parsedLog.name === 'Transfer') {
          // Extract the token ID (third parameter of Transfer event)
          tokenId = parsedLog.args[2].toString();
          break;
        }
      } catch (e) {
        // Not all logs can be parsed as Transfer events, so just continue
        continue;
      }
    }
    
    // If no token ID was found, try getting the current token counter
    if (tokenId === null) {
      try {
        // Try tokenCounter first
        try {
          const counter = await contract.tokenCounter();
          // The token counter is the next ID, so the minted one is counter-1
          tokenId = (Number(counter) - 1).toString();
        } catch (e) {
          // If tokenCounter fails, try totalSupply instead
          const supply = await contract.totalSupply();
          // The latest token ID is usually the totalSupply
          tokenId = supply.toString();
        }
      } catch (e) {
        console.error("Could not determine token ID:", e);
      }
    }
    
    // Generate Etherscan URL for Holesky
    const etherscanUrl = tokenId ? 
      `${NETWORK.blockExplorer}/token/${contractAddress}?a=${tokenId}` : 
      `${NETWORK.blockExplorer}/tx/${receipt.hash}`;
    
    return {
      success: true,
      tokenId,
      txHash: receipt.hash,
      etherscanUrl,
      blockExplorer: NETWORK.blockExplorer
    };
  } catch (error) {
    console.error("Error minting NFT on Holesky testnet:", error);
    return {
      success: false,
      tokenId: null,
      error: error.message || "Unknown minting error"
    };
  }
};

/**
 * Mint an NFT using the connected wallet
 * @param {string} imageUrl - URL of the image to mint
 * @param {string} name - Name of the NFT
 * @param {string} description - Description of the NFT
 * @param {Array} attributes - Optional array of trait attributes
 * @returns {Promise<{success: boolean, tokenId: string|null, txHash?: string}>}
 */
export const mintNFT = async (imageUrl, name, description, attributes = []) => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error("Cannot mint NFT in server environment");
    }
    console.log("Starting NFT minting process on Holesky testnet...");
    
    // First ensure we're connected to Holesky testnet
    const connectionResult = await connectWallet(17000); // Holesky testnet Chain ID
    if (!connectionResult.success) {
      throw new Error(`Failed to connect wallet: ${connectionResult.error}`);
    }
    console.log("Wallet connected to Holesky testnet:", connectionResult.address);
    
    // Upload the image to IPFS
    console.log("Uploading image to IPFS...");
    const imageResult = await storeOnIPFSWithPinata(imageUrl);
    console.log("Image upload result:", imageResult);
    
    if (!imageResult.success) {
      throw new Error(`Failed to upload image to IPFS: ${imageResult.error}`);
    }
    
    const imageHash = imageResult.hash;
    console.log("Image uploaded to IPFS:", imageHash);
    
    // Create metadata for the NFT
    const metadata = {
      name: name || "AI Generated Art",
      description: description || "Created with AI",
      image: `ipfs://${imageHash}`,
      external_url: `https://ipfs.io/ipfs/${imageHash}`,
      attributes: [
        ...attributes,
        {
          trait_type: "Creation Date",
          value: new Date().toISOString().split('T')[0]
        },
        {
          trait_type: "Network",
          value: "Holesky Testnet"
        }
      ]
    };
    
    console.log("Uploading metadata to IPFS...");
    
    // Upload metadata to IPFS via Pinata
    const metadataResponse = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });
    
    if (!metadataResponse.ok) {
      const errorData = await metadataResponse.json();
      throw new Error(`Pinata metadata error: ${errorData.message || 'Failed to upload metadata'}`);
    }
    
    const metadataResult = await metadataResponse.json();
    const metadataHash = metadataResult.IpfsHash;
    console.log("Metadata uploaded to IPFS:", metadataHash);
    
    // Create tokenURI
    const tokenURI = `ipfs://${metadataHash}`;
    
    // Now mint the NFT on Holesky testnet
    console.log("Minting NFT on Holesky testnet...");
    const mintResult = await mintNFTOnHolesky(tokenURI, NFT_CONTRACT_ADDRESS);
    
    if (!mintResult.success) {
      throw new Error(`Failed to mint NFT: ${mintResult.error}`);
    }
    
    console.log("NFT minted successfully:", mintResult);
    
    // Return all the information about the minted NFT
    return {
      success: true,
      tokenId: mintResult.tokenId,
      txHash: mintResult.txHash,
      etherscanUrl: mintResult.etherscanUrl,
      ipfsImageUrl: `ipfs://${imageHash}`,
      gatewayImageUrl: `https://ipfs.io/ipfs/${imageHash}`,
      ipfsMetadataUrl: tokenURI,
      gatewayMetadataUrl: `https://ipfs.io/ipfs/${metadataHash}`,
      network: "Holesky Testnet"
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    return {
      success: false,
      tokenId: null,
      error: error.message || "Unknown minting error"
    };
  }
};