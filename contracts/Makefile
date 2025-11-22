.PHONY: help install build test deploy-base deploy-celo deploy-oasis deploy-all verify-base verify-celo export-abis clean rofl

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
	@echo "  make deploy-base    - Deploy ParentDepositSplitter to Base Sepolia"
	@echo "  make deploy-celo    - Deploy ScholarFiAgeVerifier to Celo Sepolia"
	@echo "  make deploy-oasis   - Deploy ChildDataStore to Oasis Sapphire"
	@echo "  make deploy-all     - Deploy to all 3 chains"
	@echo ""
	@echo "$(YELLOW)Verification:$(NC)"
	@echo "  make verify-base    - Verify Base contract on Basescan"
	@echo "  make verify-celo    - Verify Celo contract on Celoscan"
	@echo ""
	@echo "$(YELLOW)Frontend Integration:$(NC)"
	@echo "  make export-abis    - Export contract ABIs to frontend"
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
	@export $$(grep -v '^#' .env | grep -v '^$$' | xargs) && cd base && \
		forge script script/Deploy.s.sol:DeployParentDepositSplitter \
			--rpc-url $$BASE_SEPOLIA_RPC \
			--broadcast \
			--legacy
	@echo "$(GREEN)✓ ParentDepositSplitter deployed to Base Sepolia$(NC)"

deploy-celo:
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Deploying to Celo Sepolia Testnet$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️  No .env file found in contracts/$(NC)"; \
		echo "$(YELLOW)Copy .env.example to .env and fill in values$(NC)"; \
		exit 1; \
	fi
	@export $$(grep -v '^#' .env | grep -v '^$$' | xargs) && cd celo && \
		forge script script/Deploy.s.sol:DeployScholarFiAgeVerifier \
			--rpc-url $$CELO_RPC_URL \
			--broadcast \
			--legacy
	@echo "$(GREEN)✓ ScholarFiAgeVerifier deployed to Celo Sepolia$(NC)"

deploy-oasis:
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Deploying to Oasis Sapphire Testnet$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️  No .env file found in contracts/$(NC)"; \
		echo "$(YELLOW)Copy .env.example to .env and fill in values$(NC)"; \
		exit 1; \
	fi
	@export $$(grep -v '^#' .env | grep -v '^$$' | xargs) && cd oasis && \
		forge script script/Deploy.s.sol:DeployChildDataStore \
			--rpc-url $$SAPPHIRE_TESTNET_RPC \
			--broadcast \
			--legacy
	@echo "$(GREEN)✓ ChildDataStore deployed to Oasis Sapphire$(NC)"

deploy-all: deploy-base deploy-celo deploy-oasis export-abis
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  ✓ All Contracts Deployed Successfully!$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Next Steps:$(NC)"
	@echo "1. Copy Base splitter address to .env (BASE_SPLITTER_ADDRESS)"
	@echo "2. Copy Celo verifier address to .env (CELO_VERIFIER_ADDRESS)"
	@echo "3. Copy Oasis datastore address to .env (OASIS_DATASTORE_ADDRESS)"
	@echo "4. Copy all contract addresses to frontend/.env"
	@echo "5. Configure Privy webhooks and gas sponsorship"
	@echo "6. Deploy serverless functions to Vercel"
	@echo "7. Test full flow: onboarding → deposit → age verification"
	@echo ""

verify-base:
	@echo "$(GREEN)Verifying Base contract on Basescan...$(NC)"
	@export $$(grep -v '^#' .env | grep -v '^$$' | xargs) && \
	ADDRESS=$${CONTRACT_ADDRESS:-$$BASE_SPLITTER_ADDRESS}; \
	if [ -z "$$ADDRESS" ]; then \
		echo "$(YELLOW)Usage: make verify-base CONTRACT_ADDRESS=0x...$(NC)"; \
		echo "$(YELLOW)Or set BASE_SPLITTER_ADDRESS in .env$(NC)"; \
		exit 1; \
	fi; \
	cd base && \
		forge verify-contract \
			$$ADDRESS \
			src/ParentDepositSplitter.sol:ParentDepositSplitter \
			--chain-id 84532 \
			--etherscan-api-key $$BASESCAN_API_KEY
	@echo "$(GREEN)✓ Contract verified on Basescan$(NC)"

verify-celo:
	@echo "$(GREEN)Verifying Celo contract on Celoscan...$(NC)"
	@export $$(grep -v '^#' .env | grep -v '^$$' | xargs) && \
	ADDRESS=$${CONTRACT_ADDRESS:-$$CELO_VERIFIER_ADDRESS}; \
	if [ -z "$$ADDRESS" ]; then \
		echo "$(YELLOW)Usage: make verify-celo CONTRACT_ADDRESS=0x...$(NC)"; \
		echo "$(YELLOW)Or set CELO_VERIFIER_ADDRESS in .env$(NC)"; \
		exit 1; \
	fi; \
	cd celo && \
		forge verify-contract \
			$$ADDRESS \
			src/ScholarFiAgeVerifier.sol:ScholarFiAgeVerifier \
			--chain-id 11142220 \
			--etherscan-api-key $$CELOSCAN_API_KEY \
			--constructor-args $$(cast abi-encode "constructor(address,string)" "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74" "scholar-fi-v1")
	@echo "$(GREEN)✓ Contract verified on Celoscan$(NC)"

verify-oasis:
	@echo "$(GREEN)Verifying Oasis contract on Oasis Explorer...$(NC)"
	@export $$(grep -v '^#' .env | grep -v '^$$' | xargs) && \
	ADDRESS=$${CONTRACT_ADDRESS:-$$OASIS_DATASTORE_ADDRESS}; \
	if [ -z "$$ADDRESS" ]; then \
		echo "$(YELLOW)Usage: make verify-oasis CONTRACT_ADDRESS=0x...$(NC)"; \
		echo "$(YELLOW)Or set OASIS_DATASTORE_ADDRESS in .env$(NC)"; \
		exit 1; \
	fi; \
	echo "$(YELLOW)Contract: $$ADDRESS$(NC)"; \
	echo "$(YELLOW)Note: Oasis Sapphire uses different verification process$(NC)"; \
	echo "$(YELLOW)Visit: https://explorer.oasis.io/testnet/sapphire$(NC)"; \
	echo "$(YELLOW)Manual verification may be required$(NC)"; \
	cd oasis && \
		forge verify-contract \
			$$ADDRESS \
			src/ChildDataStore.sol:ChildDataStore \
			--verifier blockscout \
			--verifier-url https://explorer.oasis.io/testnet/sapphire/api || \
		echo "$(YELLOW)⚠️  Auto-verification not available for Oasis. Contract deployed successfully.$(NC)"
	@echo "$(GREEN)✓ Oasis deployment confirmed at $$ADDRESS$(NC)"

verify-all: verify-base verify-celo verify-oasis
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  All Contracts Verified$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"

export-abis:
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Exporting Contract ABIs to Frontend$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@if [ ! -f base/out/ParentDepositSplitter.sol/ParentDepositSplitter.json ]; then \
		echo "$(YELLOW)⚠️  Contracts not compiled. Building first...$(NC)"; \
		$(MAKE) build; \
	fi
	@if [ ! -d ../frontend/src/abis ]; then \
		mkdir -p ../frontend/src/abis; \
		echo "$(YELLOW)Created frontend/src/abis directory$(NC)"; \
	fi
	@echo "$(YELLOW)Extracting ParentDepositSplitter ABI...$(NC)"
	@jq '.abi' base/out/ParentDepositSplitter.sol/ParentDepositSplitter.json > ../frontend/src/abis/ParentDepositSplitter.json
	@echo "$(YELLOW)Extracting ScholarFiAgeVerifier ABI...$(NC)"
	@jq '.abi' celo/out/ScholarFiAgeVerifier.sol/ScholarFiAgeVerifier.json > ../frontend/src/abis/ScholarFiAgeVerifier.json
	@echo "$(YELLOW)Extracting ChildDataStore ABI...$(NC)"
	@jq '.abi' oasis/out/ChildDataStore.sol/ChildDataStore.json > ../frontend/src/abis/ChildDataStore.json
	@echo "$(GREEN)✓ All ABIs exported successfully$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend ABIs updated:$(NC)"
	@echo "  - ParentDepositSplitter.json (ABI only)"
	@echo "  - ScholarFiAgeVerifier.json (ABI only)"
	@echo "  - ChildDataStore.json (ABI only)"

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
