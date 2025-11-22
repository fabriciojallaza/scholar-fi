// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {ScholarFiAgeVerifier} from "../src/ScholarFiAgeVerifier.sol";

/**
 * @title DeployScholarFiAgeVerifier
 * @notice Deployment script for ScholarFiAgeVerifier on Celo Sepolia Testnet
 *
 * Usage:
 * forge script script/Deploy.s.sol:DeployScholarFiAgeVerifier \
 *   --rpc-url $CELO_RPC_URL \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast \
 *   --verify
 */
contract DeployScholarFiAgeVerifier is Script {

    // Celo Sepolia Testnet addresses
    address constant SELF_HUB_V2_SEPOLIA = 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74;
    string constant SCOPE_SEED = "scholar-fi-v1";

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ScholarFiAgeVerifier
        ScholarFiAgeVerifier verifier = new ScholarFiAgeVerifier(
            SELF_HUB_V2_SEPOLIA,
            SCOPE_SEED
        );

        vm.stopBroadcast();

        // Log deployment info
        console.log("========================================");
        console.log("ScholarFiAgeVerifier Deployed on Celo Sepolia");
        console.log("========================================");
        console.log("Contract Address:", address(verifier));
        console.log("Self Hub V2:", SELF_HUB_V2_SEPOLIA);
        console.log("Scope Seed:", SCOPE_SEED);
        console.log("Scope (computed):", verifier.scope());
        console.log("Config ID:", vm.toString(verifier.verificationConfigId()));
        console.log("Owner:", verifier.owner());
        console.log("========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Copy contract address to .env (CELO_VERIFIER_ADDRESS)");
        console.log("2. Setup backend webhook to listen for ChildVerified events");
        console.log("3. Register children via registerChild(childAddress, parentAddress)");
        console.log("4. Child scans QR code in Self app to verify age 18+");
        console.log("5. Backend updates Privy policy on Base when verification completes");
    }
}
