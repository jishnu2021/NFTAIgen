# NFTAIgen: AI-Generated NFT Art


## Overview

NFTAIgen is a decentralized platform where art and artificial intelligence converge on the blockchain. Users can create unique AI-generated artwork and mint it directly as NFTs on the Ethereum blockchain. The platform incorporates state-of-the-art generative AI models to transform text prompts into stunning visual art, preserving provenance, ownership, and creative rights through blockchain technology.

## Features

- **Connect & Create**: Seamlessly connect your Web3 wallet and generate unique artwork through AI
- **Text-to-Art Generation**: Transform your ideas into visual masterpieces using cutting-edge AI models
- **One-Click Minting**: Instantly mint your generated artwork as NFTs on Ethereum
- **Multi-Network Support**: Deploy on Ethereum mainnet or Sepolia testnet or holesky testnet
- **Decentralized Storage**: All artwork permanently stored on IPFS(pinata)
- **Artist Royalties**: Smart contracts ensure creators receive royalties on secondary sales
- **Transaction Tracking**: Real-time updates on minting status
- **OpenSea Integration**: Direct links to view your NFTs on OpenSea marketplace
- **Gas-Efficient Contracts**: Optimized smart contracts to minimize transaction fees

## Technical Architecture

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- ethers.js for blockchain interactions
- Web3Modal for wallet connections

### Backend
- Flask API (app.py) for AI image generation
- Integration with Stable Diffusion and/or DALL·E models
- IPFS integration for decentralized storage

### Blockchain
- Solidity smart contracts
- Hardhat development environment
- OpenZeppelin contract standards
- ERC-721 for NFT implementation

## Smart Contract Functions

The core NFT contract includes:
- Minting functions with metadata linking
- Royalty mechanisms (ERC-2981)
- Access control for admin functions
- Metadata URI management

## Installation

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- Hardhat
- MetaMask or other Web3 wallet
- API keys for AI models (if using external APIs)

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/jishnu2021/NFTAIgen.git
cd NFTAIgen
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Install blockchain dependencies:
```bash
cd ../blockchain
npm install
```

5. Configure environment variables:
   - Create `.env` files in each directory following the `.env.example` templates
   - Add your API keys, IPFS credentials, and blockchain provider URLs

## Development

### Run Frontend Locally
```bash
cd frontend
npm start
```

### Run Backend API
```bash
cd backend
python app.py
```

### Deploy Smart Contracts
```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## Testing

### Smart Contract Tests
```bash
cd blockchain
npx hardhat test
```

### Frontend Tests
```bash
cd dream-mint-canvas
npm test
```

### Backend Tests
```bash
cd Serverside
pytest
```

## Deployment

### Frontend Deployment
The frontend can be deployed to Vercel, Netlify, or any static site hosting:
```bash
cd frontend
npm run build
```

### Backend Deployment
The AI generation API can be deployed to:
- AWS Lambda
- Google Cloud Functions
- Heroku

### Smart Contract Deployment
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network holesky
```

## Project Structure

```
AIMINTGEN/
├── dream-mint-canvas/           # React application
│   ├── public/         # Static assets
│   ├── src/            # Source files
│   │   ├── components/ # UI components
│   │   ├── contexts/   # React contexts
│   │   ├── hooks/      # Custom hooks
│   │   ├── pages/      # Page components
│   │   ├── services/   # API and blockchain services
│   │   └── utils/      # Utility functions
│   └── ...
├── Serverside/            # Flask API for AI generation
│   ├── app.py          # Main API application
│   ├── models/         # AI model integrations
│   ├── utils/          # Utility functions
│   └── ...
├── blockchain/         # Smart contracts and deployment scripts
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deployment and interaction scripts
│   ├── test/           # Contract tests
│   └── ...
└── ...
```

## Troubleshooting

### Common Issues

#### NFTs Not Appearing on OpenSea
- Ensure you're looking at the correct network on OpenSea
- OpenSea indexing can take up to 30 minutes
- Verify your contract is properly verified on Etherscan

#### Transaction Failures
- Check gas price and limits
- Ensure wallet has sufficient funds
- Verify contract addresses are correct

#### Image Generation Issues
- Check API keys and quotas
- Ensure proper CORS configuration
- Verify input prompt meets requirements


## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

