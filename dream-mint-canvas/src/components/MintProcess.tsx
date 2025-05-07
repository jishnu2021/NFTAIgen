import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader, 
  Check, 
  CreditCard, 
  Database, 
  Fingerprint,
  ExternalLink,
  Wallet,
  RefreshCw
} from "lucide-react";
import { 
  mintNFT, 
  storeOnIPFS, 
  connectWallet, 
  getConnectedWalletAddress, 
  truncateAddress,
  storeOnIPFSWithPinata 
} from "@/lib/web3-utils";
import { toast } from "sonner";
import { ethers } from "ethers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MintProcessProps {
  imageUrl: string | null;
  prompt: string | null;
  tokenURI?: string | null; 
  ipfsImageHash?: string | null;
  onNFTMinted: (tokenId: string, openseaUrl?: string) => void;
}

const MintProcess = ({ imageUrl, prompt, tokenURI, ipfsImageHash, onNFTMinted }: MintProcessProps) => {
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState(prompt || "");
  const [isMinting, setIsMinting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [ipfsHash, setIpfsHash] = useState<string | null>(ipfsImageHash || null);
  const [metadataHash, setMetadataHash] = useState<string | null>(tokenURI ? tokenURI.replace('ipfs://', '') : null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [openseaUrl, setOpenseaUrl] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [network, setNetwork] = useState("holesky"); // Updated default to holesky
  
  // This will handle manually set transaction hash
  const [manualTxHash, setManualTxHash] = useState<string | null>(null);

  // Check if wallet is connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const address = await getConnectedWalletAddress();
        setWalletAddress(address);
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    checkWalletConnection();
    
    // Setup event listener for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : null);
      });
    }

    return () => {
      // Clean up event listener
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  // New effect to handle transaction monitoring
  useEffect(() => {
    // If we have a transaction hash but UI hasn't updated to completed state
    if ((txHash || manualTxHash) && isMinting && currentStep === 3) {
      const hashToCheck = txHash || manualTxHash;
      
      const checkTransactionStatus = async () => {
        try {
          if (typeof window !== "undefined" && window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const receipt = await provider.getTransactionReceipt(hashToCheck as string);
            
            if (receipt && receipt.confirmations > 0) {
              // Transaction confirmed!
              console.log("Transaction confirmed:", receipt);
              setCurrentStep(4);
              setIsMinting(false);
              
              // Generate OpenSea URL
              const contractAddress = receipt.to || "0x..."; // Get contract address from receipt
              const event = receipt.logs.find(log => 
                log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" && 
                log.topics.length === 4
              );
              
              let tokenId = "";
              if (event && event.topics[3]) {
                tokenId = parseInt(event.topics[3], 16).toString();
              }
              
              // Generate OpenSea URL based on correct network
              const openseaBaseUrl = network === "mainnet" 
                ? "https://opensea.io/assets/ethereum" 
                : network === "holesky"
                  ? "https://testnets.opensea.io/assets/holesky"
                  : "https://testnets.opensea.io/assets/goerli";
              
              const generatedOpenseaUrl = `${openseaBaseUrl}/${contractAddress}/${tokenId}`;
              setOpenseaUrl(generatedOpenseaUrl);
              
              toast.success("NFT minted successfully!");
              if (tokenId) {
                onNFTMinted(tokenId, generatedOpenseaUrl);
              }
            }
          }
        } catch (error) {
          console.error("Error checking transaction status:", error);
        }
      };

      // Check immediately
      checkTransactionStatus();
      
      // And set up interval to check every 5 seconds
      const interval = setInterval(checkTransactionStatus, 5000);
      
      // Clean up interval after max 2 minutes
      const timeout = setTimeout(() => {
        clearInterval(interval);
        // If still minting after 2 minutes, offer manual completion
        if (isMinting && currentStep === 3) {
          toast.info("Transaction may be complete. Check OpenSea or click 'Complete Process'");
        }
      }, 120000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [txHash, manualTxHash, isMinting, currentStep, network, onNFTMinted]);

  const steps = [
    { label: "Upload Image to IPFS", icon: Database },
    { label: "Create Metadata", icon: Database },
    { label: "Pay Gas Fee", icon: CreditCard },
    { label: "Mint NFT", icon: Fingerprint },
    { label: "Complete", icon: Check },
  ];

  const handleConnectWallet = async () => {
    try {
      toast.loading("Connecting wallet...");
      const result = await connectWallet();
      if (result.success && result.address) {
        setWalletAddress(result.address);
      } else {
        throw new Error(result.error || "Failed to connect wallet");
      }
      toast.dismiss();
      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Failed to connect wallet: ${error.message}`);
      console.error("Failed to connect wallet:", error);
    }
  };

  // Function for creating and uploading metadata
  const createAndUploadMetadata = async (imageHash: string, name: string, description: string) => {
    const metadata = {
      name,
      description,
      image: `ipfs://${imageHash}`,
      attributes: []
    };
    
    try {
      return await storeOnIPFS(JSON.stringify(metadata));
    } catch (error) {
      console.warn("Primary metadata upload failed, trying alternative:", error);
      return await storeOnIPFSWithPinata(JSON.stringify(metadata));
    }
  };

  const handleMint = async () => {
    // If we already have tokenURI from previous upload, use it directly
    if (tokenURI && ipfsImageHash) {
      console.log("Using pre-uploaded content:", { tokenURI, ipfsImageHash });
      setCurrentStep(2); // Skip to gas fee step
      setIsMinting(true);
      
      try {
        toast.info("Processing transaction...");
        setCurrentStep(3);
        
        // Mint NFT using the existing tokenURI
        toast.info("Minting your NFT on-chain...");
        const metadataHash = tokenURI.replace('ipfs://', '');
        console.log("Minting NFT with metadata:", metadataHash);
        
        const result = await mintNFT(tokenURI, nftName, nftDescription, [metadataHash]);
        
        if (result.success && result.tokenId) {
          setTxHash(result.txHash || null);
          
          // Generate appropriate OpenSea URL based on network
          const openseaBaseUrl = network === "mainnet" 
            ? "https://opensea.io/assets/ethereum" 
            : network === "holesky"
              ? "https://testnets.opensea.io/assets/holesky"
              : "https://testnets.opensea.io/assets/goerli";
          
          const generatedOpenseaUrl = result.openseaUrl || 
            `${openseaBaseUrl}/${result.contractAddress}/${result.tokenId}`;
          
          setOpenseaUrl(generatedOpenseaUrl);
          
          // Set to complete status
          setCurrentStep(4);
          setIsMinting(false);
          
          toast.success("NFT minted successfully!");
          onNFTMinted(result.tokenId, generatedOpenseaUrl);
        } else {
          throw new Error(result.error || "Minting failed");
        }
      } catch (error: any) {
        handleMintError(error);
      } finally {
        if (currentStep === 3) {
          setIsMinting(false);
        }
      }
      return;
    }
    
    // Normal minting flow if we don't have pre-uploaded content
    if (!imageUrl) {
      toast.error("No image available to mint");
      return;
    }
    
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!nftName.trim()) {
      toast.error("Please enter a name for your NFT");
      return;
    }
    
    setIsMinting(true);
    setCurrentStep(0);

    try {
      // Step 1: Upload image to IPFS
      toast.info("Uploading image to IPFS...");
      
      // Try primary method first, fall back to alternative if needed
      let hash;

      try {
        hash = await storeOnIPFS(imageUrl);
        console.log("Image uploaded to IPFS:", hash);
        if (!hash) {
          throw new Error("Failed to upload image to IPFS");
        }
      } catch (uploadError: any) {
        console.warn("Primary IPFS upload failed, trying alternative:", uploadError);
        setStorageError(`Primary upload failed: ${uploadError.message}`);
        toast.info("Switching to alternative storage provider...");
        
        try {
          // Try alternative method
          hash = await storeOnIPFSWithPinata(imageUrl);
        } catch (backupError: any) {
          throw new Error(`All storage providers failed. Primary: ${uploadError.message}, Backup: ${backupError.message}`);
        }
      }
      
      setIpfsHash(hash);
      setCurrentStep(1);
      
      // Step 2: Create and upload metadata
      toast.info("Creating NFT metadata...");
      const metadataHash = await createAndUploadMetadata(hash, nftName, nftDescription);
      setMetadataHash(metadataHash);
      setCurrentStep(2);
      
      // Step 3: Pay Gas Fee (this happens during minting)
      toast.info("Processing transaction...");
      setCurrentStep(3);
      
      // Step 4: Mint NFT
      toast.info("Minting your NFT on-chain...");
      console.log("Minting NFT with metadata:", metadataHash);
      const result = await mintNFT(`ipfs://${metadataHash}`, nftName, nftDescription, metadataHash);
      
      if (result.success && result.tokenId) {
        setTxHash(result.txHash || null);
        
        // Generate appropriate OpenSea URL
        const openseaBaseUrl = network === "mainnet" 
          ? "https://opensea.io/assets/ethereum" 
          : network === "holesky"
            ? "https://testnets.opensea.io/assets/holesky"
            : "https://testnets.opensea.io/assets/goerli";
        
        const generatedOpenseaUrl = result.openseaUrl || 
          `${openseaBaseUrl}/${result.contractAddress}/${result.tokenId}`;
        
        setOpenseaUrl(generatedOpenseaUrl);
        
        // Set to complete step
        setCurrentStep(4);
        setIsMinting(false);
        
        toast.success("NFT minted successfully!");
        onNFTMinted(result.tokenId, generatedOpenseaUrl);
      } else {
        throw new Error(result.error || "Minting failed");
      }
    } catch (error: any) {
      handleMintError(error);
    } finally {
      if (currentStep === 3) {
        setIsMinting(false);
      }
    }
  };

  const handleMintError = (error: any) => {
    console.error("Error minting NFT:", error);
    
    // Show appropriate error message based on error type
    if (error.message?.includes("user rejected")) {
      toast.error("Transaction was rejected by the user");
    } else if (error.message?.includes("insufficient funds")) {
      toast.error("Insufficient funds in your wallet for gas fees");
    } else if (error.message?.includes("upload") || error.message?.includes("storage")) {
      toast.error(`Storage error: ${error.message}`);
    } else {
      toast.error(`Failed to mint NFT: ${error.message || "Unknown error"}`);
    }
    
    // Don't reset to beginning if we got past the first step
    if (currentStep <= 1) {
      setCurrentStep(0);
    }
  };

  // Function to manually complete the process with a specific transaction hash
  const forceCompleteProcess = () => {
    if (txHash) {
      setCurrentStep(4);
      setIsMinting(false);
      toast.success("Process marked as complete");
      
      // Calculate OpenSea URL
      updateOpenSeaUrl(txHash);
    } else if (manualTxHash) {
      setTxHash(manualTxHash);
      setCurrentStep(4);
      setIsMinting(false);
      toast.success("Process marked as complete");
      
      // Calculate OpenSea URL
      updateOpenSeaUrl(manualTxHash);
    }
  };
  
  // Helper function to update OpenSea URL based on network and transaction hash
  const updateOpenSeaUrl = (transactionHash: string) => {
    // For demo purposes, using a placeholder contract address
    // In a real app, you'd get this from your contract or transaction receipt
    const contractAddress = "0x..."; // This should be your actual contract address
    const tokenId = "1"; // This would ideally come from your transaction receipt
    
    const baseUrl = network === "mainnet" 
      ? "https://opensea.io/assets/ethereum"
      : network === "holesky"
        ? "https://testnets.opensea.io/assets/holesky"
        : "https://testnets.opensea.io/assets/goerli";
    
    const generatedUrl = `${baseUrl}/${contractAddress}/${tokenId}`;
    setOpenseaUrl(generatedUrl);
    
    // If we have a handler function, call it
    onNFTMinted(tokenId, generatedUrl);
  };

  // Toggle between networks: mainnet, holesky, goerli
  const toggleNetwork = () => {
    const networks = ["mainnet", "holesky", "goerli"];
    const currentIndex = networks.indexOf(network);
    const nextIndex = (currentIndex + 1) % networks.length;
    const newNetwork = networks[nextIndex];
    
    setNetwork(newNetwork);
    toast.info(`Switched to ${newNetwork}`);
    
    // Update OpenSea URL if it exists
    if (openseaUrl) {
      const parts = openseaUrl.split('/');
      const contractAndToken = parts.slice(-2).join('/');
      
      const newBaseUrl = newNetwork === "mainnet" 
        ? "https://opensea.io/assets/ethereum"
        : newNetwork === "holesky"
          ? "https://testnets.opensea.io/assets/holesky"
          : "https://testnets.opensea.io/assets/goerli";
      
      setOpenseaUrl(`${newBaseUrl}/${contractAndToken}`);
    }
  };

  // Set manual transaction hash
  const handleManualTxHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualTxHash(e.target.value);
  };

  // Check if wallet is connected
  const isWalletConnected = !!walletAddress;

  // Don't render anything if there's no image or tokenURI
  if (!imageUrl && !tokenURI) {
    return null;
  }
  
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            <span className="gradient-text">Mint Your NFT</span>
          </h2>
          
          <Card className="p-6 bg-black/40 border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-2">
                <div className="aspect-square bg-black/50 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={imageUrl} 
                    alt="Artwork to mint" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nftName" className="block text-sm font-medium text-gray-300 mb-1">
                      NFT Name
                    </label>
                    <Input
                      id="nftName"
                      placeholder="Enter a name for your NFT"
                      value={nftName}
                      onChange={(e) => setNftName(e.target.value)}
                      className="bg-black/70 border-gray-700"
                      disabled={isMinting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="nftDescription" className="block text-sm font-medium text-gray-300 mb-1">
                      NFT Description
                    </label>
                    <Textarea
                      id="nftDescription"
                      placeholder="Describe your NFT"
                      value={nftDescription}
                      onChange={(e) => setNftDescription(e.target.value)}
                      className="h-24 bg-black/70 border-gray-700"
                      disabled={isMinting}
                    />
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-3">
                <h3 className="text-xl font-semibold mb-4">Mint Process</h3>
                
                <Tabs defaultValue="details" className="mb-6">
                  <TabsList className="grid grid-cols-2 bg-black/50">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="process">Process</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="p-4 bg-black/20 rounded-md mt-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-400">Network</p>
                          <div className="flex items-center gap-2">
                            <p>
                              {network === "mainnet" ? "Ethereum" : 
                               network === "holesky" ? "Holesky Testnet" : 
                               "Goerli Testnet"}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={toggleNetwork}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Gas Fee (Est.)</p>
                          <p>0.005 ETH</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Minting Fee</p>
                          <p>{network === "mainnet" ? "0.01 ETH" : "Free"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total</p>
                          <p className="font-bold">{network === "mainnet" ? "0.015 ETH" : "0.005 ETH"}</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-sm text-gray-400">Royalties</p>
                        <p>You'll receive 10% of future sales</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="process" className="p-4 bg-black/20 rounded-md mt-2">
                    <div className="space-y-6">
                      {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = currentStep === index;
                        const isComplete = currentStep > index;
                        
                        return (
                          <div key={index} className="flex items-center">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                                isComplete ? "bg-green-500" : isActive ? "bg-neon-purple animate-pulse" : "bg-gray-800"
                              }`}
                            >
                              {isActive && isMinting ? (
                                <Loader className="h-5 w-5 animate-spin text-white" />
                              ) : (
                                <StepIcon className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{step.label}</p>
                              {isComplete && (
                                <p className="text-sm text-green-400">Complete</p>
                              )}
                              {isActive && isMinting && (
                                <p className="text-sm text-neon-purple">In progress...</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {storageError && (
                        <div className="mt-2 py-2 px-3 bg-black/30 rounded border border-amber-800 bg-amber-950/30">
                          <p className="text-xs text-amber-400 mb-1">Storage Warning:</p>
                          <p className="text-sm text-amber-300">{storageError}</p>
                        </div>
                      )}
                      
                      {ipfsHash && (
                        <div className="mt-4 py-2 px-3 bg-black/30 rounded border border-gray-800">
                          <p className="text-xs text-gray-400 mb-1">Image IPFS Hash:</p>
                          <p className="text-sm font-mono text-gray-300 truncate">{ipfsHash}</p>
                          <a 
                            href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-neon-blue flex items-center mt-1 hover:underline"
                          >
                            View on IPFS <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      
                      {metadataHash && (
                        <div className="mt-2 py-2 px-3 bg-black/30 rounded border border-gray-800">
                          <p className="text-xs text-gray-400 mb-1">Metadata IPFS Hash:</p>
                          <p className="text-sm font-mono text-gray-300 truncate">{metadataHash}</p>
                          <a 
                            href={`https://gateway.pinata.cloud/ipfs/${metadataHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-neon-blue flex items-center mt-1 hover:underline"
                          >
                            View Metadata <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      
                      {/* Manual transaction hash input field when needed */}
                      {!txHash && isMinting && currentStep === 3 && (
                        <div className="mt-2 py-2 px-3 bg-black/30 rounded border border-amber-800">
                          <p className="text-xs text-amber-400 mb-1">Enter your transaction hash:</p>
                          <Input
                            placeholder="0x..."
                            value={manualTxHash || ""}
                            onChange={handleManualTxHashChange}
                            className="bg-black/70 border-amber-700 text-sm font-mono"
                          />
                          <p className="text-xs text-amber-300 mt-1">
                            Paste your transaction hash to track and complete the process.
                          </p>
                        </div>
                      )}
                      
                      {(txHash || manualTxHash) && (
                        <div className="mt-2 py-2 px-3 bg-black/30 rounded border border-gray-800">
                          <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
                          <p className="text-sm font-mono text-gray-300 truncate">{txHash || manualTxHash}</p>
                          <a 
                            href={
                              network === "mainnet" 
                                ? `https://etherscan.io/tx/${txHash || manualTxHash}` 
                                : network === "holesky"
                                  ? `https://holesky.etherscan.io/tx/${txHash || manualTxHash}`
                                  : `https://goerli.etherscan.io/tx/${txHash || manualTxHash}`
                            } 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-neon-blue flex items-center mt-1 hover:underline"
                          >
                            View on Etherscan <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      
                      {openseaUrl && (
                        <div className="mt-2 py-2 px-3 bg-black/30 rounded border border-gray-800">
                          <p className="text-xs text-gray-400 mb-1">OpenSea:</p>
                          <a 
                            href={openseaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-neon-blue flex items-center hover:underline"
                          >
                            View NFT on OpenSea <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      
                      {/* Complete process button - show if there's a transaction hash */}
                      {((txHash || manualTxHash) && currentStep === 3) && (
                        <div className="mt-4">
                          <Button
                            onClick={forceCompleteProcess}
                            className="w-full bg-amber-600 hover:bg-amber-700"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Complete Process
                          </Button>
                          <p className="text-xs text-amber-400 mt-1">
                            Your transaction is confirmed but the UI hasn't updated.
                            Click to complete the process.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                {!isWalletConnected ? (
                  <Button
                    onClick={handleConnectWallet}
                    className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 mt-4"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                ) : (
                  <Button
                    onClick={handleMint}
                    className="w-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink hover:opacity-90 mt-4"
                    disabled={isMinting || !nftName.trim() || !imageUrl || currentStep === 4}
                  >
                    {isMinting ? (
                      <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Minting...
                      </>
                    ) : currentStep === 4 ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Minted Successfully!
                      </>
                    ) : (
                      <>
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Mint NFT {network === "mainnet" ? "(0.015 ETH)" : "(Free + Gas)"}
                      </>
                    )}
                  </Button>
                )}
                
                {!isWalletConnected && (
                  <p className="text-sm text-amber-400 mt-2">Connect your wallet to mint NFT</p>
                )}
                
                {nftName.trim() === "" && isWalletConnected && (
                  <p className="text-sm text-amber-400 mt-2">Please enter a name for your NFT</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MintProcess;