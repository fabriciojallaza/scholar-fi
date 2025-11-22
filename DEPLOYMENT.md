# Scholar-Fi Deployment Guide

## Prerequisites

1. Get testnet tokens:
   - **Base Sepolia**: https://www.coinbase.com/faucets/base-sepolia-faucet
   - **Celo Sepolia**: https://faucet.celo.org/celo-sepolia
   - **Oasis Sapphire**: https://faucet.testnet.oasis.io

2. API Keys:
   - Basescan API key: https://basescan.org/myapikey
   - Celoscan API key: https://celoscan.io/myapikey
   - Privy App ID: https://dashboard.privy.io

## Step 1: Configure Contracts

```bash
cd contracts
cp .env.example .env
```

Edit `contracts/.env` and fill in:
- `PRIVATE_KEY` - Your deployer wallet private key
- `BASESCAN_API_KEY` - For contract verification
- `CELOSCAN_API_KEY` - For contract verification

## Step 2: Build Contracts

```bash
cd contracts
make build
```

## Step 3: Deploy Contracts

### Deploy in Order (Circular Dependency)

```bash
# 1. Deploy Oasis datastore first
make deploy-oasis
# Copy the ChildDataStore address

# 2. Deploy Celo vault (use placeholder for Base bridge)
# Temporarily set BASE_BRIDGE_ADDRESS=0x0000000000000000000000000000000000000001 in .env
make deploy-celo
# Copy the ScholarFiVault address

# 3. Deploy Base bridge (use real Celo vault address)
# Update CELO_VAULT_ADDRESS in .env with address from step 2
make deploy-base
# Copy the ScholarFiBridge address

# 4. Redeploy Celo vault with real Base bridge address
# Update BASE_BRIDGE_ADDRESS in .env with address from step 3
make deploy-celo
```

### Update .env with Deployed Addresses

```env
BASE_BRIDGE_ADDRESS=0x...          # From step 3
CELO_VAULT_ADDRESS=0x...           # From step 4
OASIS_DATASTORE_ADDRESS=0x...      # From step 1
```

## Step 4: Verify Contracts

```bash
# Verify Base bridge
make verify-base CONTRACT_ADDRESS=<bridge_address> VAULT_ADDRESS=<vault_address>

# Verify Celo vault
make verify-celo CONTRACT_ADDRESS=<vault_address> BRIDGE_ADDRESS=<bridge_address>
```

## Step 5: Extract ABIs for Frontend

```bash
# ABIs are already extracted during build to frontend/src/abis/
# Verify they exist:
ls ../frontend/src/abis/
# Should show: ScholarFiBridge.json, ScholarFiVault.json, ChildDataStore.json
```

## Step 6: Configure Frontend

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_PRIVY_APP_ID=your_privy_app_id_here
VITE_BASE_BRIDGE_ADDRESS=0x...     # From contracts deployment
VITE_CELO_VAULT_ADDRESS=0x...      # From contracts deployment
VITE_OASIS_DATASTORE_ADDRESS=0x... # From contracts deployment
```

## Step 7: Configure Privy Gas Sponsorship

1. Go to https://dashboard.privy.io
2. Select your app
3. Navigate to **Settings** → **Gas Sponsorship**
4. Enable gas sponsorship for **Base Sepolia**
5. Add funds to sponsorship wallet

## Step 8: Run Frontend

```bash
cd frontend
npm install  # If not already installed
npm run dev
```

Visit http://localhost:3000

## Step 9: Test the Flow

### As a Parent:

1. **Connect Wallet**: Click "Connect Wallet" and authenticate with Privy
2. **Create Child Account**:
   - Click through onboarding steps
   - Enter child's name
   - Generate or paste child's wallet address
   - Sign transaction on Celo Sepolia (creates account on-chain)
3. **Add Funds**:
   - Go to "Add Funds" from dashboard
   - Enter child's wallet address
   - Enter deposit amount (e.g., 0.01 ETH)
   - Click "Deposit" - transaction is gasless via Privy!
   - Track Hyperlane message delivery
4. **Verify Deposit**:
   - Check Hyperlane Explorer for message status
   - Verify funds split 30/70 on Celo vault

### As a Child (Age 18+):

1. **Self Verification**:
   - Download Self mobile app
   - Complete identity verification
   - Scan QR code from Scholar-Fi
   - Submit ZK proof of age 18+
2. **Vault Unlock**:
   - Vault funds automatically transfer to spending balance
   - Check updated balances in wallet

## Step 10: Configure ROFL (Optional)

```bash
cd contracts/rofl
cp .env.example .env
```

Edit `rofl/.env` with deployed addresses, then:
```bash
cargo run --release
```

## Troubleshooting

### "Insufficient funds" Error
- Ensure you have enough testnet tokens for deployment + gas
- Get more from faucets listed above

### "AccountAlreadyExists" Error
- Child wallet already has an account
- Use a different wallet address or check existing account

### Privy Blank Screen
- Verify `VITE_PRIVY_APP_ID` is correctly set in `.env`
- Privy App ID should start with "cl"
- Restart dev server after changing .env

### Hyperlane Message Not Delivered
- Check Hyperlane Explorer: https://explorer.hyperlane.xyz
- Relayers may take 1-5 minutes
- Ensure sufficient native gas was sent for fees

### Self Verification Not Working
- Verify you're on Celo Sepolia (chain ID 11142220)
- Check Self Hub V2 address: `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74`
- Ensure vault contract is deployed correctly

## Important Addresses

### Base Sepolia
- Hyperlane Mailbox: `0x6966b0E55883d49BFB24539356a2f8A673E02039`
- Domain: `84532`

### Celo Sepolia
- Hyperlane Mailbox: `0xD0680F80F4f947968206806C2598Cbc5b6FE5b03`
- Self Hub V2: `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74`
- Domain: `11142220`

### Oasis Sapphire Testnet
- Chain ID: `23295`

## Track Requirements Checklist

- [ ] **Hyperlane**: Cross-chain messaging from Base → Celo
- [ ] **Self Protocol**: Age verification (18+) on Celo
- [ ] **Privy**: Gas sponsorship on Base Sepolia
- [ ] **Oasis**: Confidential storage of child profiles

All four sponsor technologies are integrated! 🎉
