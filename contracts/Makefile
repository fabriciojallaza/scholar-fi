.PHONY: help install build test deploy-base deploy-celo deploy-oasis deploy-all verify-base verify-celo clean rofl

# Detect OS
ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname -s)
endif

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help:
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)   Scholar-Fi Smart Contract Deployment$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Setup Commands:$(NC)"
	@echo "  make install        - Install all dependencies (npm + rust)"
	@echo "  make build          - Compile all contracts"
	@echo "  make test           - Run all tests"
	@echo ""
	@echo "$(YELLOW)Deployment Commands:$(NC)"
	@echo "  make deploy-base    - Deploy ScholarFiBridge to Base Sepolia"
	@echo "  make deploy-celo    - Deploy ScholarFiVault to Celo Sepolia"
	@echo "  make deploy-oasis   - Deploy ChildDataStore to Oasis Sapphire"
	@echo "  make deploy-all     - Deploy to all 3 chains"
	@echo ""
	@echo "$(YELLOW)Verification:$(NC)"
	@echo "  make verify-base    - Verify Base contract on Basescan"
	@echo "  make verify-celo    - Verify Celo contract on Celoscan"
	@echo ""
	@echo "$(YELLOW)ROFL Service:$(NC)"
	@echo "  make rofl           - Build and run ROFL monitoring service"
	@echo ""
	@echo "$(YELLOW)Utilities:$(NC)"
	@echo "  make clean          - Clean build artifacts"
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"

install:
	@echo "$(GREEN)Checking prerequisites...$(NC)"
ifeq ($(DETECTED_OS),Windows)
	@where node >nul 2>&1 || (echo $(YELLOW)Node.js not found. Install from https://nodejs.org$(NC) && exit 1)
	@where forge >nul 2>&1 || (echo $(YELLOW)Foundry not found. Install from https://book.getfoundry.sh/getting-started/installation$(NC) && exit 1)
	@where cargo >nul 2>&1 || (echo $(YELLOW)Rust not found. Install from https://rustup.rs$(NC) && exit 1)
else
	@command -v node > /dev/null 2>&1 || (echo "$(YELLOW)⚠️  Node.js not found. Install from https://nodejs.org$(NC)" && exit 1)
	@command -v forge > /dev/null 2>&1 || (echo "$(YELLOW)⚠️  Foundry not found. Run: curl -L https://foundry.paradigm.xyz | bash && foundryup$(NC)" && exit 1)
	@command -v cargo > /dev/null 2>&1 || (echo "$(YELLOW)⚠️  Rust not found. Run: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh$(NC)" && exit 1)
endif
	@echo "$(GREEN)Installing Base Sepolia contracts dependencies...$(NC)"
	@cd base && npm install && forge install
	@echo "$(GREEN)Installing Celo Sepolia contracts dependencies...$(NC)"
	@cd celo && npm install && forge install
	@echo "$(GREEN)Installing Oasis contracts dependencies...$(NC)"
	@cd oasis && npm install && forge install
	@echo "$(GREEN)Installing ROFL service dependencies...$(NC)"
	@cd rofl && cargo build
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

build:
	@echo "$(GREEN)Building Base contracts...$(NC)"
	@cd base && forge build
	@echo "$(GREEN)Building Celo contracts...$(NC)"
	@cd celo && forge build
	@echo "$(GREEN)Building Oasis contracts...$(NC)"
	@cd oasis && forge build
	@echo "$(GREEN)Building ROFL service...$(NC)"
	@cd rofl && cargo build --release
	@echo "$(GREEN)✓ All contracts compiled successfully$(NC)"

test:
	@echo "$(GREEN)Testing Base contracts...$(NC)"
	@cd base && forge test
	@echo "$(GREEN)Testing Celo contracts...$(NC)"
	@cd celo && forge test
	@echo "$(GREEN)Testing Oasis contracts...$(NC)"
	@cd oasis && forge test
	@echo "$(GREEN)✓ All tests passed$(NC)"

deploy-base:
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Deploying to Base Sepolia Testnet$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️  No .env file found in contracts/$(NC)"; \
		echo "$(YELLOW)Copy .env.example to .env and fill in values$(NC)"; \
		exit 1; \
	fi
	@cd base && \
		forge script script/Deploy.s.sol:DeployScholarFiBridge \
			--rpc-url $(shell grep BASE_SEPOLIA_RPC ../.env | cut -d '=' -f2) \
			--private-key $(shell grep PRIVATE_KEY ../.env | cut -d '=' -f2) \
			--broadcast \
			--legacy
	@echo "$(GREEN)✓ ScholarFiBridge deployed to Base Sepolia$(NC)"

deploy-celo:
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Deploying to Celo Sepolia Testnet$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️  No .env file found in contracts/$(NC)"; \
		echo "$(YELLOW)Copy .env.example to .env and fill in values$(NC)"; \
		exit 1; \
	fi
	@cd celo && \
		forge script script/Deploy.s.sol:DeployScholarFi \
			--rpc-url $(shell grep CELO_RPC_URL ../.env | cut -d '=' -f2) \
			--private-key $(shell grep PRIVATE_KEY ../.env | cut -d '=' -f2) \
			--broadcast \
			--legacy
	@echo "$(GREEN)✓ ScholarFiVault deployed to Celo Sepolia$(NC)"

deploy-oasis:
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Deploying to Oasis Sapphire Testnet$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️  No .env file found in contracts/$(NC)"; \
		echo "$(YELLOW)Copy .env.example to .env and fill in values$(NC)"; \
		exit 1; \
	fi
	@cd oasis && \
		forge script script/Deploy.s.sol:DeployChildDataStore \
			--rpc-url $(shell grep SAPPHIRE_TESTNET_RPC ../.env | cut -d '=' -f2) \
			--private-key $(shell grep PRIVATE_KEY ../.env | cut -d '=' -f2) \
			--broadcast \
			--legacy
	@echo "$(GREEN)✓ ChildDataStore deployed to Oasis Sapphire$(NC)"

deploy-all: deploy-celo deploy-base deploy-oasis
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  ✓ All Contracts Deployed Successfully!$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Next Steps:$(NC)"
	@echo "1. Copy Base bridge address to .env (BASE_BRIDGE_ADDRESS)"
	@echo "2. Redeploy Celo vault with Base bridge address"
	@echo "3. Copy Celo vault address to .env (CELO_VAULT_ADDRESS)"
	@echo "4. Redeploy Base bridge with Celo vault address"
	@echo "5. Copy Oasis datastore address to .env (OASIS_DATASTORE_ADDRESS)"
	@echo "6. Copy all contract addresses to frontend/.env"
	@echo "7. Verify contracts (make verify-base verify-celo)"
	@echo "8. Test Hyperlane bridge and Self verification"
	@echo ""

verify-base:
	@echo "$(GREEN)Verifying Base contract on Basescan...$(NC)"
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(YELLOW)Usage: make verify-base CONTRACT_ADDRESS=0x... VAULT_ADDRESS=0x...$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(VAULT_ADDRESS)" ]; then \
		echo "$(YELLOW)Missing VAULT_ADDRESS parameter$(NC)"; \
		exit 1; \
	fi
	@cd base && \
		forge verify-contract \
			$(CONTRACT_ADDRESS) \
			src/ScholarFiBridge.sol:ScholarFiBridge \
			--chain-id 84532 \
			--etherscan-api-key $(shell grep BASESCAN_API_KEY ../.env | cut -d '=' -f2) \
			--constructor-args $(shell cast abi-encode "constructor(address,uint32,address)" "0x6966b0E55883d49BFB24539356a2f8A673E02039" "11142220" "$(VAULT_ADDRESS)")
	@echo "$(GREEN)✓ Contract verified on Basescan$(NC)"

verify-celo:
	@echo "$(GREEN)Verifying Celo contract on Celoscan...$(NC)"
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(YELLOW)Usage: make verify-celo CONTRACT_ADDRESS=0x... BRIDGE_ADDRESS=0x...$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(BRIDGE_ADDRESS)" ]; then \
		echo "$(YELLOW)Missing BRIDGE_ADDRESS parameter$(NC)"; \
		exit 1; \
	fi
	@cd celo && \
		forge verify-contract \
			$(CONTRACT_ADDRESS) \
			src/ScholarFiVault.sol:ScholarFiVault \
			--chain-id 11142220 \
			--etherscan-api-key $(shell grep CELOSCAN_API_KEY ../.env | cut -d '=' -f2) \
			--constructor-args $(shell cast abi-encode "constructor(address,string,address,address)" "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74" "scholar-fi-v1" "0xD0680F80F4f947968206806C2598Cbc5b6FE5b03" "$(BRIDGE_ADDRESS)")
	@echo "$(GREEN)✓ Contract verified on Celoscan$(NC)"

rofl:
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Starting ROFL Monitoring Service$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@if [ ! -f rofl/.env ]; then \
		echo "$(YELLOW)⚠️  No .env file found in rofl/$(NC)"; \
		echo "$(YELLOW)Create rofl/.env with contract addresses$(NC)"; \
		exit 1; \
	fi
	@cd rofl && cargo run --release

clean:
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	@cd base && forge clean
	@cd celo && forge clean
	@cd oasis && forge clean
	@cd rofl && cargo clean
	@echo "$(GREEN)✓ Clean complete$(NC)"

# Quick checks
check-env:
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️  Missing contracts/.env$(NC)"; \
		echo "$(YELLOW)Copy .env.example to .env and fill in values$(NC)"; \
		exit 1; \
	fi
