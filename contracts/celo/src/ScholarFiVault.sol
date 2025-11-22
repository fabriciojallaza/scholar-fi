// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";
import {IMailbox} from "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";

/**
 * @title ScholarFiVault
 * @notice Educational savings vault for children with age-gated access via Self verification
 * @dev Integrates Self Protocol for 18+ age verification on Celo Sepolia
 * @dev Receives cross-chain deposits from Base Sepolia via Hyperlane
 *
 * Track Compliance:
 * - Self Track: On-chain age verification (18+) via SelfVerificationRoot
 * - Privy Track: Frontend gas sponsorship on Base Sepolia (configured in Privy dashboard)
 * - Hyperlane Track: Cross-chain messaging from Base Sepolia to Celo Sepolia
 */
contract ScholarFiVault is SelfVerificationRoot {

    // ============ Structs ============

    struct ChildAccount {
        address childWallet;
        address parentWallet;
        uint256 vaultBalance;      // Locked until age 18
        uint256 spendingBalance;   // Available for whitelisted spending
        bool isVerified;           // Age verified via Self
        uint256 createdAt;
    }

    // ============ State Variables ============

    mapping(address => ChildAccount) public children;
    mapping(address => bool) public whitelistedInstitutions;

    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;

    uint256 public constant VAULT_PERCENTAGE = 30;     // 30% to locked vault
    uint256 public constant SPENDING_PERCENTAGE = 70;   // 70% to spending balance

    address public immutable owner;
    IMailbox public immutable mailbox;
    address public immutable bridgeAddress;  // Base Sepolia bridge address

    // ============ Events ============

    event ChildAccountCreated(
        address indexed child,
        address indexed parent,
        uint256 timestamp
    );

    event FundsDeposited(
        address indexed child,
        address indexed parent,
        uint256 totalAmount,
        uint256 vaultAmount,
        uint256 spendingAmount
    );

    event VaultUnlocked(
        address indexed child,
        uint256 amount,
        uint256 timestamp
    );

    event WhitelistPayment(
        address indexed child,
        address indexed recipient,
        uint256 amount
    );

    event InstitutionWhitelisted(
        address indexed institution,
        bool status
    );

    event AgeVerificationCompleted(
        address indexed child,
        ISelfVerificationRoot.GenericDiscloseOutputV2 output
    );

    // ============ Errors ============

    error AccountAlreadyExists();
    error AccountNotFound();
    error NotParent();
    error NotWhitelisted();
    error InsufficientBalance();
    error AlreadyVerified();
    error NotOwner();
    error ZeroAmount();
    error ZeroAddress();
    error NotMailbox();
    error UnauthorizedSender();

    // ============ Modifiers ============

    /**
     * @notice Only accept messages from the Hyperlane Mailbox
     */
    modifier onlyMailbox() {
        if (msg.sender != address(mailbox)) revert NotMailbox();
        _;
    }

    // ============ Constructor ============

    /**
     * @notice Deploy ScholarFiVault with Self age verification and Hyperlane receiver
     * @param identityVerificationHubV2Address Self Hub V2 on Celo Sepolia: 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
     * @param scopeSeed Unique scope identifier (max 31 bytes ASCII, e.g., "scholar-fi-v1")
     * @param mailboxAddress Hyperlane Mailbox on Celo Sepolia: 0xD0680F80F4f947968206806C2598Cbc5b6FE5b03
     * @param bridgeAddr ScholarFiBridge address on Base Sepolia (to validate sender)
     */
    constructor(
        address identityVerificationHubV2Address,
        string memory scopeSeed,
        address mailboxAddress,
        address bridgeAddr
    )
        SelfVerificationRoot(identityVerificationHubV2Address, scopeSeed)
    {
        if (mailboxAddress == address(0)) revert ZeroAddress();
        if (bridgeAddr == address(0)) revert ZeroAddress();

        owner = msg.sender;
        mailbox = IMailbox(mailboxAddress);
        bridgeAddress = bridgeAddr;

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

    // ============ Internal Helper Functions ============

    /**
     * @notice Convert bytes32 to address for Hyperlane messaging
     */
    function _bytes32ToAddress(bytes32 _buf) internal pure returns (address) {
        return address(uint160(uint256(_buf)));
    }

    // ============ Parent Functions ============

    /**
     * @notice Parent creates a child account
     * @param _childWallet Address of child's wallet (created via Privy)
     */
    function createChildAccount(address _childWallet) external {
        if (_childWallet == address(0)) revert ZeroAddress();
        if (children[_childWallet].parentWallet != address(0)) revert AccountAlreadyExists();

        children[_childWallet] = ChildAccount({
            childWallet: _childWallet,
            parentWallet: msg.sender,
            vaultBalance: 0,
            spendingBalance: 0,
            isVerified: false,
            createdAt: block.timestamp
        });

        emit ChildAccountCreated(_childWallet, msg.sender, block.timestamp);
    }

    /**
     * @notice Parent deposits funds (split 30% vault / 70% spending)
     * @param _childWallet Address of child's account
     * @dev Transaction will be gas-sponsored via Privy in frontend
     */
    function depositFunds(address _childWallet) external payable {
        if (msg.value == 0) revert ZeroAmount();

        ChildAccount storage child = children[_childWallet];
        if (child.parentWallet == address(0)) revert AccountNotFound();
        if (child.parentWallet != msg.sender) revert NotParent();

        uint256 vaultAmount = (msg.value * VAULT_PERCENTAGE) / 100;
        uint256 spendingAmount = msg.value - vaultAmount;

        child.vaultBalance += vaultAmount;
        child.spendingBalance += spendingAmount;

        emit FundsDeposited(_childWallet, msg.sender, msg.value, vaultAmount, spendingAmount);
    }

    // ============ Hyperlane Functions ============

    /**
     * @notice Receives cross-chain deposits from Base Sepolia via Hyperlane
     * @param _origin Domain of origin chain (Base Sepolia = 84532)
     * @param _sender Address of sender on origin chain (Base bridge contract)
     * @param _messageBody Encoded message data: abi.encode(childWallet, parentWallet)
     * @dev Called automatically by Hyperlane Mailbox when message arrives from Base Sepolia
     * @dev Native tokens must be sent separately (not part of Hyperlane message)
     */
    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _messageBody
    ) external payable onlyMailbox {
        // Validate sender is the authorized bridge contract
        address sender = _bytes32ToAddress(_sender);
        if (sender != bridgeAddress) revert UnauthorizedSender();

        // Decode child and parent addresses from message body
        (address childWallet, address parentWallet) = abi.decode(
            _messageBody,
            (address, address)
        );

        // Validate child account exists and parent matches
        ChildAccount storage child = children[childWallet];
        if (child.parentWallet == address(0)) revert AccountNotFound();
        if (child.parentWallet != parentWallet) revert NotParent();

        // Get the transferred amount
        uint256 totalAmount = msg.value;
        if (totalAmount == 0) revert ZeroAmount();

        // Split funds 30/70
        uint256 vaultAmount = (totalAmount * VAULT_PERCENTAGE) / 100;
        uint256 spendingAmount = totalAmount - vaultAmount;

        child.vaultBalance += vaultAmount;
        child.spendingBalance += spendingAmount;

        emit FundsDeposited(childWallet, parentWallet, totalAmount, vaultAmount, spendingAmount);
    }

    // ============ Child Functions ============

    /**
     * @notice Child pays a whitelisted institution (school, library, etc.)
     * @param _recipient Whitelisted institution address
     * @param _amount Amount to pay
     * @dev Transaction will be gas-sponsored via Privy in frontend
     */
    function payWhitelisted(address _recipient, uint256 _amount) external {
        if (!whitelistedInstitutions[_recipient]) revert NotWhitelisted();
        if (_amount == 0) revert ZeroAmount();

        ChildAccount storage child = children[msg.sender];
        if (child.spendingBalance < _amount) revert InsufficientBalance();

        child.spendingBalance -= _amount;

        (bool success, ) = _recipient.call{value: _amount}("");
        require(success, "Transfer failed");

        emit WhitelistPayment(msg.sender, _recipient, _amount);
    }

    // ============ Self Verification Hook ============

    /**
     * @notice Called automatically after successful Self age verification
     * @param output Verification output from Self Hub
     * @param userData User-defined data (child address encoded)
     * @dev This function is called by SelfVerificationRoot after proof verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        address childAddress = abi.decode(userData, (address));

        ChildAccount storage child = children[childAddress];
        if (child.childWallet == address(0)) revert AccountNotFound();
        if (child.isVerified) revert AlreadyVerified();

        // Mark as verified
        child.isVerified = true;

        // Unlock vault: transfer locked funds to spending balance
        uint256 vaultAmount = child.vaultBalance;
        child.vaultBalance = 0;
        child.spendingBalance += vaultAmount;

        emit VaultUnlocked(childAddress, vaultAmount, block.timestamp);
        emit AgeVerificationCompleted(childAddress, output);
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

    // ============ Admin Functions ============

    /**
     * @notice Add/remove institution from whitelist
     * @param _institution Address of educational institution
     * @param _status True to whitelist, false to remove
     */
    function setWhitelistedInstitution(address _institution, bool _status) external {
        if (msg.sender != owner) revert NotOwner();
        if (_institution == address(0)) revert ZeroAddress();

        whitelistedInstitutions[_institution] = _status;
        emit InstitutionWhitelisted(_institution, _status);
    }

    // ============ View Functions ============

    /**
     * @notice Get child account details
     */
    function getChildAccount(address _child) external view returns (
        address childWallet,
        address parentWallet,
        uint256 vaultBalance,
        uint256 spendingBalance,
        bool isVerified,
        uint256 createdAt
    ) {
        ChildAccount memory child = children[_child];
        return (
            child.childWallet,
            child.parentWallet,
            child.vaultBalance,
            child.spendingBalance,
            child.isVerified,
            child.createdAt
        );
    }

    /**
     * @notice Check if institution is whitelisted
     */
    function isWhitelisted(address _institution) external view returns (bool) {
        return whitelistedInstitutions[_institution];
    }

    /**
     * @notice Get current verification config
     */
    function getVerificationConfig() external view returns (
        bytes32 configId,
        uint256 olderThan
    ) {
        return (verificationConfigId, 18);
    }

    /**
     * @notice Get Hyperlane configuration
     */
    function getHyperlaneConfig() external view returns (
        address mailboxAddress,
        address authorizedBridge
    ) {
        return (address(mailbox), bridgeAddress);
    }

    // ============ Receive Function ============

    receive() external payable {}
}
