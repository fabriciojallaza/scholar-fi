// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title ParentDepositSplitter
 * @notice Automatically splits parent deposits 70/30 to child's checking and vault wallets
 * @dev Integrates with Privy for gasless transactions on Base Sepolia
 * @dev All wallets are Privy HD wallets, child is additional_signer on checking + vault
 *
 * Track Compliance:
 * - Privy Track: Gas sponsorship for parent deposits (configured in Privy dashboard)
 * - Self Track: Age verification happens on Celo, triggers ownership transfer via backend
 * - Oasis Track: Child metadata stored encrypted on Sapphire, linked to these wallet addresses
 */
contract ParentDepositSplitter {
    // ============ Structs ============

    struct ChildWallets {
        address checkingWallet;  // 70% - spending balance, child is additional_signer
        address vaultWallet;     // 30% - locked until age 18, child is additional_signer
        address parentWallet;    // Parent's main wallet
        bool exists;
    }

    // ============ State Variables ============

    mapping(address => ChildWallets) public children;  // childAddress => wallets
    mapping(address => address) public parentToChild;  // parentAddress => childAddress

    address public immutable owner;

    uint256 public constant VAULT_PERCENTAGE = 30;     // 30% to locked vault
    uint256 public constant CHECKING_PERCENTAGE = 70;   // 70% to checking balance

    // ============ Events ============

    event ChildAccountRegistered(
        address indexed childAddress,
        address indexed parentWallet,
        address checkingWallet,
        address vaultWallet,
        uint256 timestamp
    );

    event FundsDeposited(
        address indexed childAddress,
        address indexed parentWallet,
        uint256 totalAmount,
        uint256 vaultAmount,
        uint256 checkingAmount,
        uint256 timestamp
    );

    event WalletsUpdated(
        address indexed childAddress,
        address newCheckingWallet,
        address newVaultWallet
    );

    // ============ Errors ============

    error ChildNotRegistered();
    error ChildAlreadyRegistered();
    error ZeroAddress();
    error ZeroAmount();
    error OnlyOwner();
    error OnlyParent();
    error TransferFailed();

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
    }

    // ============ External Functions ============

    /**
     * @notice Register child wallet addresses (called by backend after Privy HD wallet creation)
     * @param childAddress Unique identifier for child (can be derived address or Privy user ID)
     * @param checkingWallet Privy HD wallet 1 address (child is additional_signer)
     * @param vaultWallet Privy HD wallet 2 address (child is additional_signer)
     * @dev Only parent can register their child's wallets
     */
    function registerChildWallets(
        address childAddress,
        address checkingWallet,
        address vaultWallet
    ) external {
        if (childAddress == address(0)) revert ZeroAddress();
        if (checkingWallet == address(0)) revert ZeroAddress();
        if (vaultWallet == address(0)) revert ZeroAddress();
        if (children[childAddress].exists) revert ChildAlreadyRegistered();

        children[childAddress] = ChildWallets({
            checkingWallet: checkingWallet,
            vaultWallet: vaultWallet,
            parentWallet: msg.sender,
            exists: true
        });

        parentToChild[msg.sender] = childAddress;

        emit ChildAccountRegistered(
            childAddress,
            msg.sender,
            checkingWallet,
            vaultWallet,
            block.timestamp
        );
    }

    /**
     * @notice Parent deposits funds that auto-split to checking and vault
     * @param childAddress Child's unique address
     * @dev Transaction is gas-sponsored via Privy
     * @dev Emits event that backend webhook listens to for Oasis metadata update
     */
    function depositForChild(address childAddress) external payable {
        if (msg.value == 0) revert ZeroAmount();

        ChildWallets memory wallets = children[childAddress];
        if (!wallets.exists) revert ChildNotRegistered();
        if (wallets.parentWallet != msg.sender) revert OnlyParent();

        // Calculate split
        uint256 vaultAmount = (msg.value * VAULT_PERCENTAGE) / 100;
        uint256 checkingAmount = msg.value - vaultAmount;

        // Transfer to checking wallet (70%)
        (bool success1, ) = wallets.checkingWallet.call{value: checkingAmount}("");
        if (!success1) revert TransferFailed();

        // Transfer to vault wallet (30%)
        (bool success2, ) = wallets.vaultWallet.call{value: vaultAmount}("");
        if (!success2) revert TransferFailed();

        emit FundsDeposited(
            childAddress,
            msg.sender,
            msg.value,
            vaultAmount,
            checkingAmount,
            block.timestamp
        );
    }

    /**
     * @notice Update child wallet addresses (in case of Privy wallet regeneration)
     * @param childAddress Child's unique address
     * @param newCheckingWallet New checking wallet address
     * @param newVaultWallet New vault wallet address
     * @dev Only parent can update
     */
    function updateChildWallets(
        address childAddress,
        address newCheckingWallet,
        address newVaultWallet
    ) external {
        ChildWallets storage wallets = children[childAddress];
        if (!wallets.exists) revert ChildNotRegistered();
        if (wallets.parentWallet != msg.sender) revert OnlyParent();
        if (newCheckingWallet == address(0)) revert ZeroAddress();
        if (newVaultWallet == address(0)) revert ZeroAddress();

        wallets.checkingWallet = newCheckingWallet;
        wallets.vaultWallet = newVaultWallet;

        emit WalletsUpdated(childAddress, newCheckingWallet, newVaultWallet);
    }

    // ============ View Functions ============

    /**
     * @notice Get child wallet addresses
     * @param childAddress Child's unique address
     * @return checking Checking wallet address
     * @return vault Vault wallet address
     * @return parent Parent's wallet address
     * @return exists Whether child is registered
     */
    function getChildWallets(address childAddress) external view returns (
        address checking,
        address vault,
        address parent,
        bool exists
    ) {
        ChildWallets memory wallets = children[childAddress];
        return (
            wallets.checkingWallet,
            wallets.vaultWallet,
            wallets.parentWallet,
            wallets.exists
        );
    }

    /**
     * @notice Get child address for a parent
     * @param parentAddress Parent's wallet address
     * @return Child's address
     */
    function getChildForParent(address parentAddress) external view returns (address) {
        return parentToChild[parentAddress];
    }

    /**
     * @notice Check if child is registered
     * @param childAddress Child's unique address
     * @return True if registered
     */
    function isChildRegistered(address childAddress) external view returns (bool) {
        return children[childAddress].exists;
    }

    // ============ Admin Functions ============

    /**
     * @notice Emergency withdraw (owner only)
     * @dev Should never be needed in normal operation
     */
    function withdrawETH() external {
        if (msg.sender != owner) revert OnlyOwner();
        (bool success, ) = owner.call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }

    // ============ Receive Function ============

    receive() external payable {}
}
