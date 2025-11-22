# Scholar-Fi

Educational savings accounts for kids, built on three chains with some actually useful privacy and verification features.

## What's the point?

Parents want to save money for their kids' education. They also want some control over it until the kid is old enough. This does that, but on-chain, with automatic splitting between a checking account (kid can spend now) and a vault (locked until they turn 18).

The interesting part is how we verify age without storing birthdays in plaintext, and how we make deposits gasless so parents don't need to understand gas fees.

## How it works

### The basic flow

1. Parent connects wallet via Privy, creates a child account
2. Parent deposits ETH - gets automatically split 70/30 (checking/vault)
3. Kid can spend from checking account whenever
4. When kid turns 18, they prove it with Self Protocol's ZK passport verification
5. Vault unlocks, kid gets full control

### Why three chains?

We're using Base Sepolia, Celo Sepolia, and Oasis Sapphire. Each one does something specific:

**Base Sepolia** - This is where parents make deposits. We picked Base because Privy's gas sponsorship works here, which means parents just click "deposit" without needing to hold ETH for gas. The ParentDepositSplitter contract lives here and handles the 70/30 split automatically.

**Celo Sepolia** - Age verification happens here via Self Protocol. Self only works on Celo mainnet/testnet, so that's why we're here. When a kid turns 18, they submit a ZK proof of their age from their passport. The ScholarFiAgeVerifier contract inherits from Self's verification root and gets notified when proof is valid.

**Oasis Sapphire** - All the sensitive kid data (name, birthday, parent email) gets stored here in the ChildDataStore contract. Sapphire's TEE automatically encrypts everything at the runtime level, so we don't have to write custom encryption code. Only the parent can read this data.

### Chain communication

Base and Celo talk to each other through Hyperlane for cross-chain messaging. When you deposit on Base, theoretically you could send a message to Celo to update balances there (though in our current setup, we just handle this via Oasis as the source of truth).

## Sponsor integrations

### Privy - Gas sponsorship and wallet management

Privy handles two main things:

1. **Gas sponsorship on Base** - Parents deposit without paying gas. We configured gas sponsorship in the Privy dashboard to cover deposits to our ParentDepositSplitter contract. This is actually critical because asking non-crypto parents to "get testnet ETH for gas" would kill the UX.

2. **Embedded wallets** - Users log in with email, Privy creates an embedded wallet. We use their server SDK to create child accounts and manage wallet policies via their Policies API. The backend sets up multi-signer configs so both parent and child can eventually access wallets.

Code: Backend service at `backend/src/modules/privy/privy.service.ts` handles user creation, policy management, and gas sponsorship verification.

### Self Protocol - Zero-knowledge age verification

Self lets you prove you're over 18 using your passport's NFC chip, without revealing your actual birthday or passport number. It's all done with ZK-SNARKs.

How we integrated it:

1. ScholarFiAgeVerifier contract on Celo inherits from `SelfVerificationRoot`
2. When deploying, we register an age verification requirement (18+) with Self's Hub V2 contract
3. Kid submits proof via Self's mobile app
4. Self Hub validates the proof and calls our `customVerificationHook()`
5. We emit a ChildVerified event, which our backend picks up via webhook

The cool part is the backend automatically updates the vault wallet policies when it sees this event, giving the kid access without any manual intervention.

Contract: `contracts/celo/src/ScholarFiAgeVerifier.sol`
Self Hub V2 on Celo Sepolia: `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74`

### Oasis Sapphire - Confidential storage

We needed somewhere to store kid profiles (name, date of birth, parent contact) without exposing it to anyone except the parent. Oasis Sapphire is an EVM-compatible confidential compute chain with a TEE (Trusted Execution Environment).

The nice thing is you write normal Solidity, and the runtime handles encryption automatically. Our ChildDataStore contract just has normal `string` and `uint256` fields, but they're encrypted in storage and only decrypted inside the TEE when the authorized parent calls view functions.

We store:
- Encrypted child name
- Date of birth (encrypted)
- Parent email (encrypted)
- Wallet addresses (public)
- Privy user IDs for webhook lookups
- Vault growth tracking (updated by ROFL service)

The parent address has read access via the `onlyParent` modifier. Everyone else sees encrypted blobs.

Contract: `contracts/oasis/src/ChildDataStore.sol`

### Hyperlane - Cross-chain messaging

We use Hyperlane to pass messages between Base and Celo. The setup is:

- Base: `IMailbox.dispatch()` sends messages with a destination domain and recipient
- Celo: Our contract implements `handle()` to receive messages
- TypeCasts library converts between bytes32 and addresses

Currently we have the infrastructure set up but don't actively send cross-chain messages in the main flow (deposits stay on Base, verification happens on Celo independently). But the plumbing is there if we wanted to notify Celo about deposits or vice versa.

Mailboxes:
- Base Sepolia: `0x6966b0E55883d49BFB24539356a2f8A673E02039`
- Celo Sepolia: `0xD0680F80F4f947968206806C2598Cbc5b6FE5b03`

## Tech stack

**Frontend**: React + Vite + TypeScript, Privy React SDK for auth

**Backend**: NestJS with Privy server SDK, ethers.js for contract calls

**Contracts**: Foundry (Solidity 0.8.24 for Base, 0.8.28 for Celo because Self requires it, ^0.8.0 for Oasis)

**Monitoring**: Rust ROFL service (runs in Oasis's off-chain runtime) that monitors Celo vault balances and updates growth metrics

## Project structure

```
scholar-fi/
├── contracts/          # Foundry projects for all 3 chains
│   ├── base/          # ParentDepositSplitter (70/30 split logic)
│   ├── celo/          # ScholarFiAgeVerifier (Self integration)
│   ├── oasis/         # ChildDataStore (encrypted profiles)
│   └── rofl/          # Rust monitoring service
├── backend/           # NestJS API server
│   ├── src/modules/privy/      # Privy SDK integration
│   ├── src/modules/blockchain/ # Contract interactions
│   └── src/modules/webhooks/   # Event listeners
└── frontend/          # React app
    ├── src/components/ # UI components
    └── api/           # (deprecated, moved to backend)
```

## Deployment addresses

**Base Sepolia**
- ParentDepositSplitter: `0x9eC1c21F18a24319C2071603B04E38117C30eecA`

**Celo Sepolia**
- ScholarFiAgeVerifier: `0x181A6c2359A39628415aB91bD99306c2927DfAb9`

**Oasis Sapphire Testnet**
- ChildDataStore: `0x0D045460DBfE3A17DD2eA21f4c4cA193a1deF25E`

## Running locally

### Contracts

```bash
cd contracts
make install        # Install Foundry, Node.js deps
make build          # Compile all contracts
make test           # Run tests
make deploy-all     # Deploy to all chains
make export-abis    # Export ABIs to frontend
```

See `contracts/CLAUDE.md` for detailed deployment instructions.

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with Privy credentials and contract addresses
npm run dev
```

Backend runs on port 3001. See `backend/SETUP_GUIDE.md` for complete setup.

**Important**: You need to enable gas sponsorship in Privy dashboard and fund the gas tank before deposits will work gaslessly.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with Privy App ID and contract addresses
npm run dev
```

Frontend runs on port 5173.

## Key files to understand

If you're trying to understand how everything connects:

1. `contracts/base/src/ParentDepositSplitter.sol` - The 70/30 split logic
2. `contracts/celo/src/ScholarFiAgeVerifier.sol` - Self Protocol integration, see `customVerificationHook()`
3. `contracts/oasis/src/ChildDataStore.sol` - Encrypted storage, check the `ChildProfile` struct
4. `backend/src/modules/child-account/child-account.service.ts` - Full account creation flow
5. `backend/src/modules/webhooks/webhooks.service.ts` - How we detect verification events and update policies
6. `frontend/src/hooks/useMultiChain.ts` - How frontend talks to all three chains

## Known limitations

- Wallet private keys are currently just logged by the backend (need proper secure storage like AWS KMS)
- Privy user IDs are temporarily stored as JSON in the email field on Oasis (should be separate struct fields)
- Block tracking for webhook is in-memory (resets on restart, should use Redis)
- Email notifications are placeholders (need SendGrid/Postmark integration)
- ROFL service monitoring is not active yet (code exists but not deployed)

## Testing the full flow

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login as parent with email (Privy creates embedded wallet)
4. Create child account (backend handles all 3 chain registrations)
5. Deposit ETH (should be gasless if you configured Privy)
6. Wait for deposit to confirm
7. Check Oasis profile to see encrypted data
8. (For age verification, you'd need actual Self Protocol integration via their mobile app)

## ETHGlobal tracks

This project was built for ETHGlobal and integrates:
- Privy (gas sponsorship + embedded wallets)
- Self Protocol (ZK age verification)
- Oasis Sapphire (confidential compute)
- Hyperlane (cross-chain messaging)

See `docs/TRACK_COMPLIANCE.md` for detailed track requirement proof.

## Documentation

- `contracts/CLAUDE.md` - Contract architecture, deployment, testing
- `backend/README.md` - Backend API documentation
- `backend/SETUP_GUIDE.md` - Step-by-step backend setup
- `PRIVY_SUMMARY.md` - Privy integration details and troubleshooting
- `COMPLETE_FLOW.md` - Line-by-line code walkthrough of entire system
- `BACKEND_IMPLEMENTATION_SUMMARY.md` - What was implemented and what's left

## License

MIT

## Built for ETHGlobal

This was built during an ETHGlobal hackathon. Some parts are production-ready, others are proof-of-concept. The smart contracts are tested and working. The backend needs some hardening (key storage, database, email). The frontend works but could use more error handling.

If you're judging this: the interesting parts are the Self Protocol integration for age verification and how we handle the multi-chain coordination with Privy's policies API. The Oasis integration is straightforward but the automatic encryption is pretty convenient.
