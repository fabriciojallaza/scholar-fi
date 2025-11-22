# 🎓 Scholar-Fi

**ETHGlobal 2025 Hackathon Project**

Purpose-restricted smart wallet for minors with age-gated access and educational spending controls.

---

## 🌟 Overview

Scholar-Fi is a blockchain-based savings platform that helps parents manage funds for their children while enforcing responsible spending habits. The system automatically splits deposits (30% locked vault, 70% spending) and restricts payments to whitelisted educational institutions until the child turns 18.

### Key Features

- 💰 **Auto-split deposits**: 30% locked vault / 70% spending balance
- 🔒 **Age-gated access**: Vault unlocks automatically at 18+ via Self Protocol
- 🏫 **Whitelisted spending**: Children can only pay approved institutions
- 🔐 **Privacy-first**: Sensitive data encrypted in Oasis Sapphire TEE
- 📊 **Growth tracking**: ROFL service monitors vault growth and APY
- ⛽ **Gas sponsorship**: Privy integration for seamless UX (frontend)

---

## 🏗️ Architecture

### Smart Contracts

**ScholarFiVault** (Celo Sepolia)
- Parent creates child accounts
- Deposits auto-split 30/70
- Self Protocol integration for age verification
- Whitelisted institution payments

**ChildDataStore** (Oasis Sapphire)
- Encrypted storage for sensitive child information
- TEE-protected data (name, DOB, email)
- Access control for privacy

**ROFL Monitoring Service** (Rust)
- Monitors vault balances on Celo
- Checks Aave APY for rebalancing
- Updates growth data in Oasis Sapphire

---

## 🎯 Track Compliance

### ✅ Self Protocol Track
- Integrated `SelfVerificationRoot` for on-chain age verification
- 18+ requirement enforced before vault unlock
- Configured for Celo Sepolia Self Hub V2

### ✅ Oasis Track
- ROFL monitoring service (simplified for hackathon)
- Sapphire TEE encryption for child data privacy
- Production-ready confidential smart contracts

### ⏳ Privy Track
- Gas sponsorship configured (pending frontend)
- Embedded wallet creation for children
- Seamless onboarding flow

---

## 📦 Deployed Contracts

### Celo Sepolia Testnet
```
ScholarFiVault: 0x1776402BE859fAf809b8f17dD6149f75d7Fb47B6
```
- [View on Blockscout](https://celo-sepolia.blockscout.com/address/0x1776402BE859fAf809b8f17dD6149f75d7Fb47B6)
- Status: ✅ Verified

### Oasis Sapphire Testnet
```
ChildDataStore: 0x1776402BE859fAf809b8f17dD6149f75d7Fb47B6
```
- [View on Explorer](https://explorer.oasis.io/testnet/sapphire/address/0x1776402BE859fAf809b8f17dD6149f75d7Fb47B6)
- Status: ✅ Verified (Sourcify)

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment details and test results.

---

## 🚀 Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (v1.4.4+)
- [Rust](https://rustup.rs/) (v1.91.1+, for ROFL service)
- Node.js 18+ (for frontend)

### Build Contracts

```bash
# Celo contracts
cd contracts/celo
forge build

# Oasis contracts
cd contracts/oasis
forge build
```

### Run ROFL Service

```bash
cd contracts/rofl
cargo run --release
```

### Environment Variables

Create `.env` files in each directory:

**contracts/celo/.env**
```env
PRIVATE_KEY=your_private_key
CELO_RPC_URL=https://celo-sepolia.drpc.org
CELOSCAN_API_KEY=your_api_key
SELF_HUB_V2=0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
```

**contracts/oasis/.env**
```env
PRIVATE_KEY=your_private_key
SAPPHIRE_TESTNET_RPC=https://testnet.sapphire.oasis.io
SAPPHIRE_CHAIN_ID=23295
```

**contracts/rofl/.env**
```env
SCHOLAR_FI_VAULT=0x1776402BE859fAf809b8f17dD6149f75d7Fb47B6
CHILD_DATA_STORE=0x1776402BE859fAf809b8f17dD6149f75d7Fb47B6
CELO_RPC_URL=https://celo-sepolia.drpc.org
SAPPHIRE_TESTNET_RPC=https://testnet.sapphire.oasis.io
CHECK_INTERVAL=3600
RUST_LOG=info
```

---

## 🧪 Testing

All contracts have been thoroughly tested with real transactions on testnets.

### Successful Test Cases

✅ Create child account  
✅ Deposit funds with 30/70 split  
✅ Whitelist educational institution  
✅ Create encrypted child profile on Oasis  
✅ Child pays whitelisted institution  
✅ Reject payment to non-whitelisted address  
✅ Access control: deposit from non-parent  
✅ Access control: insufficient balance  
✅ ROFL service monitoring (5+ cycles)

See [DEPLOYMENT.md](DEPLOYMENT.md) for transaction hashes and detailed results.

---

## 💻 Frontend Integration

### Install Dependencies

```bash
npm install @oasisprotocol/sapphire-paratime ethers @privy-io/react-auth wagmi
```

### Sapphire Paratime Setup

```typescript
import * as sapphire from '@oasisprotocol/sapphire-paratime';

// Wrap provider to handle TEE encryption/decryption
const provider = sapphire.wrap(
  new ethers.JsonRpcProvider('https://testnet.sapphire.oasis.io')
);

// Read encrypted child profile
const contract = new ethers.Contract(address, abi, provider);
const profile = await contract.getChildProfile(childAddress);
```

### Contract ABIs

Located at:
- `contracts/celo/out/ScholarFiVault.sol/ScholarFiVault.json`
- `contracts/oasis/out/ChildDataStore.sol/ChildDataStore.json`

---

## 📚 How It Works

### 1. Parent Creates Account
```solidity
vault.createChildAccount(childWalletAddress);
```

### 2. Parent Deposits Funds
```solidity
vault.depositFunds{value: 1 ether}(childWalletAddress);
// Auto-splits: 0.3 ETH → vault, 0.7 ETH → spending
```

### 3. Parent Creates Child Profile (Encrypted)
```solidity
dataStore.createChildProfile(
  childAddress,
  "Juan Perez",
  dateOfBirth,
  "parent@example.com"
);
// Data encrypted by Sapphire TEE automatically
```

### 4. Child Pays Institution
```solidity
vault.payWhitelisted(schoolAddress, amount);
// Only works if school is whitelisted
```

### 5. Age Verification (Self Protocol)
- Child turns 18
- Verifies age with Self app (passport/ID)
- `customVerificationHook()` automatically unlocks vault
- All funds transferred to spending balance

### 6. ROFL Service Monitors
- Checks vault balances every hour
- Simulates Aave APY (3.5% testnet)
- Calculates daily growth
- Updates Oasis with growth data

---

## 🛠️ Technology Stack

- **Smart Contracts**: Solidity 0.8.28
- **Framework**: Foundry
- **Blockchain**: Celo Sepolia (L2), Oasis Sapphire (Privacy)
- **Age Verification**: Self Protocol
- **Privacy**: Oasis Sapphire TEE
- **Monitoring**: ROFL (Rust)
- **Gas Sponsorship**: Privy (frontend)
- **Frontend**: Next.js + ethers.js (pending)

---

## 🔐 Security

### Access Controls
- Only parent can deposit funds
- Only child can spend from their balance
- Only owner can whitelist institutions
- Only authorized addresses can read encrypted data

### Tested Attack Vectors
- ❌ Non-parent deposit attempt → `NotParent`
- ❌ Duplicate account creation → `AccountAlreadyExists`
- ❌ Overspend attempt → `InsufficientBalance`
- ❌ Pay non-whitelisted → `NotWhitelisted`
- ❌ Unauthorized whitelist → `NotOwner`

---

## 📄 License

MIT

---

## 🤝 Team

Built for ETHGlobal 2025 Hackathon

---

## 📞 Contact

For questions or demo requests, reach out via ETHGlobal Discord.

---

## 🙏 Acknowledgments

- Self Protocol for age verification infrastructure
- Oasis Foundation for Sapphire TEE and ROFL framework
- Privy for gas sponsorship and embedded wallets
- Celo for educational blockchain infrastructure
