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
    string constant SCOPE_SEED = "scholar-fi-v1";

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ScholarFiVault
        ScholarFiVault vault = new ScholarFiVault(
            SELF_HUB_V2_SEPOLIA,
            SCOPE_SEED
        );

        vm.stopBroadcast();

        // Log deployment info
        console.log("========================================");
        console.log("Scholar-Fi Deployed on Celo Sepolia");
        console.log("========================================");
        console.log("ScholarFiVault:", address(vault));
        console.log("Self Hub V2:", SELF_HUB_V2_SEPOLIA);
        console.log("Scope Seed:", SCOPE_SEED);
        console.log("Scope (computed):", vault.scope());
        console.log("Config ID:", vm.toString(vault.verificationConfigId()));
        console.log("========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Update frontend with contract address");
        console.log("2. Whitelist educational institutions");
        console.log("3. Test with Privy gas sponsorship");
        console.log("4. Verify contract on Celoscan");
    }
}
