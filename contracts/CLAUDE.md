# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scholar-Fi is an educational savings platform built for ETHGlobal hackathon. It deploys smart contracts across three chains (Base Sepolia, Celo Sepolia, and Oasis Sapphire) with a Rust monitoring service, integrating four sponsor technologies:

- **Privy**: Gas sponsorship on Base Sepolia (frontend integration)
- **Self Protocol**: On-chain age verification at 18 via ZK passport proofs on Celo
- **Oasis**: Confidential child data storage + ROFL monitoring
- **Hyperlane**: Cross-chain messaging between Base and Celo

## Build Commands

All commands run from `contracts/` directory:

```bash
make install       # Install all dependencies (checks for Node.js, Foundry, Rust)
make build         # Compile Base + Celo + Oasis contracts and ROFL service
make test          # Run Foundry tests for all chains
make deploy-base   # Deploy ScholarFiBridge to Base Sepolia
make deploy-celo   # Deploy ScholarFiVault to Celo Sepolia
make deploy-oasis  # Deploy ChildDataStore to Oasis Sapphire
make deploy-all    # Deploy to all 3 chains sequentially
make verify-base CONTRACT_ADDRESS=0x... VAULT_ADDRESS=0x...  # Verify on Basescan
make verify-celo CONTRACT_ADDRESS=0x... BRIDGE_ADDRESS=0x...  # Verify on Celoscan
make rofl          # Run ROFL monitoring service
make clean         # Clean all build artifacts
```

Dependencies are NOT committed - always run `make install` after cloning.

## Architecture

### Multi-Chain Design

```
Base Sepolia (ScholarFiBridge)
├─ Parent deposits funds (Privy gas sponsorship)
├─ Hyperlane dispatch to Celo Sepolia
└─ Native token transfer via msg.value

    ↓ Hyperlane Messaging

Celo Sepolia (ScholarFiVault)
├─ Receives deposits via Hyperlane handle()
├─ Parent creates child accounts
├─ Deposits split 30% vault / 70% spending
├─ Self Protocol verifies age 18+
└─ Vault unlocks when verified

Oasis Sapphire (ChildDataStore)
├─ Encrypted child profiles (TEE-backed)
├─ Parent-only access control
└─ ROFL updates vault growth

ROFL Service (Rust)
├─ Monitors Celo vault balances
├─ Fetches Aave APY (simulated)
└─ Updates Oasis with growth data
```

### Key Integration Points

**Hyperlane Cross-Chain Messaging** (`base/src/ScholarFiBridge.sol` → `celo/src/ScholarFiVault.sol`):
- Base bridge uses `IMailbox.dispatch()` to send messages
- Celo vault implements `handle()` to receive messages
- TypeCasts library for bytes32 ↔ address conversion
- Base Sepolia Mailbox: `0x6966b0E55883d49BFB24539356a2f8A673E02039`
- Celo Sepolia Mailbox: `0xD0680F80F4f947968206806C2598Cbc5b6FE5b03`
- Base Sepolia Domain: 84532
- Celo Sepolia Domain: 11142220

**Self Protocol Integration** (`celo/src/ScholarFiVault.sol`):
- Inherits `SelfVerificationRoot` abstract contract
- Constructor registers age verification config (18+) with Self Hub V2
- `customVerificationHook()` triggers on successful ZK proof verification
- Vault unlock: Moves funds from `vaultBalance` to `spendingBalance`
- Self Hub V2 address on Celo Sepolia: `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74`

**Oasis Confidential Storage** (`oasis/src/ChildDataStore.sol`):
- All struct fields automatically encrypted by Sapphire's TEE
- Access control enforced via `onlyParent` and `onlyROFL` modifiers
- No explicit encryption code needed - handled by Sapphire runtime

**Privy Gas Sponsorship**:
- Frontend integration for Base Sepolia deposits
- Configure in Privy dashboard: Enable gas sponsorship for Base Sepolia
- Deposit transactions are gasless for users

### Important Constraints

1. **Self Protocol**: Must use Celo mainnet or testnet only (currently Sepolia)
2. **Privy Gas Sponsorship**: Only supports Base Sepolia, Arbitrum Sepolia, OP Sepolia (not Celo)
3. **Solidity Versions**:
   - Base: `0.8.24` (Hyperlane compatibility)
   - Celo: `0.8.28` (required for Self SDK compatibility)
   - Oasis: `^0.8.0` (flexible)
4. **Deposit Split**: Hardcoded 30/70 ratio in `ScholarFiVault.sol:59-60`
5. **Scope Seed**: Set to `"scholar-fi-v1"` in deployment script - max 31 ASCII bytes
6. **Deployment Order**: Deploy Base bridge → Deploy Celo vault (needs Base address) → Redeploy Base (needs Celo address)

## Environment Setup

Each folder needs `.env` (copy from `.env.example`):

**Base** (`base/.env`):
- `PRIVATE_KEY` - Deployer wallet
- `BASE_SEPOLIA_RPC` - Default: https://sepolia.base.org
- `HYPERLANE_MAILBOX` - `0x6966b0E55883d49BFB24539356a2f8A673E02039`
- `CELO_DOMAIN` - `11142220`
- `SCHOLAR_FI_VAULT_CELO` - Fill after Celo deployment
- `BASESCAN_API_KEY` - For contract verification

**Celo** (`celo/.env`):
- `PRIVATE_KEY` - Deployer wallet
- `CELO_RPC_URL` - Default: https://celo-sepolia-rpc.publicnode.com
- `SELF_HUB_V2` - `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74` (DO NOT CHANGE)
- `HYPERLANE_MAILBOX` - `0xD0680F80F4f947968206806C2598Cbc5b6FE5b03`
- `BASE_BRIDGE_ADDRESS` - Fill after Base deployment
- `CELOSCAN_API_KEY` - For contract verification

**Oasis** (`oasis/.env`):
- `PRIVATE_KEY` - Same as Celo/Base
- `SAPPHIRE_TESTNET_RPC` - Default: https://testnet.sapphire.oasis.io

**ROFL** (`rofl/.env`):
- Contract addresses (fill after deployment)
- RPC endpoints for all chains

## Testing

Foundry tests located in:
- `base/test/` - ScholarFiBridge tests
- `celo/test/` - ScholarFiVault tests
- `oasis/test/` - ChildDataStore tests

Run individual tests:
```bash
cd base && forge test --match-contract TestName
cd celo && forge test --match-test testFunctionName -vvv  # verbose output
```

## Cross-Platform Notes

Makefile automatically detects OS:
- **Windows**: Uses `where` command for checks
- **Mac/Linux**: Uses `command -v` for checks

All `cd` commands use `@cd folder &&` pattern to ensure Windows compatibility.

## Network Details

**Base Sepolia Testnet** (Chain ID: 84532, Domain: 84532)
- Faucet: https://www.coinbase.com/faucets/base-sepolia-faucet
- Explorer: https://sepolia.basescan.org
- Hyperlane Mailbox: `0x6966b0E55883d49BFB24539356a2f8A673E02039`

**Celo Sepolia Testnet** (Chain ID: 11142220, Domain: 11142220)
- Faucet: https://faucet.celo.org/celo-sepolia
- Explorer: https://sepolia.celoscan.io
- Self Hub V2: `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74`
- Hyperlane Mailbox: `0xD0680F80F4f947968206806C2598Cbc5b6FE5b03`

**Oasis Sapphire Testnet** (Chain ID: 23295)
- Faucet: https://faucet.testnet.oasis.io
- Explorer: https://explorer.oasis.io/testnet/sapphire

## Deployment Flow

1. Get testnet tokens from faucets (Base, Celo, Oasis)
2. Configure `.env` files for all chains
3. Deploy Base bridge first (without Celo vault address)
4. Deploy Celo vault (use Base bridge address from step 3)
5. Update Base `.env` with Celo vault address and redeploy Base bridge
6. Deploy Oasis data store
7. Update `rofl/.env` with all contract addresses
8. Verify contracts:
   - `make verify-base CONTRACT_ADDRESS=0x... VAULT_ADDRESS=0x...`
   - `make verify-celo CONTRACT_ADDRESS=0x... BRIDGE_ADDRESS=0x...`

## Documentation

- `docs/INSTALLATION.md` - Dependency setup
- `docs/SETUP.md` - Wallet, tokens, Privy config
- `docs/DEPLOYMENT.md` - Deployment steps
- `docs/TRACK_COMPLIANCE.md` - ETHGlobal track requirements proof

## Common Issues

**"cargo: command not found"**: Run `make install` which checks prerequisites and shows install instructions

**Makefile fails on Windows**: Ensure using GNU Make (not NMAKE). Install via Chocolatey: `choco install make`

**Self verification fails**: Check Self Hub V2 address matches Celo Sepolia deployment (`0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74`)

**Oasis encryption not working**: Ensure deploying to Sapphire testnet (not regular Oasis). TEE encryption is automatic on Sapphire.

**Hyperlane message not delivered**: Check that Hyperlane Mailbox addresses are correct for both Base and Celo Sepolia testnets. Ensure sufficient native token sent for fees.

**Circular deployment dependency**: Deploy Base first with placeholder Celo address, then Celo with real Base address, then redeploy Base with real Celo address.
