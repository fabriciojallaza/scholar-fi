// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";

/**
 * @title ScholarFiAgeVerifier
 * @notice Age verification contract using Self Protocol for Scholar-Fi
 * @dev Lightweight verification-only contract on Celo Sepolia
 * @dev Deposits happen on Base Sepolia, this only handles ZK proof verification
 * @dev Backend webhook listens for ChildVerified event to update Privy policies on Base
 *
 * Track Compliance:
 * - Self Track: On-chain age verification (18+) via SelfVerificationRoot
 * - Privy Track: Wallet policies updated via backend after verification
 * - Oasis Track: Metadata updated when verification completes
 */
contract ScholarFiAgeVerifier is SelfVerificationRoot {

    // ============ Structs ============

    struct ChildVerification {
        address childAddress;      // Child's unique address
        address parentAddress;     // Parent's address
        bool isVerified;           // Age 18+ verified via Self
        uint256 verifiedAt;        // Timestamp of verification
    }

    // ============ State Variables ============

    mapping(address => ChildVerification) public children;

    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;

    address public immutable owner;

    // ============ Events ============

    event ChildRegistered(
        address indexed childAddress,
        address indexed parentAddress,
        uint256 timestamp
    );

    event ChildVerified(
        address indexed childAddress,
        address indexed parentAddress,
        uint256 timestamp,
        ISelfVerificationRoot.GenericDiscloseOutputV2 output
    );

    // ============ Errors ============

    error ChildNotRegistered();
    error ChildAlreadyRegistered();
    error AlreadyVerified();
    error ZeroAddress();
    error NotOwner();
    error NotParent();

    // ============ Constructor ============

    /**
     * @notice Deploy ScholarFiAgeVerifier with Self age verification
     * @param identityVerificationHubV2Address Self Hub V2 on Celo Sepolia: 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
     * @param scopeSeed Unique scope identifier (max 31 bytes ASCII, e.g., "scholar-fi-v1")
     */
    constructor(
        address identityVerificationHubV2Address,
        string memory scopeSeed
    )
        SelfVerificationRoot(identityVerificationHubV2Address, scopeSeed)
    {
        owner = msg.sender;

        // Configure Self verification: 18+ years old, no country restrictions
        SelfUtils.UnformattedVerificationConfigV2 memory rawConfig =
            SelfUtils.UnformattedVerificationConfigV2({
                olderThan: 18,
                forbiddenCountries: new string[](0),
                ofacEnabled: false
            });

        verificationConfig = SelfUtils.formatVerificationConfigV2(rawConfig);
        verificationConfigId = IIdentityVerificationHubV2(identityVerificationHubV2Address)
            .setVerificationConfigV2(verificationConfig);
    }

    // ============ External Functions ============

    /**
     * @notice Register child for age verification (called by parent or backend)
     * @param childAddress Child's unique address (matches Base wallet system)
     * @param parentAddress Parent's wallet address
     * @dev Must be called before child can verify age via Self
     */
    function registerChild(
        address childAddress,
        address parentAddress
    ) external {
        if (childAddress == address(0)) revert ZeroAddress();
        if (parentAddress == address(0)) revert ZeroAddress();
        if (children[childAddress].parentAddress != address(0)) revert ChildAlreadyRegistered();

        children[childAddress] = ChildVerification({
            childAddress: childAddress,
            parentAddress: parentAddress,
            isVerified: false,
            verifiedAt: 0
        });

        emit ChildRegistered(childAddress, parentAddress, block.timestamp);
    }

    // ============ Self Verification Hook ============

    /**
     * @notice Called automatically after successful Self age verification
     * @param output Verification output from Self Hub
     * @param userData User-defined data (child address encoded)
     * @dev This function is called by SelfVerificationRoot after ZK proof verification
     * @dev Emits ChildVerified event that backend webhook listens to
     * @dev Backend then updates Privy wallet policy to unlock vault on Base
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        address childAddress = abi.decode(userData, (address));

        ChildVerification storage child = children[childAddress];
        if (child.childAddress == address(0)) revert ChildNotRegistered();
        if (child.isVerified) revert AlreadyVerified();

        // Mark as verified
        child.isVerified = true;
        child.verifiedAt = block.timestamp;

        // Emit event for backend webhook
        // Backend will:
        // 1. Listen for this event on Celo
        // 2. Call Privy API to update vault wallet policy on Base
        // 3. Transfer ownership from parent to child
        emit ChildVerified(childAddress, child.parentAddress, block.timestamp, output);
    }

    /**
     * @notice Returns the verification config ID for Self Hub
     * @dev Required override from SelfVerificationRoot
     */
    function getConfigId(
        bytes32 /* destinationChainId */,
        bytes32 /* userIdentifier */,
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    // ============ View Functions ============

    /**
     * @notice Get child verification status
     * @param childAddress Child's unique address
     * @return child Child verification struct
     */
    function getChildVerification(address childAddress)
        external
        view
        returns (ChildVerification memory child)
    {
        return children[childAddress];
    }

    /**
     * @notice Check if child is verified
     * @param childAddress Child's unique address
     * @return True if age verified
     */
    function isChildVerified(address childAddress) external view returns (bool) {
        return children[childAddress].isVerified;
    }

    /**
     * @notice Get current verification config
     * @return configId Configuration ID
     * @return minAge Minimum age requirement
     */
    function getVerificationConfig() external view returns (
        bytes32 configId,
        uint256 minAge
    ) {
        return (verificationConfigId, 18);
    }
}
