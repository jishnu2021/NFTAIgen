
import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import GeneratorSection from "@/components/GeneratorSection";
import MintProcess from "@/components/MintProcess";
import NFTGallery from "@/components/NFTGallery";
import { Toaster } from "sonner";

const Index = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [mintedNFT, setMintedNFT] = useState<{
    id: string;
    imageUrl: string;
    prompt: string;
  } | null>(null);

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress(null);
  };

  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    setGeneratedImage(imageUrl);
    setGeneratedPrompt(prompt);
    
    // Scroll to mint section
    setTimeout(() => {
      const mintSection = document.getElementById("mint-section");
      if (mintSection) {
        mintSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
  };

  const handleNFTMinted = (tokenId: string) => {
    setMintedNFT({
      id: tokenId,
      imageUrl: generatedImage || "",
      prompt: generatedPrompt || ""
    });
    
    // Scroll to gallery section
    setTimeout(() => {
      const gallerySection = document.getElementById("gallery-section");
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: "smooth" });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen relative">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold gradient-text">NFTAIgen</span>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="pt-20">
        {/* Hero Section */}
        <HeroSection 
          onWalletConnect={handleWalletConnect} 
          onWalletDisconnect={handleWalletDisconnect} 
        />
        
        {/* Generator Section */}
        <GeneratorSection 
          isWalletConnected={!!walletAddress}
          onImageGenerated={handleImageGenerated}
        />
        
        {/* Mint Process Section */}
        <div id="mint-section">
          <MintProcess 
            imageUrl={generatedImage}
            prompt={generatedPrompt}
            isWalletConnected={!!walletAddress}
            onNFTMinted={handleNFTMinted}
          />
        </div>
        
        {/* NFT Gallery Section */}
        <div id="gallery-section">
          <NFTGallery newNFT={mintedNFT || undefined} />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 NFTAIgen. All rights reserved.</p>
            <p className="mt-2">Built with React, AI, and Blockchain technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
