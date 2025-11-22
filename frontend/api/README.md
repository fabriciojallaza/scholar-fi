# Scholar-Fi Serverless API Functions

This directory contains Vercel-compatible serverless functions that handle backend operations for Scholar-Fi.

## Functions Overview

### 1. `create-child-account.ts`
**Endpoint**: `POST /api/create-child-account`

Creates a complete child account setup across all three chains.

**Request Body**:
```json
{
  "parentUserId": "privy-user-id",
  "childName": "John Doe",
  "childDateOfBirth": 1234567890,
  "parentEmail": "parent@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "childAddress": "0x...",
  "childUserId": "privy-child-user-id",
  "checkingWallet": {
    "id": "wallet-id-1",
    "address": "0x..."
  },
  "vaultWallet": {
    "id": "wallet-id-2",
    "address": "0x..."
  },
  "oasisProfileCreated": true,
  "celoRegistered": true,
  "baseRegistered": true
}
```

**What it does**:
1. Creates child Privy user entity
2. Fetches parent's main wallet (index 0)
3. Creates checking wallet (index 1) with child as `additional_signer`
4. Creates vault wallet (index 2) with child as `additional_signer`
5. Registers wallets on Base `ParentDepositSplitter`
6. Registers child on Celo `ScholarFiAgeVerifier`
7. Creates encrypted profile on Oasis `ChildDataStore`

### 2. `webhooks/privy.ts`
**Endpoint**: `POST /api/webhooks/privy`

Webhook receiver for Privy `wallet.balance_changed` events.

**Privy Webhook Setup**:
1. Go to Privy Dashboard → Webhooks
2. Add webhook URL: `https://your-domain.vercel.app/api/webhooks/privy`
3. Subscribe to: `wallet.balance_changed`
4. Copy webhook secret to env: `PRIVY_WEBHOOK_SECRET`

**What it does**:
1. Verifies webhook signature
2. Processes deposit events (positive balance changes)
3. Updates Oasis `ChildDataStore` with deposit amount

### 3. `webhooks/celo.ts`
**Endpoint**: `GET /api/webhooks/celo` (Cron job)

Monitors Celo for `ChildVerified` events and triggers Privy policy updates.

**Cron Schedule**: Runs every 5 minutes (configured in `vercel.json`)

**Manual Trigger**: `POST /api/webhooks/celo`

**What it does**:
1. Scans Celo `ScholarFiAgeVerifier` for new `ChildVerified` events
2. Updates Privy wallet policy to transfer vault ownership to child
3. Updates Oasis `ChildDataStore` with verification status

## Environment Variables

Add these to your Vercel project settings:

### Privy
```
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_WEBHOOK_SECRET=your-webhook-secret
```

### Deployer (for contract interactions)
```
DEPLOYER_PRIVATE_KEY=0x...
```

### Base Sepolia
```
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_BASE_SPLITTER_ADDRESS=0x...
```

### Celo Sepolia
```
VITE_CELO_SEPOLIA_RPC=https://celo-sepolia-rpc.publicnode.com
VITE_CELO_VERIFIER_ADDRESS=0x...
```

### Oasis Sapphire
```
VITE_OASIS_SAPPHIRE_RPC=https://testnet.sapphire.oasis.io
VITE_OASIS_DATASTORE_ADDRESS=0x...
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link your project:
```bash
cd frontend
vercel link
```

3. Add environment variables:
```bash
vercel env add PRIVY_APP_ID
vercel env add PRIVY_APP_SECRET
# ... add all other env vars
```

4. Deploy:
```bash
vercel --prod
```

### Testing Locally

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env.local` with all required variables

3. Run Vercel dev server:
```bash
vercel dev
```

4. Test endpoints:
```bash
# Create child account
curl -X POST http://localhost:3000/api/create-child-account \
  -H "Content-Type: application/json" \
  -d '{"parentUserId":"...","childName":"Test","childDateOfBirth":123456,"parentEmail":"test@test.com"}'

# Manually trigger Celo listener
curl -X POST http://localhost:3000/api/webhooks/celo

# Test Privy webhook (requires valid signature)
curl -X POST http://localhost:3000/api/webhooks/privy \
  -H "x-privy-signature: ..." \
  -d '{"event":"wallet.balance_changed","data":{...}}'
```

## Architecture Flow

```
Frontend (React + Privy)
  │
  ├─► POST /api/create-child-account
  │   └─► Creates child Privy user + HD wallets
  │       └─► Registers on Base, Celo, Oasis
  │
  ├─► Privy Webhook → POST /api/webhooks/privy
  │   └─► Updates Oasis on deposits
  │
  └─► Cron Job → GET /api/webhooks/celo (every 5 min)
      └─► Monitors Celo verification events
          └─► Updates Privy policy + Oasis
```

## TODO: Improvements Needed

1. **Database Integration**: Currently using in-memory state for `lastProcessedBlock` in Celo listener. Use Redis or database for production.

2. **Wallet Lookup**: `findChildByWallet()` in Privy webhook needs proper implementation. Consider maintaining an off-chain index.

3. **Privy User ID Storage**: Need to store Privy user IDs in Oasis `ChildDataStore` for easier lookups. Consider adding `childPrivyUserId` and `parentPrivyUserId` fields.

4. **Error Handling**: Add retry logic for failed contract calls.

5. **Rate Limiting**: Add rate limiting to public endpoints.

6. **Monitoring**: Add logging/monitoring service (e.g., Sentry, Datadog).

7. **Gas Optimization**: Batch contract calls where possible to reduce gas costs.
