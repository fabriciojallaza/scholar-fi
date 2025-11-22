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
        console.log("1. Update ROFL service with contract address");
        console.log("2. Grant ROFL service access to update vault growth");
        console.log("3. Test encrypted storage from frontend");
        console.log("4. Verify on Oasis Explorer");
    }
}
