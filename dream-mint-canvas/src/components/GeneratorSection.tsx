import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader, Sparkles, Image as ImageIcon, CheckCircle, Link, Download } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const GeneratorSection = ({ isWalletConnected, onImageGenerated }) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [tokenURI, setTokenURI] = useState(null);
  const [localImageData, setLocalImageData] = useState(null);

  // Your Pinata API credentials
  const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYzYxMGM5OS0yMmQ3LTQxODktYWRjZC0zMzRmYjVkOGNmOWMiLCJlbWFpbCI6Imppc2hudWdob3NoMjAyM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMWI5ZDgzZDE1NzE1ZjQ0MTY0OWMiLCJzY29wZWRLZXlTZWNyZXQiOiJiNzQzNTUwZmQ4N2Y0ODBhZWFjNDIwMDE1MmQ3YTI0NDNlYjZhY2NjMmNhYWQ1ZTJkZjQyMGM1ODI5NWI3MjE0IiwiZXhwIjoxNzc4MDkxODg5fQ.s2BXFllCUKnSC8dZs9erp-fq61QeikTFb_u9Pta4L0Y";

  // Function to handle image generation and saving it locally
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }

    if (!isWalletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsGenerating(true);
    toast.info("Generating your artwork...", { duration: 3000 });

    try {
      // Make a POST request to the Flask API
      const response = await axios.post("https://nftaigenbackend.onrender.com/generate-image", {
        prompt,
      });

      const imageUrl = response.data.image_url;
      setGeneratedImage(imageUrl);

      // Proxy the image through the backend to avoid CORS issues
      try {
        // Make a request to a backend proxy endpoint that will fetch the image for us
        const proxyResponse = await axios.post("https://nftaigenbackend.onrender.com/proxy-image", {
          image_url: imageUrl
        }, {
          responseType: 'arraybuffer'  // Important for binary data like images
        });
        
        // Convert the binary data to a base64 string
        const base64Data = btoa(
          new Uint8Array(proxyResponse.data)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        const dataUrl = `data:image/png;base64,${base64Data}`;
        setLocalImageData(dataUrl);
      } catch (proxyError) {
        console.error("Error proxying image:", proxyError);
        toast.error("Couldn't save image locally, but you can still see it and try uploading");
      }

      // Pass the image URL to the parent component
      onImageGenerated(imageUrl, prompt);
      toast.success("Artwork generated successfully!");
    } catch (error) {
      console.error("Error generating art:", error.response?.data || error.message || error);
      toast.error("Failed to generate artwork. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to handle uploading image to IPFS
  const uploadToIPFS = async () => {
    try {
      if (!generatedImage && !localImageData) {
        toast.error("No image data available to upload");
        return;
      }

      setIsUploading(true);
      toast.info("Uploading to IPFS...");

      // Create a FormData object for the file
      const formData = new FormData();
      
      if (localImageData) {
        // If we have locally stored image data, use that
        const byteCharacters = atob(localImageData.split(',')[1]);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: 'image/png' });
        const file = new File([blob], 'artwork.png', { type: 'image/png' });
        formData.append('file', file);
      } else {
        // If we don't have local data, proxy the image through our backend
        try {
          // Make a request to a backend proxy endpoint that will fetch the image
          const proxyResponse = await axios.post("https://nftaigenbackend.onrender.com/proxy-image", {
            image_url: generatedImage
          }, {
            responseType: 'arraybuffer'  // Important for binary data like images
          });
          
          const blob = new Blob([proxyResponse.data], { type: 'image/png' });
          const file = new File([blob], 'artwork.png', { type: 'image/png' });
          formData.append('file', file);
        } catch (proxyError) {
          console.error("Error proxying image for upload:", proxyError);
          toast.error("Failed to retrieve the image for upload");
          setIsUploading(false);
          return;
        }
      }
      
      // Upload image to Pinata
      const imageUploadResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            'Authorization': `Bearer ${PINATA_JWT}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const imageCID = imageUploadResponse.data.IpfsHash;
      
      // Create metadata JSON
      const metadataJSON = {
        name: `AI Generated Artwork: ${prompt.substring(0, 30)}...`,
        description: prompt,
        image: `ipfs://${imageCID}`,
        attributes: [
          {
            trait_type: "Generator",
            value: "AI Art Generator"
          },
          {
            trait_type: "Creation Date",
            value: new Date().toISOString()
          }
        ]
      };
      
      // Upload metadata to Pinata
      const metadataUploadResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadataJSON,
        {
          headers: {
            'Authorization': `Bearer ${PINATA_JWT}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const metadataCID = metadataUploadResponse.data.IpfsHash;
      
      // Set IPFS hash and token URI
      setIpfsHash(imageCID);
      const fullTokenURI = `ipfs://${metadataCID}`;
      setTokenURI(fullTokenURI);
      
      // Log tokenURI to console as requested
      console.log("TokenURI for NFT:", fullTokenURI);
      
      // Pass the tokenURI to the parent component along with the local image data
      onImageGenerated(localImageData || generatedImage, prompt, fullTokenURI, imageCID);
      
      toast.success("Successfully uploaded to IPFS!");
      return { imageCID, metadataCID };
    } catch (error) {
      console.error("Error uploading to IPFS:", error.response?.data || error.message || error);
      toast.error("Failed to upload to IPFS. Check console for details.");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const testPinataConnection = async () => {
    try {
      const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`
        }
      });
      
      toast.success('Pinata connection successful!');
      console.log('Pinata authentication successful:', response.data);
    } catch (error) {
      toast.error('Pinata connection failed. Check your JWT token.');
      console.error('Pinata authentication failed:', error.response?.data || error.message || error);
    }
  };

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-neon-pink/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            <span className="gradient-text">Create Your AI Artwork</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Card className="p-6 bg-black/40 border border-gray-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-neon-purple" />
                  Describe Your Vision
                </h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">
                      Prompt
                    </label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe the artwork you want to create... (e.g., 'cyberpunk cat in space with neon lights')"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="h-32 bg-black/70 border-gray-700 focus:border-neon-purple"
                      disabled={isGenerating || isUploading}
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    className="w-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink hover:opacity-90"
                    disabled={isGenerating || isUploading || !prompt.trim() || !isWalletConnected}
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Artwork
                      </>
                    )}
                  </Button>

                  {!isWalletConnected && (
                    <p className="text-sm text-red-400">Connect your wallet to generate artwork</p>
                  )}
                  
                  {(generatedImage || localImageData) && (
                    <Button
                      onClick={uploadToIPFS}
                      className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:opacity-90"
                      disabled={isUploading || (!generatedImage && !localImageData)}
                    >
                      {isUploading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Uploading to IPFS...
                        </>
                      ) : (
                        <>
                          <Link className="mr-2 h-4 w-4" />
                          Upload to IPFS
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    onClick={testPinataConnection}
                    className="w-full bg-gray-600 hover:bg-gray-700"
                    size="sm"
                  >
                    Test Pinata Connection
                  </Button>
                </div>
              </Card>
              
              {tokenURI && (
                <Card className="p-6 bg-black/40 border border-gray-800">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Link className="w-5 h-5 mr-2 text-neon-purple" />
                    NFT Information
                  </h3>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-300">IPFS Image(metadata):</p>
                      <p className="text-xs text-gray-400 break-all">https://pink-geographical-tarsier-269.mypinata.cloud/ipfs/{ipfsHash}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-300">Token URI:</p>
                      <p className="text-xs text-gray-400 break-all">{tokenURI}</p>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-800">
                      <p className="text-sm text-green-400 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Ready for NFT minting
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="md:col-span-3">
              <Card className="p-6 bg-black/40 border border-gray-800 h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-neon-purple" />
                  Preview
                </h3>

                <div className="flex-1 flex items-center justify-center bg-black/50 rounded-lg overflow-hidden">
                  {localImageData ? (
                    <img
                      src={localImageData}
                      alt="Generated artwork"
                      className="w-full h-full object-contain max-h-80"
                    />
                  ) : generatedImage ? (
                    <img
                      src={generatedImage}
                      alt="Generated artwork"
                      className="w-full h-full object-contain max-h-80"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <ImageIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-500">
                        Your generated artwork will appear here
                      </p>
                    </div>
                  )}
                </div>
                
                {ipfsHash && (
                  <div className="mt-4 p-3 bg-green-900/20 border border-green-900 rounded-md">
                    <p className="text-sm text-green-400 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Uploaded to IPFS successfully
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeneratorSection;