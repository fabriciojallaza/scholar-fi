// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IMailbox} from "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";

/**
 * @title ScholarFiBridge
 * @notice Hyperlane bridge for depositing funds from Base Sepolia to Celo Sepolia
 * @dev Integrates with Privy for gasless transactions on Base Sepolia
 *
 * Track Compliance:
 * - Privy Track: Gas sponsorship for parent deposits (configured in Privy dashboard)
 * - Hyperlane Track: Cross-chain messaging from Base Sepolia to Celo Sepolia
 */
contract ScholarFiBridge {
    // ============ Errors ============

    error NotEnoughBalance(uint256 currentBalance, uint256 requiredBalance);
    error InvalidReceiverAddress();
    error ZeroAmount();
    error OnlyOwner();

    // ============ Events ============

    event DepositBridged(
        bytes32 indexed messageId,
        address indexed childWallet,
        address indexed parentWallet,
        uint256 amount,
        uint256 fees
    );

    // ============ State Variables ============

    IMailbox private immutable i_mailbox;
    uint32 private immutable i_celoDomain;
    address private immutable i_celoVaultAddress;
    address private immutable i_owner;

    // ============ Constructor ============

    /**
     * @notice Deploy ScholarFiBridge
     * @param mailbox Hyperlane Mailbox on Base Sepolia: 0x6966b0E55883d49BFB24539356a2f8A673E02039
     * @param celoDomain Celo Sepolia domain: 11142220
     * @param celoVaultAddress ScholarFiVault address on Celo Sepolia
     */
    constructor(
        address mailbox,
        uint32 celoDomain,
        address celoVaultAddress
    ) {
        if (mailbox == address(0)) revert InvalidReceiverAddress();
        if (celoVaultAddress == address(0)) revert InvalidReceiverAddress();

        i_mailbox = IMailbox(mailbox);
        i_celoDomain = celoDomain;
        i_celoVaultAddress = celoVaultAddress;
        i_owner = msg.sender;
    }

    // ============ Internal Helper Functions ============

    /**
     * @notice Convert address to bytes32 for Hyperlane messaging
     */
    function _addressToBytes32(address _addr) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    // ============ External Functions ============

    /**
     * @notice Bridge deposit to Celo Sepolia
     * @param childWallet Address of child's wallet on Celo
     * @dev Transaction is gasless for user via Privy gas sponsorship
     * @dev msg.value must include both deposit amount + Hyperlane fees
     * @return messageId Hyperlane message ID for tracking
     */
    function depositForChild(
        address childWallet
    ) external payable returns (bytes32 messageId) {
        if (childWallet == address(0)) revert InvalidReceiverAddress();

        // Build message body
        bytes memory messageBody = abi.encode(childWallet, msg.sender);

        // Get Hyperlane fee quote
        uint256 fees = i_mailbox.quoteDispatch(
            i_celoDomain,
            _addressToBytes32(i_celoVaultAddress),
            messageBody
        );

        // Check we have enough native gas for fees
        if (msg.value < fees) {
            revert NotEnoughBalance(msg.value, fees);
        }

        // Actual deposit amount = msg.value - fees
        uint256 depositAmount = msg.value - fees;
        if (depositAmount == 0) revert ZeroAmount();

        // Dispatch message via Hyperlane
        messageId = i_mailbox.dispatch{value: msg.value}(
            i_celoDomain,
            _addressToBytes32(i_celoVaultAddress),
            messageBody
        );

        emit DepositBridged(messageId, childWallet, msg.sender, depositAmount, fees);

        return messageId;
    }

    // ============ View Functions ============

    /**
     * @notice Get estimated Hyperlane fees for a deposit
     * @param childWallet Child's wallet address
     * @param amount Total amount (deposit + fees)
     * @return fees Estimated fees in native gas (wei)
     */
    function estimateFees(
        address childWallet,
        uint256 amount
    ) external view returns (uint256 fees) {
        bytes memory messageBody = abi.encode(childWallet, msg.sender);
        return i_mailbox.quoteDispatch(
            i_celoDomain,
            _addressToBytes32(i_celoVaultAddress),
            messageBody
        );
    }

    /**
     * @notice Get contract configuration
     */
    function getConfig() external view returns (
        address mailbox,
        uint32 celoDomain,
        address celoVaultAddress
    ) {
        return (
            address(i_mailbox),
            i_celoDomain,
            i_celoVaultAddress
        );
    }

    // ============ Admin Functions ============

    /**
     * @notice Withdraw stuck ETH (emergency only)
     */
    function withdrawETH() external {
        if (msg.sender != i_owner) revert OnlyOwner();
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    // ============ Receive Function ============

    receive() external payable {}
}
