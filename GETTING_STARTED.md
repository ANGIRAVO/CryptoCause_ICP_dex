# 🚀 Getting Started with CharityChain

Welcome to CryptoCause - your Web3 charity donation platform on ICP! This guide will get you up and running in minutes.

## 📋 Prerequisites

Before you begin, make sure you have:

- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) >= 0.15.0
- [Node.js](https://nodejs.org/) >= 16.0.0
- A code editor (VS Code recommended)

## 🏃‍♂️ Quick Start

### 1. Verify Installation

```bash
# Check if everything is installed
dfx --version
node --version
npm --version
```

### 2. Start Local Development

```bash
# Start the local Internet Computer replica
dfx start --clean --background
```

This will start a local ICP network on `http://127.0.0.1:4943`

### 3. Deploy the Canisters

```bash
# Deploy all canisters (donation, NFT, and frontend)
dfx deploy --network local
```

You should see output like:
```
Deployed canisters.
URLs:
  Frontend canister via browser
    charity_frontend: http://127.0.0.1:4943/?canisterId=<frontend-canister-id>
  Backend canister via Candid interface:
    donation_canister: http://127.0.0.1:4943/?canisterId=<candid-ui-id>&id=<donation-canister-id>
    nft_canister: http://127.0.0.1:4943/?canisterId=<candid-ui-id>&id=<nft-canister-id>
```

### 4. Access Your dApp

Open your browser and navigate to the frontend URL provided in the deployment output. You should see:

- 🏠 **Homepage** with platform statistics
- 📊 **Campaign listings** (initially empty)
- 🔗 **Wallet connection** button in the top right

## 🎯 First Steps

### 1. Connect Your Wallet

1. Click "Connect Wallet" in the top navigation
2. Choose Internet Identity (recommended for local development)
3. Create a new Internet Identity if you don't have one
4. Authorize the connection

### 2. Create Your First Campaign

1. Navigate to "Create Campaign" 
2. Fill in the campaign details:
   - **Campaign ID**: A unique identifier (e.g., "help-school-2024")
   - **Title**: "Help Build a School Library"
   - **Description**: Detailed explanation of your cause
   - **Target Amount**: 1000 (in ckUSDT, with 6 decimals = 1,000,000)
   - **End Date**: Optional deadline

3. Click "Create Campaign"

### 3. Make Your First Donation

1. Browse to the campaign you created
2. Enter a donation amount (e.g., 10 ckUSDT)
3. Click "Donate Now"
4. Confirm the transaction
5. Receive your NFT receipt!

## 🛠️ Development Workflow

### Frontend Development

```bash
# Start the development server with hot reload
npm run serve
```

The frontend will be available at `http://localhost:3000` with hot reload enabled.

### Backend Development

When you modify the Motoko canisters:

```bash
# Redeploy canisters after changes
dfx deploy --network local

# Or deploy a specific canister
dfx deploy donation_canister --network local
```

### Testing Canister Functions

Use the Candid UI to test canister functions directly:

```bash
# Get the Candid UI URL
echo "http://127.0.0.1:4943/?canisterId=$(dfx canister id __Candid_UI)&id=$(dfx canister id donation_canister)"
```

## 🔍 Exploring the Code

### Key Files Structure

```
charity-dapp-icp/
├── src/
│   ├── donation_canister/main.mo      # Main donation logic
│   ├── nft_canister/main.mo           # NFT receipt system
│   └── charity_frontend/
│       ├── src/
│       │   ├── components/            # UI components
│       │   ├── pages/                 # Page components
│       │   ├── contexts/              # React contexts
│       │   └── services/              # API services
│       └── public/
├── dfx.json                           # ICP configuration
└── package.json                       # Dependencies
```

### Understanding the Architecture

1. **Donation Canister** (`src/donation_canister/main.mo`):
   - Manages campaigns and donations
   - Handles fund withdrawals
   - Provides statistics

2. **NFT Canister** (`src/nft_canister/main.mo`):
   - Mints NFT receipts for donations
   - Manages NFT ownership and transfers
   - ICRC-721 compliant

3. **Frontend** (`src/charity_frontend/`):
   - React + TypeScript application
   - Wallet integration via Internet Identity
   - Real-time updates from canisters

## 🎨 Customization

### Updating the UI

- **Colors**: Edit `tailwind.config.js` to change the color scheme
- **Components**: Modify files in `src/charity_frontend/src/components/`
- **Pages**: Update page layouts in `src/charity_frontend/src/pages/`

### Adding Features

- **New Canister Functions**: Add to `src/donation_canister/main.mo`
- **Frontend Integration**: Update services in `src/charity_frontend/src/services/`
- **UI Components**: Create new components in `src/charity_frontend/src/components/`

## 🌐 Going to Production

### Deploy to IC Mainnet

1. **Get Cycles**: You'll need ICP tokens to convert to cycles
   ```bash
   dfx ledger account-id
   # Send ICP to this address, then:
   dfx ledger create-canister <principal> --amount <icp-amount>
   ```

2. **Deploy to Mainnet**:
   ```bash
   dfx deploy --network ic --with-cycles 2000000000000
   ```

3. **Update Configuration**:
   - Set production canister IDs in your code
   - Update environment variables
   - Configure ckUSDT canister ID for mainnet

## 🆘 Troubleshooting

### Common Issues

**"Cannot find module" errors:**
```bash
npm install --legacy-peer-deps
```

**"Port already in use":**
```bash
dfx stop
dfx start --clean --background
```

**Canister installation failed:**
```bash
dfx canister install <canister-name> --mode reinstall --network local
```

**Frontend not loading:**
- Check if all canisters are deployed
- Verify frontend assets are built: `npm run build`

## 📚 Next Steps

1. **Read the Documentation**: Check out `README.md` and `DEPLOYMENT.md`
2. **Explore Examples**: Look at the sample data and test functions
3. **Join the Community**: 
   - [Internet Computer Discord](https://discord.gg/internetcomputer)
   - [Developer Forum](https://forum.dfinity.org)
4. **Build Your Features**: Start customizing for your specific use case!

## 🤝 Need Help?

- **Documentation**: [Internet Computer Docs](https://internetcomputer.org/docs/)
- **Motoko Guide**: [Motoko Programming Language](https://internetcomputer.org/docs/current/developer-docs/backend/motoko/)
- **DFX Reference**: [DFX CLI Commands](https://internetcomputer.org/docs/current/references/cli-reference/)

---

**Happy Building! 🎉**

Your charity platform is ready to make a positive impact on the world through transparent, blockchain-powered donations.
