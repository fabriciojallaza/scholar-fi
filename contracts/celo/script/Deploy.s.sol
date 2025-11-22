// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {ScholarFiVault} from "../src/ScholarFiVault.sol";

/**
 * @title DeployScholarFi
 * @notice Deployment script for ScholarFiVault on Celo Sepolia Testnet
 *
 * Usage:
 * forge script script/Deploy.s.sol:DeployScholarFi \
 *   --rpc-url $CELO_RPC_URL \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast \
 *   --verify
 */
contract DeployScholarFi is Script {

    // Celo Sepolia Testnet addresses
    address constant SELF_HUB_V2_SEPOLIA = 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74;
    address constant HYPERLANE_MAILBOX_SEPOLIA = 0xD0680F80F4f947968206806C2598Cbc5b6FE5b03;
    string constant SCOPE_SEED = "scholar-fi-v1";

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address baseBridgeAddress = vm.envAddress("BASE_BRIDGE_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ScholarFiVault
        ScholarFiVault vault = new ScholarFiVault(
            SELF_HUB_V2_SEPOLIA,
            SCOPE_SEED,
            HYPERLANE_MAILBOX_SEPOLIA,
            baseBridgeAddress
        );

        vm.stopBroadcast();

        // Log deployment info
        console.log("========================================");
        console.log("Scholar-Fi Deployed on Celo Sepolia");
        console.log("========================================");
        console.log("ScholarFiVault:", address(vault));
        console.log("Self Hub V2:", SELF_HUB_V2_SEPOLIA);
        console.log("Hyperlane Mailbox:", HYPERLANE_MAILBOX_SEPOLIA);
        console.log("Base Bridge:", baseBridgeAddress);
        console.log("Scope Seed:", SCOPE_SEED);
        console.log("Scope (computed):", vault.scope());
        console.log("Config ID:", vm.toString(vault.verificationConfigId()));
        console.log("========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Update Base Sepolia bridge with this vault address");
        console.log("2. Update frontend with both contract addresses");
        console.log("3. Whitelist educational institutions");
        console.log("4. Test Hyperlane bridge from Base to Celo");
        console.log("5. Verify contracts on explorers");
    }
}
