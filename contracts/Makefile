.PHONY: help install build test deploy-celo deploy-oasis deploy-all verify-celo clean rofl

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
	@echo "  make deploy-celo    - Deploy ScholarFiVault to Celo Sepolia"
	@echo "  make deploy-oasis   - Deploy ChildDataStore to Oasis Sapphire"
	@echo "  make deploy-all     - Deploy to both chains"
	@echo ""
	@echo "$(YELLOW)Verification:$(NC)"
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
	@if ! command -v node > /dev/null 2>&1; then \
		echo "$(YELLOW)⚠️  Node.js not found. Please install from https://nodejs.org$(NC)"; \
		exit 1; \
	fi
	@if ! command -v forge > /dev/null 2>&1; then \
		echo "$(YELLOW)⚠️  Foundry not found. Install with:$(NC)"; \
		echo "$(YELLOW)   curl -L https://foundry.paradigm.xyz | bash$(NC)"; \
		echo "$(YELLOW)   foundryup$(NC)"; \
		exit 1; \
	fi
	@if ! command -v cargo > /dev/null 2>&1; then \
		echo "$(YELLOW)⚠️  Rust not found. Install with:$(NC)"; \
		echo "$(YELLOW)   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Installing Celo contracts dependencies...$(NC)"
	cd celo && npm install && forge install
	@echo "$(GREEN)Installing Oasis contracts dependencies...$(NC)"
	cd oasis && npm install && forge install
	@echo "$(GREEN)Installing ROFL service dependencies...$(NC)"
	cd rofl && cargo build
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

build:
	@echo "$(GREEN)Building Celo contracts...$(NC)"
	cd celo && forge build
	@echo "$(GREEN)Building Oasis contracts...$(NC)"
	cd oasis && forge build
	@echo "$(GREEN)Building ROFL service...$(NC)"
	cd rofl && cargo build --release
	@echo "$(GREEN)✓ All contracts compiled successfully$(NC)"

test:
	@echo "$(GREEN)Testing Celo contracts...$(NC)"
	cd celo && forge test
	@echo "$(GREEN)Testing Oasis contracts...$(NC)"
	cd oasis && forge test
	@echo "$(GREEN)✓ All tests passed$(NC)"

deploy-celo:
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Deploying to Celo Sepolia Testnet$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@if [ ! -f celo/.env ]; then \
		echo "$(YELLOW)⚠️  No .env file found in celo/$(NC)"; \
		echo "$(YELLOW)Copy celo/.env.example to celo/.env and fill in values$(NC)"; \
		exit 1; \
	fi
	cd celo && \
	forge script script/Deploy.s.sol:DeployScholarFi \
		--rpc-url $(shell grep CELO_RPC_URL celo/.env | cut -d '=' -f2) \
		--private-key $(shell grep PRIVATE_KEY celo/.env | cut -d '=' -f2) \
		--broadcast \
		--legacy
	@echo "$(GREEN)✓ ScholarFiVault deployed to Celo$(NC)"

deploy-oasis:
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Deploying to Oasis Sapphire Testnet$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@if [ ! -f oasis/.env ]; then \
		echo "$(YELLOW)⚠️  No .env file found in oasis/$(NC)"; \
		echo "$(YELLOW)Copy oasis/.env.example to oasis/.env and fill in values$(NC)"; \
		exit 1; \
	fi
	cd oasis && \
	forge script script/Deploy.s.sol:DeployChildDataStore \
		--rpc-url $(shell grep SAPPHIRE_TESTNET_RPC oasis/.env | cut -d '=' -f2) \
		--private-key $(shell grep PRIVATE_KEY oasis/.env | cut -d '=' -f2) \
		--broadcast \
		--legacy
	@echo "$(GREEN)✓ ChildDataStore deployed to Oasis Sapphire$(NC)"

deploy-all: deploy-celo deploy-oasis
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  ✓ All Contracts Deployed Successfully!$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Next Steps:$(NC)"
	@echo "1. Copy contract addresses to frontend config"
	@echo "2. Update ROFL service .env with addresses"
	@echo "3. Verify contracts (make verify-celo)"
	@echo "4. Test with Privy gas sponsorship"
	@echo ""

verify-celo:
	@echo "$(GREEN)Verifying Celo contract on Celoscan...$(NC)"
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(YELLOW)Usage: make verify-celo CONTRACT_ADDRESS=0x...$(NC)"; \
		exit 1; \
	fi
	cd celo && \
	forge verify-contract \
		$(CONTRACT_ADDRESS) \
		src/ScholarFiVault.sol:ScholarFiVault \
		--chain-id 11142220 \
		--etherscan-api-key $(shell grep CELOSCAN_API_KEY celo/.env | cut -d '=' -f2) \
		--constructor-args $(shell cast abi-encode "constructor(address,string)" "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74" "scholar-fi-v1")
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
	cd rofl && cargo run --release

clean:
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	cd celo && forge clean
	cd oasis && forge clean
	cd rofl && cargo clean
	@echo "$(GREEN)✓ Clean complete$(NC)"

# Quick checks
check-env-celo:
	@if [ ! -f celo/.env ]; then \
		echo "$(YELLOW)⚠️  Missing celo/.env$(NC)"; \
		exit 1; \
	fi

check-env-oasis:
	@if [ ! -f oasis/.env ]; then \
		echo "$(YELLOW)⚠️  Missing oasis/.env$(NC)"; \
		exit 1; \
	fi
