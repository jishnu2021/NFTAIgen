
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NFT, mockNFTs } from "@/utils/mock-data";
import { truncateAddress } from "@/lib/web3-utils";

interface NFTGalleryProps {
  newNFT?: {
    id: string;
    name: string;
    imageUrl: string;
    prompt: string;
  };
}

const NFTGallery = ({ newNFT }: NFTGalleryProps) => {
  const [activeTab, setActiveTab] = useState("all");
  
  // Add the newly minted NFT to the gallery if available
  const allNFTs = newNFT 
    ? [
        {
          id: newNFT.id,
          name: newNFT.name ||"Your New NFT",
          description: newNFT.prompt || "AI-generated artwork",
          imageUrl: newNFT.imageUrl,
          owner: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          mintedAt: new Date().toISOString().split("T")[0],
          price: "0.015 ETH"
        },
        ...mockNFTs
      ]
    : mockNFTs;

  const filteredNFTs = activeTab === "all" 
    ? allNFTs 
    : allNFTs.filter(nft => nft.owner === "0x71C7656EC7ab88b098defB751B7401B5f6d8976F");

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-neon-blue/20 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          <span className="gradient-text">NFT Gallery</span>
        </h2>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="max-w-5xl mx-auto mb-8"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="bg-black/50">
              <TabsTrigger value="all">All NFTs</TabsTrigger>
              <TabsTrigger value="owned">Your Collection</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all">
            <NFTGrid nfts={filteredNFTs} />
          </TabsContent>
          
          <TabsContent value="owned">
            <NFTGrid nfts={filteredNFTs} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

const NFTGrid = ({ nfts }: { nfts: NFT[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
      
      {nfts.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400 mb-4">No NFTs found in this collection</p>
          <Button>Create Your First NFT</Button>
        </div>
      )}
    </div>
  );
};

const NFTCard = ({ nft }: { nft: NFT }) => {
  return (
    <Card className="overflow-hidden border border-gray-800 bg-black/40 nft-card-hover transition-all duration-300">
      <div className="aspect-square overflow-hidden">
        <img 
          src={nft.imageUrl} 
          alt={nft.name} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold truncate">{nft.name}</h3>
          <span className="text-sm font-medium text-neon-purple">{nft.price}</span>
        </div>
        
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {nft.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Owned by {truncateAddress(nft.owner)}</span>
          <span>Minted {nft.mintedAt}</span>
        </div>
      </div>
    </Card>
  );
};

export default NFTGallery;
