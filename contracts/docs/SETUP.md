# Setup Guide

How to set up everything before deploying.

## Prerequisites

Install these first:

```bash
# Check if you have them
node --version  # need v18+
forge --version
cargo --version

# Install if missing
curl -L https://foundry.paradigm.xyz | bash  # Foundry
foundryup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh  # Rust
```

## Wallet Setup

Create a new wallet or use existing one:

```bash
# Option 1: Generate new wallet
cast wallet new

# Option 2: Export from MetaMask
# Go to Account Details → Export Private Key
# Never commit private keys!
```

Save your private key somewhere safe (you'll need it for .env files).

## Get Testnet Tokens

**Celo Sepolia**
1. Go to https://faucet.celo.org
2. Select Sepolia Testnet
3. Enter your address and request CELO
4. Check balance: `cast balance YOUR_ADDRESS --rpc-url https://sepolia-forno.celo-testnet.org`

**Oasis Sapphire**
1. Go to https://faucet.testnet.oasis.io
2. Select Sapphire
3. Enter your address and request TEST tokens
4. Check balance: `cast balance YOUR_ADDRESS --rpc-url https://testnet.sapphire.oasis.io`

## Privy Setup

Privy handles gas sponsorship (important for the track).

1. Create account at https://dashboard.privy.io
2. Create new app called "Scholar-Fi"
3. Go to Settings → Basics and copy:
   - App ID (starts with `cl...`)
   - App Secret (keep private)

4. Enable gas sponsorship:
   - Settings → Transaction Management → Gas Sponsorship
   - Turn on "Native Gas Sponsorship"
   - Add Celo Sepolia chain
   - Set daily limit to $10

5. Enable embedded wallets:
   - Settings → Embedded Wallets
   - Turn ON
   - Select Celo Sepolia

Save the App ID and Secret for frontend later.

## Environment Files

**Celo contracts:**

```bash
cd contracts/celo
cp .env.example .env
```

Edit `celo/.env`:
```bash
PRIVATE_KEY=0x...  # Your wallet private key
CELO_RPC_URL=https://sepolia-forno.celo-testnet.org
CELOSCAN_API_KEY=...  # Get from celoscan.io/register
SELF_HUB_V2=0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74  # Don't change
```

**Oasis contracts:**

```bash
cd contracts/oasis
cp .env.example .env
```

Edit `oasis/.env`:
```bash
PRIVATE_KEY=0x...  # Same private key as Celo
SAPPHIRE_TESTNET_RPC=https://testnet.sapphire.oasis.io
SAPPHIRE_CHAIN_ID=23295
```

**ROFL service:**

```bash
cd contracts/rofl
touch .env
```

Edit `rofl/.env`:
```bash
CELO_RPC_URL=https://sepolia-forno.celo-testnet.org
SAPPHIRE_TESTNET_RPC=https://testnet.sapphire.oasis.io
SCHOLAR_FI_VAULT=0x...  # Fill after deploying
CHILD_DATA_STORE=0x...  # Fill after deploying
CHECK_INTERVAL=3600
```

## Install Dependencies

From `contracts/` folder:

```bash
make install
```

This installs everything (npm packages, forge dependencies, rust deps).

## Verify Setup

Build everything to make sure it works:

```bash
make build
```

Should see:
```
Building Celo contracts...
Compiler run successful!
Building Oasis contracts...
Compiler run successful!
Building ROFL service...
Finished release [optimized]
✓ All contracts compiled successfully
```

## Checklist

Before deploying:
- Got CELO tokens on Sepolia
- Got TEST tokens on Sapphire
- Created Privy account with gas sponsorship enabled
- Set up all .env files
- `make install` worked
- `make build` worked

## Troubleshooting

**"Insufficient funds"** - Get more tokens from faucets

**"Private key not found"** - Check .env files have `PRIVATE_KEY=0x...`

**"Forge not found"** - Run `foundryup`

**"Privy gas sponsorship not working"** - Check Privy dashboard that it's ON for Celo Sepolia

## Next Steps

Once setup is done, see [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy the contracts.
