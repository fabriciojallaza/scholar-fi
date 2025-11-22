# Scholar-Fi Smart Contracts

Education savings platform for kids with gasless transactions, age-gated access, and encrypted storage.

## What it does

Parents can create education savings accounts for their kids:

- Gasless transactions via Privy (users don't pay gas)
- Vaults unlock at 18 via Self passport verification
- Child data encrypted on Oasis Sapphire
- Vault funds can grow via Aave (simplified for hackathon)

## How it works

Frontend (Next.js + Privy) talks to contracts on two chains:
- Celo Alfajores: Main vault contract with Self age verification
- Oasis Sapphire: Encrypted child data storage
- ROFL service: Monitors vaults and updates growth (simplified TEE concept)

## Project structure

```
contracts/
├── celo/                  # Celo contracts (Foundry)
│   ├── src/ScholarFiVault.sol
│   └── script/Deploy.s.sol
├── oasis/                 # Oasis contracts (Foundry)
│   ├── src/ChildDataStore.sol
│   └── script/Deploy.s.sol
├── rofl/                  # Monitoring service (Rust)
│   └── src/main.rs
├── docs/                  # Setup and deployment docs
└── Makefile               # Build and deploy commands
```

## Quick start

Need Foundry, Rust, and Node.js installed first.

```bash
# Install dependencies
make install

# Build everything
make build

# Setup .env files
cp celo/.env.example celo/.env
cp oasis/.env.example oasis/.env
# Add your private key to both

# Get testnet tokens
# Celo: https://faucet.celo.org
# Oasis: https://faucet.testnet.oasis.io

# Deploy
make deploy-all
```

Dependencies aren't committed, so run `make install` after cloning.

## Docs

- [INSTALLATION.md](./docs/INSTALLATION.md) - Dependency setup
- [SETUP.md](./docs/SETUP.md) - Wallets and environment config
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment steps
- [TRACK_COMPLIANCE.md](./docs/TRACK_COMPLIANCE.md) - Track requirements

## ETHGlobal tracks

**Privy** - Native gas sponsorship for all transactions (create account, deposit, payments)

**Self** - Age verification on Celo. Vault unlocks at 18 via passport verification. Contract inherits `SelfVerificationRoot`.

**Oasis** - Confidential child data on Sapphire + ROFL monitoring service (simplified for hackathon)

## Contracts

### ScholarFiVault.sol (Celo)

Main vault with Self verification. Parents create accounts, deposits split 30% to locked vault / 70% to spending. Vault unlocks when kid verifies age 18+ via Self passport.

```solidity
contract ScholarFiVault is SelfVerificationRoot {
    function customVerificationHook(...) internal override {
        // Unlock vault when age ≥ 18
    }
}
```

### ChildDataStore.sol (Oasis Sapphire)

Encrypted storage for child info (name, DOB, email). Only parent can read. ROFL service can update vault growth. Data is automatically encrypted by Sapphire's TEE.

### ROFL Service (Rust)

Monitors vault balances on Celo, checks Aave APY, updates growth on Oasis. Simplified for hackathon - in production would run in TEE.

## Make commands

```bash
make install        # Install dependencies
make build          # Compile contracts
make deploy-celo    # Deploy to Celo
make deploy-oasis   # Deploy to Oasis
make deploy-all     # Deploy both
make test           # Run tests
make rofl           # Run monitoring service
```

## Networks

**Celo Alfajores**
- RPC: https://alfajores-forno.celo-testnet.org
- Chain ID: 44787
- Explorer: https://alfajores.celoscan.io
- Faucet: https://faucet.celo.org
- Self Hub V2: 0x68c931C9a534D37aa78094877F46fE46a49F1A51

**Oasis Sapphire Testnet**
- RPC: https://testnet.sapphire.oasis.io
- Chain ID: 23295
- Explorer: https://explorer.oasis.io/testnet/sapphire
- Faucet: https://faucet.testnet.oasis.io

## Links

- Self docs: https://docs.self.xyz
- Privy docs: https://docs.privy.io
- Oasis docs: https://docs.oasis.io
- Celo docs: https://docs.celo.org
