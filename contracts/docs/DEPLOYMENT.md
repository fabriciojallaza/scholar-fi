# Deployment Guide

How to deploy contracts to testnets.

## Before You Start

Make sure you did the setup first (see [SETUP.md](./SETUP.md)):
- Got testnet tokens on both Celo and Oasis
- Set up .env files
- Ran `make install` and `make build`

## Deploy to Celo

Deploy ScholarFiVault contract:

```bash
cd contracts
make deploy-celo
```

You'll see something like:
```
ScholarFiVault: 0xABC...123
Self Hub V2: 0x68c931C9a534D37aa78094877F46fE46a49F1A51
Config ID: 0x7b64...7d61
```

Save the ScholarFiVault address - you'll need it later.

View on explorer: https://alfajores.celoscan.io/address/YOUR_ADDRESS

## Deploy to Oasis

Deploy ChildDataStore contract:

```bash
make deploy-oasis
```

You'll see:
```
ChildDataStore: 0xDEF...456
Owner: 0xYOUR_ADDRESS
```

Save the ChildDataStore address.

View on explorer: https://explorer.oasis.io/testnet/sapphire/address/YOUR_ADDRESS

## Deploy Both at Once

```bash
make deploy-all
```

This deploys to both chains in one go.

## Verify Contracts

**Celo (Celoscan):**

Get API key from https://celoscan.io/register first. Add it to `celo/.env`:
```bash
CELOSCAN_API_KEY=your_key_here
```

Then verify:
```bash
make verify-celo CONTRACT_ADDRESS=0xYOUR_VAULT_ADDRESS
```

Check it worked: https://alfajores.celoscan.io/address/YOUR_ADDRESS#code

**Oasis (Sourcify):**

```bash
cd oasis
forge verify-contract \
  0xYOUR_DATA_STORE_ADDRESS \
  src/ChildDataStore.sol:ChildDataStore \
  --verifier sourcify \
  --verifier-url https://sourcify.dev/server
```

## Set Up ROFL Service

Update `rofl/.env` with your deployed addresses:

```bash
SCHOLAR_FI_VAULT=0xABC...123  # Your Celo address
CHILD_DATA_STORE=0xDEF...456  # Your Oasis address
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
SAPPHIRE_TESTNET_RPC=https://testnet.sapphire.oasis.io
CHECK_INTERVAL=3600
```

Run it:
```bash
make rofl
```

## Test Deployment

**Create a child account on Celo:**
```bash
cast send 0xYOUR_VAULT_ADDRESS \
  "createChildAccount(address)" \
  0xCHILD_WALLET_ADDRESS \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY
```

**Deposit some funds:**
```bash
cast send 0xYOUR_VAULT_ADDRESS \
  "depositFunds(address)" \
  0xCHILD_WALLET_ADDRESS \
  --value 0.1ether \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY
```

Should split 30% to vault, 70% to spending.

**Create profile on Oasis:**
```bash
cast send 0xYOUR_DATA_STORE_ADDRESS \
  "createChildProfile(address,string,uint256,string)" \
  0xCHILD_WALLET_ADDRESS \
  "John Doe" \
  1640000000 \
  "parent@example.com" \
  --rpc-url https://testnet.sapphire.oasis.io \
  --private-key $PRIVATE_KEY
```

Data is automatically encrypted by Sapphire.

## Whitelist Institutions

Let educational institutions receive payments:

```bash
cast send 0xYOUR_VAULT_ADDRESS \
  "setWhitelistedInstitution(address,bool)" \
  0xINSTITUTION_ADDRESS \
  true \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY
```

## Troubleshooting

**"Transaction reverted"** - Check gas limit and function params

**"Nonce too low"** - Check current nonce with `cast nonce YOUR_ADDRESS --rpc-url ...`

**"Insufficient funds"** - Get more testnet tokens from faucets

**"Verification failed"** - Make sure API key is correct and constructor args match

## Summary

After deployment you'll have:
- ScholarFiVault on Celo: 0xABC...
- ChildDataStore on Oasis: 0xDEF...
- Self Hub V2 (existing): 0x68c931C9a534D37aa78094877F46fE46a49F1A51

Both verified and ready to use with Privy frontend.

## Quick Commands

```bash
make deploy-all                         # Deploy everything
make verify-celo CONTRACT_ADDRESS=0x... # Verify Celo contract
make rofl                               # Run monitoring service
```
