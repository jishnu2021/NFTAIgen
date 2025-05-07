import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

const WalletButton = ({ onConnect, onDisconnect }: WalletButtonProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // Use just one provider declaration
      const provider = new Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request wallet connection
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
      setIsConnecting(false);

      if (onConnect) onConnect(address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    if (onDisconnect) onDisconnect();
    console.log("Wallet disconnected");
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative">
      {!walletAddress ? (
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-gradient-to-r from-neon-purple to-neon-pink hover:opacity-90 transition-all duration-300 animate-pulse-glow"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={disconnectWallet}
          className="border border-neon-purple/30 bg-background/50 hover:bg-neon-purple/10"
        >
          <span className="mr-1">🔵</span>
          {truncateAddress(walletAddress)}
        </Button>
      )}
    </div>
  );
};

export default WalletButton;