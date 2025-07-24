# CryptoCause Deployment Guide

This guide covers deploying your CryptoCause dApp to both local and Internet Computer networks.

## Prerequisites

- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) >= 0.15.0
- [Node.js](https://nodejs.org/) >= 16.0.0
- Internet Computer wallet with cycles (for mainnet deployment)

## Local Deployment

### 1. Start Local Replica

```bash
# Start the local Internet Computer replica
dfx start --clean --background
```

### 2. Deploy Canisters

```bash
# Deploy all canisters to local network
dfx deploy --network local
```

This will:
- Deploy the donation canister
- Deploy the NFT canister  
- Build and deploy the frontend assets

### 3. View Canister IDs

```bash
# Check deployed canister IDs
dfx canister id donation_canister
dfx canister id nft_canister
dfx canister id charity_frontend
```

### 4. Access the Frontend

The frontend will be available at:
```
http://<frontend-canister-id>.localhost:4943
```

You can also find the exact URL in the deployment output.

## Testnet Deployment

### 1. Set Network to IC

```bash
# Switch to IC network
export DFX_NETWORK=ic
```

### 2. Check Identity and Wallet

```bash
# Check your identity
dfx identity whoami

# Check wallet balance
dfx wallet balance
```

### 3. Deploy to IC Testnet

```bash
# Deploy to Internet Computer
dfx deploy --network ic --with-cycles 1000000000000
```

## Mainnet Deployment

### 1. Prepare for Production

Update environment variables in your build:
```bash
# Create production environment file
cp .env.example .env
```

Edit `.env`:
```
DFX_NETWORK=ic
NODE_ENV=production
REACT_APP_IC_HOST=https://mainnet.dfinity.network
```

### 2. Add Cycles to Wallet

Ensure you have sufficient cycles:
```bash
# Check cycles balance
dfx wallet balance

# Add cycles if needed (minimum ~2T cycles recommended)
dfx ledger account-id
# Transfer ICP to this account, then:
dfx ledger create-canister <principal-id> --amount <icp-amount>
```

### 3. Deploy to Mainnet

```bash
# Deploy to mainnet
dfx deploy --network ic --with-cycles 2000000000000
```

### 4. Verify Deployment

```bash
# Check canister status
dfx canister status donation_canister --network ic
dfx canister status nft_canister --network ic
dfx canister status charity_frontend --network ic
```

## Post-Deployment Configuration

### 1. Update Canister IDs

After deployment, update the canister IDs in your canisters:

```motoko
// In donation_canister/main.mo
private let nftCanister: Principal = Principal.fromText("YOUR_NFT_CANISTER_ID");
```

```motoko
// In nft_canister/main.mo  
private let donationCanister: Principal = Principal.fromText("YOUR_DONATION_CANISTER_ID");
```

### 2. Set ckUSDT Canister ID

Update the ckUSDT canister ID in your environment:
```bash
# For mainnet, use the actual ckUSDT canister
CKUSDT_CANISTER_ID=xkbqi-6qaaa-aaaah-qbpqq-cai
```

### 3. Redeploy with Updated Configuration

```bash
dfx deploy --network ic
```

## Monitoring and Maintenance

### Check Canister Health

```bash
# Monitor canister status
dfx canister status --all --network ic

# Check cycles balance
dfx canister call <canister-id> wallet_balance --network ic
```

### Update Canisters

```bash
# Upgrade a specific canister
dfx canister install donation_canister --mode upgrade --network ic

# Upgrade all canisters
dfx deploy --network ic --upgrade-unchanged
```

### Backup Canister State

```bash
# Create snapshots of canister state
dfx canister call donation_canister getCampaigns --network ic > campaigns_backup.json
dfx canister call nft_canister getAllNFTs --network ic > nfts_backup.json
```

## Troubleshooting

### Common Issues

1. **Insufficient Cycles**
   ```bash
   # Add more cycles
   dfx canister deposit-cycles <amount> <canister-id> --network ic
   ```

2. **Canister Installation Failed**
   ```bash
   # Try installing with upgrade mode
   dfx canister install <canister-name> --mode reinstall --network ic
   ```

3. **Frontend Not Loading**
   - Check if assets canister has enough cycles
   - Verify asset synchronization:
   ```bash
   dfx canister call charity_frontend list_assets --network ic
   ```

4. **Inter-Canister Calls Failing**
   - Verify canister IDs are correctly set
   - Check canister permissions and access controls

### Performance Optimization

1. **Frontend Optimization**
   ```bash
   # Build optimized frontend
   npm run build
   dfx canister install charity_frontend --mode upgrade --network ic
   ```

2. **Canister Memory Management**
   - Monitor memory usage in canisters
   - Implement stable memory for large datasets
   - Use pagination for large queries

### Security Checklist

- [ ] Verify all canister IDs are correct
- [ ] Test all inter-canister calls
- [ ] Validate access controls and permissions
- [ ] Audit smart contract logic
- [ ] Test wallet integration thoroughly
- [ ] Verify ckUSDT integration works correctly

## Support

- **IC Documentation**: https://internetcomputer.org/docs/
- **DFX CLI Reference**: https://internetcomputer.org/docs/current/references/cli-reference/
- **Developer Forum**: https://forum.dfinity.org/
- **Discord**: https://discord.gg/internetcomputer
