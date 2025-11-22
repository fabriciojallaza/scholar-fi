// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ScholarFiBridge} from "../src/ScholarFiBridge.sol";

contract DeployScholarFiBridge is Script {
    function run() external returns (ScholarFiBridge) {
        // Load environment variables from ../contracts/.env
        address mailbox = vm.envAddress("BASE_HYPERLANE_MAILBOX");
        uint32 celoDomain = uint32(vm.envUint("CELO_DOMAIN"));
        address celoVaultAddress = vm.envAddress("CELO_VAULT_ADDRESS");

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        ScholarFiBridge bridge = new ScholarFiBridge(
            mailbox,
            celoDomain,
            celoVaultAddress
        );

        console.log("ScholarFiBridge deployed to:", address(bridge));
        console.log("Hyperlane Mailbox:", mailbox);
        console.log("Celo Domain:", celoDomain);
        console.log("Celo Vault Address:", celoVaultAddress);

        vm.stopBroadcast();

        return bridge;
    }
}
