# Scholar-Fi Deployment Information

## Deployed Contracts (ETHGlobal 2025)

### ScholarFiVault (Celo Sepolia)
- **Address**: `0x1776402BE859fAf809b8f17dD6149f75d7Fb47B6`
- **Network**: Celo Sepolia Testnet
- **Chain ID**: 11142220
- **Explorer**: https://celo-sepolia.blockscout.com/address/0x1776402BE859fAf809b8f17dD6149f75d7Fb47B6
- **Status**: ✅ Verified (Pass - Verified)
- **Deployment TX**: `0x21f9f9cde2e2ac66223c75a64a7fddbefd7f428919c4c2bbd8b2599bf4411934`
- **Gas Used**: 0.070 CELO

### ChildDataStore (Oasis Sapphire Testnet)
- **Address**: `0x1776402BE859fAf809b8f17dD6149f75d7Fb47B6`
- **Network**: Oasis Sapphire Testnet
- **Chain ID**: 23295
- **Explorer**: https://explorer.oasis.io/testnet/sapphire/address/0x1776402BE859fAf809b8f17dD6149f75d7Fb47B6
- **Status**: ✅ Verified (Sourcify - Exact Match)
- **Deployment TX**: `0x9f8a3f9b13572ad90d95f1458419242040e7b5c067200a410cad35994f8bcec1`
- **Gas Used**: 0.149 TEST

---

## Network Configuration

### Celo Sepolia
```
RPC: https://celo-sepolia.drpc.org
Chain ID: 11142220
Block Explorer: https://celo-sepolia.blockscout.com
Faucet: https://faucet.celo.org/celo-sepolia
```

### Oasis Sapphire Testnet
```
RPC: https://testnet.sapphire.oasis.io
Chain ID: 23295
Block Explorer: https://explorer.oasis.io/testnet/sapphire
Faucet: https://faucet.testnet.oasis.io
```

---

## Self Protocol Integration

**Self Hub V2 Address (Celo Sepolia)**:
```
0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
```

**Verification Configuration**:
- Scope Seed: `scholar-fi-v1`
- Age Requirement: 18+ years old
- Country Restrictions: None
- OFAC Enabled: false

---

## Test Data

### Deployer Address
```
0x8b790c6F09e0bDF434d7946B2983bFDB9bec5f71
```

### Test Child Account
```
Address: 0x244B776963C0Ee4a96E982Ba275858405f8018d9
Vault Balance: 0.03 CELO (30% of deposits)
Spending Balance: 0.05 CELO (70% of deposits, after 0.02 payment)
Parent: 0x8b790c6F09e0bDF434d7946B2983bFDB9bec5f71
Verified: false
Created: Block 10517017
```

### Whitelisted Institution (Test)
```
0x1234567890123456789012345678901234567890
```

---

## Test Transactions

### 1. Create Child Account
- TX: `0x2cf78b6f9b0eded0888d3da275afb53b126cbc3d3e11460dd470e1b6cbe1fe1e`
- Gas: 97,642
- Block: 10517017

### 2. Deposit Funds (0.1 CELO)
- TX: `0x20decf0d1ee71683884b36719d538219e950c4b94441c377d6c7e2ac91591a14`
- Gas: 72,288
- Block: 10517053
- Split: 0.03 vault / 0.07 spending

### 3. Whitelist Institution
- TX: `0xd0af9eb5f2f49205eb99c00a138ef58332e1c85795d3998d3423967016f9523f`
- Gas: 46,185
- Block: 10517092

### 4. Create Child Profile (Oasis)
- TX: `0x6c71ed78c5817334e29b88b056ce81625f2057302b58c9797f5d35f8e4f0400b`
- Gas: 166,964
- Block: 14494586
- Data: Encrypted by Sapphire TEE

### 5. Pay Whitelisted Institution (0.02 CELO)
- TX: `0x382f9ddbac140b6c9b9f2ca595f791a156b53e200521bf7775422bf57b9a56d2`
- Gas: 66,553
- Block: 10517492

---

## ROFL Service

**Status**: ✅ Running successfully

**Configuration**:
- Check Interval: 30 seconds (configurable)
- Simulated Aave APY: 3.50%
- Daily Growth Calculation: 95,890,410,958,904 wei per vault

**Monitoring Logs**:
- Fetches vault balances from Celo
- Checks Aave APY for rebalancing opportunities
- Calculates daily vault growth
- Updates Oasis Sapphire with growth data

---

## Security Tests Passed

### ✅ Access Control
- ❌ Deposit from non-parent: `NotParent` error
- ❌ Create duplicate account: `AccountAlreadyExists` error
- ❌ Pay with insufficient balance: `InsufficientBalance` error
- ❌ Pay to non-whitelisted: `NotWhitelisted` error
- ❌ Whitelist without owner permissions: `NotOwner` error

### ✅ Fund Management
- ✅ 30/70 split verified (0.03 vault / 0.07 spending from 0.1 deposit)
- ✅ Spending balance decreases after payment (0.07 → 0.05)
- ✅ Vault balance remains locked until age verification

### ✅ Oasis Sapphire TEE
- ✅ Profile created with encrypted data
- ✅ Access control enforced
- ✅ `getVaultGrowth()` public function accessible
- ✅ `getChildProfile()` requires Sapphire SDK (expected behavior)

---

## Frontend Integration Guide

### Required Packages
```bash
npm install @oasisprotocol/sapphire-paratime ethers @privy-io/react-auth wagmi
```

### Sapphire Paratime Usage
```typescript
import * as sapphire from '@oasisprotocol/sapphire-paratime';

// Wrap provider to handle TEE encryption
const provider = sapphire.wrap(
  new ethers.JsonRpcProvider('https://testnet.sapphire.oasis.io')
);
```

### Contract ABIs
Available at:
- `contracts/celo/out/ScholarFiVault.sol/ScholarFiVault.json`
- `contracts/oasis/out/ChildDataStore.sol/ChildDataStore.json`

---

## Track Compliance

### Self Protocol Track ✅
- Integrated SelfVerificationRoot for age verification
- 18+ requirement configured
- Vault unlocks automatically after Self verification

### Privy Track ⏳
- Gas sponsorship configured in Privy dashboard (pending frontend)
- Embedded wallets for child accounts

### Oasis Track ✅
- ROFL monitoring service demonstrated
- Sapphire TEE encryption for sensitive child data
- Would run in TEE for production deployment

---

## Compiler Version
- Solidity: 0.8.28 (required by Self Protocol @selfxyz/contracts)
- Foundry: 1.4.4-stable

---

## Notes
- Both contracts deployed to same address on different chains (deterministic deployment)
- All contracts verified and publicly viewable
- ROFL service runs in simplified mode (full TEE integration for production)
- Frontend integration pending (Next.js + Privy + Sapphire SDK)
