# Scholar-Fi Backend API

NestJS backend service for Scholar-Fi that handles:
- Privy integration with Server SDK
- Multi-signer wallet policies
- Cross-chain contract interactions
- Webhook processing (Privy balance changes, Celo verifications)
- Gas sponsorship verification

## Features

### ✅ Implemented Critical MVP Features

1. **Privy Server SDK Integration**
   - Official `@privy-io/server-auth` package
   - Proper authentication (Basic Auth)
   - User creation and wallet management

2. **Privy Policies API**
   - Multi-signer wallet setup
   - Time locks for vault wallets
   - Policy updates after age verification
   - Reference: https://docs.privy.io/api-reference/policies/create

3. **Gas Sponsorship Verification**
   - Checks if gas sponsorship enabled for Base Sepolia
   - Warns if not configured
   - Guides to Privy Dashboard for setup

4. **Cross-Chain Operations**
   - Base: Register child wallets on ParentDepositSplitter
   - Celo: Register child on ScholarFiAgeVerifier
   - Oasis: Create encrypted profile with Privy IDs

5. **Webhook Handlers**
   - Privy: Balance change detection
   - Celo: Age verification events
   - Automatic vault policy updates

## Installation

```bash
# Install dependencies
cd backend
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Environment Variables

Required variables in `.env`:

```bash
# Privy (get from https://dashboard.privy.io)
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
PRIVY_WEBHOOK_SECRET=your_webhook_secret

# Blockchain
PRIVATE_KEY=0x...  # Deployer key for contract interactions

# Contract addresses (from contracts/.env)
BASE_SPLITTER_ADDRESS=0x9eC1c21F18a24319C2071603B04E38117C30eecA
CELO_VERIFIER_ADDRESS=0xa4Ca603a1BEb03F1C11bdeA90227855f67DFf796
OASIS_DATASTORE_ADDRESS=0x0D045460DBfE3A17DD2eA21f4c4cA193a1deF25E

# Server
PORT=3001
CORS_ORIGIN=http://localhost:5173  # Frontend URL
```

## Development

```bash
# Run in development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

Server will start on http://localhost:3001

## API Endpoints

### Create Child Account

**POST** `/api/child-account/create`

Creates a complete child account with:
- Privy user creation
- Multi-signer wallet policies
- Registration on all 3 chains
- Encrypted profile on Oasis

Request:
```json
{
  "parentUserId": "did:privy:abc123",
  "childName": "John Doe",
  "childDateOfBirth": 1234567890,
  "parentEmail": "parent@example.com"
}
```

Response:
```json
{
  "success": true,
  "childAddress": "0x...",
  "childUserId": "did:privy:xyz789",
  "childPrivyEmail": "child-...@scholarfi.internal",
  "checkingWallet": "0x...",
  "vaultWallet": "0x...",
  "parentWallet": "0x...",
  "oasisProfileCreated": true,
  "celoRegistered": true,
  "baseRegistered": true,
  "policiesCreated": true,
  "message": "Child account created with multi-signer policies"
}
```

### Privy Webhook

**POST** `/api/webhooks/privy`

Receives Privy `wallet.balance_changed` events.

Headers:
- `x-privy-signature`: HMAC SHA256 signature

Body:
```json
{
  "event": "wallet.balance_changed",
  "data": {
    "address": "0x...",
    "balance_change": "1000000000000000"
  }
}
```

### Celo Verification Checker

**GET/POST** `/api/webhooks/celo/check`

Checks for `ChildVerified` events on Celo and updates vault policies.

Can be called manually or scheduled as cron job.

Response:
```json
{
  "success": true,
  "eventsProcessed": 2,
  "lastBlock": 12345678,
  "events": [...]
}
```

## Architecture

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── common/
│   └── dto/                   # Data transfer objects
├── modules/
│   ├── privy/                 # Privy SDK integration
│   │   ├── privy.service.ts   # User creation, policies, gas verification
│   │   └── privy.module.ts
│   ├── blockchain/            # Smart contract interactions
│   │   ├── blockchain.service.ts
│   │   └── blockchain.module.ts
│   ├── child-account/         # Child account creation
│   │   ├── child-account.controller.ts
│   │   ├── child-account.service.ts
│   │   └── child-account.module.ts
│   └── webhooks/              # Webhook handlers
│       ├── webhooks.controller.ts
│       ├── webhooks.service.ts
│       └── webhooks.module.ts
```

## Integration with Frontend

Update frontend to call backend API:

```typescript
// frontend/src/components/ParentOnboarding.tsx

const response = await fetch('http://localhost:3001/api/child-account/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parentUserId: user.id,
    childName,
    childDateOfBirth: dobTimestamp,
    parentEmail,
  }),
});
```

## Privy Dashboard Configuration

### 1. Gas Sponsorship (CRITICAL)

1. Go to https://dashboard.privy.io
2. Navigate to: **Settings → Embedded Wallets → Gas Sponsorship**
3. Enable gas sponsorship for **Base Sepolia (84532)**
4. Add allowed contract: `0x9eC1c21F18a24319C2071603B04E38117C30eecA`
5. Set limits:
   - Max gas per transaction: 0.001 ETH
   - Daily limit per user: 0.01 ETH
6. Fund gas tank with 0.1 ETH

### 2. Webhook Configuration

1. Navigate to: **Settings → Webhooks**
2. Click **Add Webhook**
3. Configure:
   ```
   URL: https://your-domain.com/api/webhooks/privy
   Events: wallet.balance_changed
   Secret: [Copy to .env as PRIVY_WEBHOOK_SECRET]
   ```
4. Save and test

## Privy Policies API

This backend uses Privy's Policies API for multi-signer wallets:
https://docs.privy.io/api-reference/policies/create

### Creating a Policy

```typescript
await privyService.createWalletPolicy(
  walletAddress,
  [parentUserId, childUserId],  // Signers
  {
    timeLocks: { unlockDate: timestamp },
    spendingLimits: { amount: '1000000', period: 'daily' }
  }
);
```

### Updating After Verification

```typescript
await privyService.updateWalletPolicy(
  vaultWalletAddress,
  policyId,
  {
    signers: [...existingSigners, childUserId],
    timeLocks: null  // Remove lock
  }
);
```

## Testing

### Test Child Account Creation

```bash
curl -X POST http://localhost:3001/api/child-account/create \
  -H "Content-Type: application/json" \
  -d '{
    "parentUserId": "did:privy:test123",
    "childName": "Test Child",
    "childDateOfBirth": 1234567890,
    "parentEmail": "test@test.com"
  }'
```

### Test Celo Verification Check

```bash
curl http://localhost:3001/api/webhooks/celo/check
```

### Test Privy Webhook (requires valid signature)

```bash
curl -X POST http://localhost:3001/api/webhooks/privy \
  -H "Content-Type: application/json" \
  -H "x-privy-signature: YOUR_SIGNATURE" \
  -d '{
    "event": "wallet.balance_changed",
    "data": {
      "address": "0x...",
      "balance_change": "1000000"
    }
  }'
```

## Production Deployment

### Option 1: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 2: Heroku

```bash
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
heroku create scholar-fi-backend
git push heroku main
```

### Option 3: VPS (Digital Ocean, AWS EC2)

```bash
# Build
npm run build

# Run with PM2
npm install -g pm2
pm2 start dist/main.js --name scholar-fi-backend

# Setup nginx reverse proxy
# Point domain to port 3001
```

## Production Checklist

- [ ] Configure all environment variables
- [ ] Enable gas sponsorship in Privy Dashboard
- [ ] Fund gas tank with ETH
- [ ] Setup Privy webhook with production URL
- [ ] Implement secure private key storage (AWS KMS, Vault)
- [ ] Add database for block tracking (Redis, PostgreSQL)
- [ ] Setup email service (SendGrid, Postmark)
- [ ] Add monitoring (Sentry, Datadog)
- [ ] Setup SSL certificate
- [ ] Configure CORS for production domain
- [ ] Setup cron job for Celo verification checker

## Troubleshooting

### Gas sponsorship not working
- Verify enabled in Privy Dashboard for Base Sepolia
- Check gas tank has funds
- Ensure contract address is whitelisted

### Privy policies failing
- Verify Privy API credentials correct
- Check Privy API status page
- Ensure wallet addresses are valid

### Webhook signature verification failing
- Check PRIVY_WEBHOOK_SECRET matches dashboard
- Verify request body is exactly as sent (no modifications)
- Check HMAC SHA256 implementation

### Child account creation fails
- Verify parent has embedded wallet
- Check all contract addresses correct
- Ensure deployer has ETH on all chains

## Support

For issues with:
- **Privy**: https://docs.privy.io
- **Smart contracts**: See `contracts/CLAUDE.md`
- **Frontend**: See `frontend/README.md`
