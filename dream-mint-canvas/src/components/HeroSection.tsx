
import { motion } from "framer-motion";
import WalletButton from "./WalletButton";
import { useEffect, useState } from "react";

interface HeroSectionProps {
  onWalletConnect: (address: string) => void;
  onWalletDisconnect: () => void;
}

const HeroSection = ({ onWalletConnect, onWalletDisconnect }: HeroSectionProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative w-full py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-purple/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text">
              AI-Generated NFT Art
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl"
          >
            Create unique AI-generated artwork, mint it as NFTs, and showcase your digital collection on the blockchain.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <WalletButton 
              onConnect={onWalletConnect} 
              onDisconnect={onWalletDisconnect} 
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex gap-8 text-sm text-gray-400"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white mb-1">500+</span>
              <span>Artworks Created</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white mb-1">250+</span>
              <span>NFTs Minted</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white mb-1">100+</span>
              <span>Artists</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
