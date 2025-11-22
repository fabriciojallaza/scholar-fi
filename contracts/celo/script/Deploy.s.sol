// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {ScholarFiVault} from "../src/ScholarFiVault.sol";

/**
 * @title DeployScholarFi
 * @notice Deployment script for ScholarFiVault on Celo Alfajores
 *
 * Usage:
 * forge script script/Deploy.s.sol:DeployScholarFi \
 *   --rpc-url $CELO_RPC_URL \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast \
 *   --verify
 */
contract DeployScholarFi is Script {

    // Celo Alfajores Testnet addresses
    address constant SELF_HUB_V2_ALFAJORES = 0x68c931C9a534D37aa78094877F46fE46a49F1A51;
    string constant SCOPE_SEED = "scholar-fi-v1";

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ScholarFiVault
        ScholarFiVault vault = new ScholarFiVault(
            SELF_HUB_V2_ALFAJORES,
            SCOPE_SEED
        );

        vm.stopBroadcast();

        // Log deployment info
        console.log("========================================");
        console.log("Scholar-Fi Deployed on Celo Alfajores");
        console.log("========================================");
        console.log("ScholarFiVault:", address(vault));
        console.log("Self Hub V2:", SELF_HUB_V2_ALFAJORES);
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
