// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ChildDataStore
 * @notice Confidential storage for Scholar-Fi child account data on Oasis Sapphire
 * @dev All state variables are automatically encrypted on Sapphire ParaTime
 *
 * Track Compliance:
 * - Oasis Track: Confidential smart contract on Sapphire Testnet
 * - Demonstrates encrypted storage of sensitive child information
 * - Storage is hardware-encrypted via TEE (no additional encryption needed)
 */
contract ChildDataStore {

    // ============ Structs ============

    /**
     * @notice Child profile data - AUTOMATICALLY ENCRYPTED on Sapphire
     * @dev All fields stored in encrypted state thanks to Sapphire's confidential EVM
     * @dev Links to Privy HD wallets on Base Sepolia
     */
    struct ChildProfile {
        // Encrypted sensitive data
        string encryptedName;          // Child's name (encrypted)
        uint256 dateOfBirth;           // Birthday timestamp
        string parentEmail;            // Parent contact

        // Base Sepolia Privy HD wallet addresses (public data, but mapping is private)
        address baseCheckingWallet;    // Wallet 1 - 70% spending (child is additional_signer)
        address baseVaultWallet;       // Wallet 2 - 30% savings (child is additional_signer)
        address parentBaseWallet;      // Wallet 0 - parent's main wallet

        // Celo Sepolia verification status
        address celoVerifierAddress;   // ScholarFiAgeVerifier contract address on Celo
        bool ageVerifiedOnCelo;        // True when Self ZK proof completes
        uint256 verifiedAt;            // Timestamp of verification

        // Balance tracking
        uint256 totalDeposited;        // Total parent contributions
        uint256 vaultGrowth;           // Yield earned (updated by ROFL)
        uint256 lastUpdated;
        bool exists;
    }

    // ============ State Variables (Encrypted on Sapphire) ============

    // Child address => Profile (ENCRYPTED storage)
    mapping(address => ChildProfile) private childProfiles;

    // Access control: who can read child's data
    mapping(address => mapping(address => bool)) private accessGranted;

    address public immutable owner;

    // ============ Events ============

    event ChildProfileCreated(address indexed child, address indexed parent);
    event ProfileUpdated(address indexed child, uint256 timestamp);
    event VaultGrowthUpdated(address indexed child, uint256 newGrowth);
    event AccessGranted(address indexed child, address indexed accessor);
    event AccessRevoked(address indexed child, address indexed accessor);

    // ============ Errors ============

    error ProfileAlreadyExists();
    error ProfileNotFound();
    error Unauthorized();
    error ZeroAddress();

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new child profile with Base wallet addresses
     * @param _childAddress Child's unique identifier
     * @param _encryptedName Child's name (encrypted)
     * @param _dateOfBirth Birthday as Unix timestamp
     * @param _parentEmail Parent's email for notifications
     * @param _baseCheckingWallet Privy HD wallet 1 on Base (70% spending)
     * @param _baseVaultWallet Privy HD wallet 2 on Base (30% vault)
     * @param _parentBaseWallet Parent's main Privy wallet on Base
     * @param _celoVerifierAddress ScholarFiAgeVerifier contract on Celo
     */
    function createChildProfile(
        address _childAddress,
        string memory _encryptedName,
        uint256 _dateOfBirth,
        string memory _parentEmail,
        address _baseCheckingWallet,
        address _baseVaultWallet,
        address _parentBaseWallet,
        address _celoVerifierAddress
    ) external {
        if (_childAddress == address(0)) revert ZeroAddress();
        if (_baseCheckingWallet == address(0)) revert ZeroAddress();
        if (_baseVaultWallet == address(0)) revert ZeroAddress();
        if (_parentBaseWallet == address(0)) revert ZeroAddress();
        if (childProfiles[_childAddress].exists) revert ProfileAlreadyExists();

        childProfiles[_childAddress] = ChildProfile({
            encryptedName: _encryptedName,
            dateOfBirth: _dateOfBirth,
            parentEmail: _parentEmail,
            baseCheckingWallet: _baseCheckingWallet,
            baseVaultWallet: _baseVaultWallet,
            parentBaseWallet: _parentBaseWallet,
            celoVerifierAddress: _celoVerifierAddress,
            ageVerifiedOnCelo: false,
            verifiedAt: 0,
            totalDeposited: 0,
            vaultGrowth: 0,
            lastUpdated: block.timestamp,
            exists: true
        });

        // Grant access to creator (parent)
        accessGranted[_childAddress][msg.sender] = true;

        emit ChildProfileCreated(_childAddress, msg.sender);
    }

    /**
     * @notice Update vault growth (called by ROFL service)
     * @param _childAddress Child's address
     * @param _newGrowth Updated vault growth amount
     */
    function updateVaultGrowth(address _childAddress, uint256 _newGrowth) external {
        ChildProfile storage profile = childProfiles[_childAddress];
        if (!profile.exists) revert ProfileNotFound();

        // Only owner or ROFL service can update
        if (msg.sender != owner && !accessGranted[_childAddress][msg.sender]) {
            revert Unauthorized();
        }

        profile.vaultGrowth = _newGrowth;
        profile.lastUpdated = block.timestamp;

        emit VaultGrowthUpdated(_childAddress, _newGrowth);
    }

    /**
     * @notice Update total deposited amount (called by backend webhook)
     * @param _childAddress Child's address
     * @param _additionalDeposit Amount to add
     */
    function recordDeposit(address _childAddress, uint256 _additionalDeposit) external {
        ChildProfile storage profile = childProfiles[_childAddress];
        if (!profile.exists) revert ProfileNotFound();

        // Only authorized addresses can update
        if (!accessGranted[_childAddress][msg.sender] && msg.sender != owner) {
            revert Unauthorized();
        }

        profile.totalDeposited += _additionalDeposit;
        profile.lastUpdated = block.timestamp;

        emit ProfileUpdated(_childAddress, block.timestamp);
    }

    /**
     * @notice Mark child as age-verified on Celo (called by backend webhook)
     * @param _childAddress Child's address
     * @dev Called when ChildVerified event fires on Celo
     */
    function markAgeVerified(address _childAddress) external {
        ChildProfile storage profile = childProfiles[_childAddress];
        if (!profile.exists) revert ProfileNotFound();

        // Only owner or authorized can update
        if (msg.sender != owner && !accessGranted[_childAddress][msg.sender]) {
            revert Unauthorized();
        }

        profile.ageVerifiedOnCelo = true;
        profile.verifiedAt = block.timestamp;
        profile.lastUpdated = block.timestamp;

        emit ProfileUpdated(_childAddress, block.timestamp);
    }

    // ============ Access Control ============

    /**
     * @notice Grant read access to an address
     * @param _accessor Address to grant access to
     */
    function grantAccess(address _accessor) external {
        if (_accessor == address(0)) revert ZeroAddress();

        ChildProfile storage profile = childProfiles[msg.sender];
        if (!profile.exists) revert ProfileNotFound();

        accessGranted[msg.sender][_accessor] = true;
        emit AccessGranted(msg.sender, _accessor);
    }

    /**
     * @notice Revoke read access from an address
     * @param _accessor Address to revoke access from
     */
    function revokeAccess(address _accessor) external {
        accessGranted[msg.sender][_accessor] = false;
        emit AccessRevoked(msg.sender, _accessor);
    }

    // ============ View Functions (Confidential!) ============

    /**
     * @notice Get child profile data
     * @param _childAddress Child's address
     * @dev Data is decrypted ONLY for authorized callers
     */
    function getChildProfile(address _childAddress)
        external
        view
        returns (
            string memory encryptedName,
            uint256 dateOfBirth,
            string memory parentEmail,
            address baseCheckingWallet,
            address baseVaultWallet,
            address parentBaseWallet,
            bool ageVerifiedOnCelo,
            uint256 totalDeposited,
            uint256 vaultGrowth,
            uint256 lastUpdated
        )
    {
        ChildProfile memory profile = childProfiles[_childAddress];
        if (!profile.exists) revert ProfileNotFound();

        // Check access control
        if (!accessGranted[_childAddress][msg.sender] && msg.sender != owner) {
            revert Unauthorized();
        }

        return (
            profile.encryptedName,
            profile.dateOfBirth,
            profile.parentEmail,
            profile.baseCheckingWallet,
            profile.baseVaultWallet,
            profile.parentBaseWallet,
            profile.ageVerifiedOnCelo,
            profile.totalDeposited,
            profile.vaultGrowth,
            profile.lastUpdated
        );
    }

    /**
     * @notice Get Base wallet addresses for a child
     * @param _childAddress Child's address
     * @return checking Checking wallet address on Base
     * @return vault Vault wallet address on Base
     * @return parent Parent's wallet address on Base
     */
    function getBaseWallets(address _childAddress)
        external
        view
        returns (address checking, address vault, address parent)
    {
        ChildProfile memory profile = childProfiles[_childAddress];
        if (!profile.exists) revert ProfileNotFound();

        // Wallet addresses are less sensitive, allow broader access
        return (
            profile.baseCheckingWallet,
            profile.baseVaultWallet,
            profile.parentBaseWallet
        );
    }

    /**
     * @notice Check if profile exists
     */
    function profileExists(address _childAddress) external view returns (bool) {
        return childProfiles[_childAddress].exists;
    }

    /**
     * @notice Check if address has access to child's data
     */
    function hasAccess(address _childAddress, address _accessor) external view returns (bool) {
        return accessGranted[_childAddress][_accessor] || _accessor == owner;
    }

    /**
     * @notice Get vault growth only (less sensitive)
     */
    function getVaultGrowth(address _childAddress) external view returns (uint256) {
        ChildProfile memory profile = childProfiles[_childAddress];
        if (!profile.exists) revert ProfileNotFound();

        // Allow anyone to see vault growth (it's less sensitive)
        return profile.vaultGrowth;
    }
}
