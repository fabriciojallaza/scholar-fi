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

The chains operate independently - deposits happen on Base, age verification on Celo, and data storage on Oasis. Cross-chain coordination is handled by the backend server which interacts with all three chains via ethers.js. We initially explored Hyperlane for direct chain-to-chain messaging but decided a centralized backend coordination layer was simpler and more reliable for this use case.

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


## Tech stack

**Frontend**: React + Vite + TypeScript, Privy React SDK for auth, Self Protocol SDK for age verification UI

**Backend**: NestJS with Privy server SDK, ethers.js for contract interactions across all three chains

**Contracts**: Foundry (Solidity 0.8.24 for Base, 0.8.28 for Celo because Self Protocol requires it, ^0.8.0 for Oasis)

**Deployment**: Frontend on Vercel, Backend on Vercel (configured as serverless functions)

## Project structure

```
scholar-fi/
├── contracts/          # Foundry projects for all 3 chains
│   ├── base/          # ParentDepositSplitter (70/30 split logic)
│   ├── celo/          # ScholarFiAgeVerifier (Self Protocol integration)
│   └── oasis/         # ChildDataStore (encrypted profiles)
├── backend/           # NestJS API server (deployed to Vercel)
│   ├── api/           # Vercel serverless entry point
│   ├── src/modules/privy/      # Privy SDK integration
│   ├── src/modules/blockchain/ # Multi-chain contract interactions
│   ├── src/modules/child-account/ # Account creation flow
│   └── src/modules/webhooks/   # Event listeners (Privy webhooks)
└── frontend/          # React app (deployed to Vercel)
    ├── src/components/ # UI components
    ├── src/hooks/     # Custom hooks (useSelfVerification, wallet management)
    └── src/config/    # Chain and contract configurations
```

## Deployment addresses

**Base Sepolia**
- ParentDepositSplitter: `0x9eC1c21F18a24319C2071603B04E38117C30eecA`

**Celo Sepolia**
- ScholarFiAgeVerifier: `0xa4Ca603a1BEb03F1C11bdeA90227855f67DFf796`

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

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with:
#   - Privy App ID and App Secret
#   - Contract addresses (Base, Celo, Oasis)
#   - RPC URLs for all three chains
#   - Private key for contract interactions
npm run dev
```

**Important**:
- Enable gas sponsorship in Privy dashboard and fund the gas tank before deposits will work gaslessly
- For production deployment to Vercel, set all environment variables in Vercel dashboard
- Backend uses NestJS configured as Vercel serverless functions via `api/index.ts`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with:
#   - VITE_PRIVY_APP_ID (from Privy dashboard)
#   - VITE_BACKEND_URL (backend URL, no trailing slash)
#   - Contract addresses for all three chains
npm run dev
```

Frontend runs on port 3000 locally (Vite dev server).

**For Vercel deployment:**
- Set `VITE_BACKEND_URL` without trailing slash (e.g., `https://your-backend.vercel.app`)
- Add all `VITE_*` environment variables in Vercel dashboard
- Vercel will auto-detect Vite and build correctly

## Key files to understand

If you're trying to understand how everything connects:

1. `contracts/base/src/ParentDepositSplitter.sol` - The 70/30 split logic for deposits
2. `contracts/celo/src/ScholarFiAgeVerifier.sol` - Self Protocol integration with `customVerificationHook()` and address parsing
3. `contracts/oasis/src/ChildDataStore.sol` - Encrypted storage with TEE, check the `ChildProfile` struct
4. `backend/src/modules/child-account/child-account.service.ts` - Full multi-chain account creation flow
5. `backend/src/modules/blockchain/blockchain.service.ts` - Multi-chain contract interactions using ethers.js
6. `frontend/src/hooks/useSelfVerification.ts` - Self Protocol SDK integration for age verification UI
7. `frontend/src/components/ParentOnboarding.tsx` - Main account creation flow and backend API calls

## Known limitations and future improvements

- **Privy SDK on Vercel**: The `@privy-io/server-auth` package has deep dependencies (`@hpke/common`) that don't bundle well with Vercel's serverless functions. Currently exploring workarounds or may need to migrate backend to Railway/Render.
- **Wallet key management**: Private keys are logged by backend during development. Production needs proper secure storage (AWS KMS, HashiCorp Vault, or Privy's managed wallets).
- **Child data structure**: Privy user IDs stored as JSON strings in email field on Oasis contract - should be separate struct fields.
- **Event monitoring**: Block tracking for Privy webhooks is in-memory (resets on restart) - needs persistent storage like Redis or database.
- **Notifications**: Email notifications are placeholder console.logs - need integration with SendGrid/Postmark.
- **Self Protocol limitations**: Requires mock passports on testnet (`staging_celo` endpoint), real NFC passports needed for mainnet.

## Testing the full flow

### Local development:
1. Start backend: `cd backend && npm run dev` (runs on port 3001)
2. Start frontend: `cd frontend && npm run dev` (runs on port 3000)
3. Login as parent with email (Privy creates embedded wallet automatically)
4. Create child account (backend registers on all 3 chains: Base, Celo, Oasis)
5. Deposit ETH on Base (gasless if Privy gas sponsorship is configured and funded)
6. Wait for transaction confirmation
7. View child profile (encrypted data stored on Oasis)
8. Test age verification flow:
   - Click "Unlock at age 18" button in Manage tab
   - Scan QR code with Self Protocol mobile app
   - Submit passport proof (use mock passport on testnet)
   - Backend detects verification and updates wallet policies

### Production (Vercel):
- Frontend: https://scholar-fi-frontend.vercel.app
- Backend: https://scholar-fi.vercel.app
- Make sure all environment variables are set in both Vercel projects

## ETHGlobal sponsor integrations

This project was built for ETHGlobal and integrates:
- **Privy**: Gas sponsorship on Base + embedded wallet management + multi-signer policies
- **Self Protocol**: Zero-knowledge passport age verification on Celo with direct on-chain integration
- **Oasis Sapphire**: Confidential TEE-based storage for encrypted child profiles


## License

MIT

## Built for ETHGlobal

This was built during an ETHGlobal hackathon. The smart contracts are fully tested and deployed. The backend multi-chain coordination works but needs production hardening (key management, persistent storage, proper error handling). The frontend is functional with Self Protocol age verification flow integrated.

**Notable technical achievements:**
1. **Self Protocol on-chain integration**: Direct smart contract verification with custom userDefinedData parsing to handle Self's UTF-8 string encoding
2. **Multi-chain coordination**: Backend orchestrates contract calls across Base (deposits), Celo (age verification), and Oasis (encrypted storage)
3. **Gasless UX**: Privy's gas sponsorship makes deposits work without users needing testnet ETH
4. **TEE-based encryption**: Oasis Sapphire provides automatic encryption without custom crypto code

**Key integration challenges solved:**
- Self Protocol's `endpointType` must be `'staging_celo'` not `'celo-staging'` (found by reading SDK source)
- userDefinedData encoding: Self converts strings to UTF-8 bytes, requiring custom hex parsing in Solidity
- Vercel serverless: Privy SDK dependencies (`@hpke/common`) have bundling issues on Vercel (ongoing)
