// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ParentDepositSplitter} from "../src/ParentDepositSplitter.sol";

/**
 * @title DeployParentDepositSplitter
 * @notice Deployment script for ParentDepositSplitter on Base Sepolia
 *
 * Usage:
 * forge script script/Deploy.s.sol:DeployParentDepositSplitter \
 *   --rpc-url $BASE_SEPOLIA_RPC \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast \
 *   --verify
 */
contract DeployParentDepositSplitter is Script {
    function run() external returns (ParentDepositSplitter) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ParentDepositSplitter (no constructor args)
        ParentDepositSplitter splitter = new ParentDepositSplitter();

        vm.stopBroadcast();

        // Log deployment info
        console.log("========================================");
        console.log("ParentDepositSplitter Deployed on Base Sepolia");
        console.log("========================================");
        console.log("Contract Address:", address(splitter));
        console.log("Owner:", splitter.owner());
        console.log("Vault Percentage:", splitter.VAULT_PERCENTAGE(), "%");
        console.log("Checking Percentage:", splitter.CHECKING_PERCENTAGE(), "%");
        console.log("========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Copy contract address to .env (BASE_SPLITTER_ADDRESS)");
        console.log("2. Configure Privy gas sponsorship on Base Sepolia");
        console.log("3. Setup backend webhook to listen for FundsDeposited events");
        console.log("4. Register child wallets via registerChildWallets()");
        console.log("5. Test deposit flow with depositForChild()");

        return splitter;
    }
}
