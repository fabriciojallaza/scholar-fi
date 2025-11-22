// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {ChildDataStore} from "../src/ChildDataStore.sol";

/**
 * @title DeployChildDataStore
 * @notice Deployment script for ChildDataStore on Oasis Sapphire Testnet
 *
 * Usage:
 * forge script script/Deploy.s.sol:DeployChildDataStore \
 *   --rpc-url $SAPPHIRE_TESTNET_RPC \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast
 */
contract DeployChildDataStore is Script {

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ChildDataStore
        ChildDataStore dataStore = new ChildDataStore();

        vm.stopBroadcast();

        // Log deployment info
        console.log("========================================");
        console.log("ChildDataStore Deployed on Oasis Sapphire Testnet");
        console.log("========================================");
        console.log("ChildDataStore:", address(dataStore));
        console.log("Owner:", dataStore.owner());
        console.log("========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Copy contract address to .env (OASIS_DATASTORE_ADDRESS)");
        console.log("2. Configure serverless webhooks to update child profiles");
        console.log("3. Grant backend access to record deposits and age verification");
        console.log("4. Test encrypted profile creation via serverless API");
        console.log("5. Verify confidential storage on Oasis Explorer");
    }
}
