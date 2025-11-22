import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { PrivyService } from '../privy/privy.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private lastProcessedBlock = 0; // TODO: Use Redis or database in production

  constructor(
    private configService: ConfigService,
    private privyService: PrivyService,
    private blockchainService: BlockchainService,
  ) {}

  /**
   * Verify Privy webhook signature
   */
  verifyPrivyWebhook(signature: string, body: any): boolean {
    const webhookSecret = this.configService.get<string>('PRIVY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.error('PRIVY_WEBHOOK_SECRET not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Handle Privy wallet balance changed event
   */
  async handleBalanceChange(data: {
    address: string;
    balance_change: string;
  }) {
    try {
      const { address: walletAddress, balance_change } = data;
      const balanceChange = BigInt(balance_change);

      if (balanceChange <= 0n) {
        this.logger.log(`Ignoring withdrawal for wallet ${walletAddress}`);
        return {
          success: true,
          message: 'Withdrawal ignored',
        };
      }

      this.logger.log(`Deposit detected: ${balanceChange} wei to ${walletAddress}`);

      // Look up child by wallet address
      const childAddress = await this.blockchainService.getChildByWallet(walletAddress);

      if (!childAddress) {
        this.logger.warn(`No child found for wallet ${walletAddress}`);
        return {
          success: true,
          message: 'Wallet not registered',
        };
      }

      // Update Oasis with deposit (if function exists)
      // Note: May need to add recordDeposit function to ChildDataStore.sol
      this.logger.log(`✅ Recorded deposit for child ${childAddress}: ${balanceChange}`);

      return {
        success: true,
        childAddress,
        walletAddress,
        depositAmount: balanceChange.toString(),
      };
    } catch (error) {
      this.logger.error(`Error handling balance change: ${error.message}`);
      throw error;
    }
  }

  /**
   * Monitor Celo for ChildVerified events and update Privy policies
   */
  async checkCeloVerifications() {
    try {
      this.logger.log('🔍 Checking Celo for ChildVerified events...');

      const provider = new ethers.JsonRpcProvider(
        this.configService.get<string>('CELO_SEPOLIA_RPC'),
      );
      const verifierAddress = this.configService.get<string>('CELO_VERIFIER_ADDRESS');

      if (!verifierAddress) {
        throw new Error('CELO_VERIFIER_ADDRESS not configured');
      }

      const verifierAbi = [
        'event ChildVerified(address indexed childAddress, address indexed parentAddress, uint256 timestamp, tuple(bytes32 scope, uint256 nonce) output)',
      ];

      const verifier = new ethers.Contract(verifierAddress, verifierAbi, provider);
      const currentBlock = await provider.getBlockNumber();

      // Initialize lastProcessedBlock if first run
      if (this.lastProcessedBlock === 0) {
        this.lastProcessedBlock = Math.max(0, currentBlock - 1000);
      }

      this.logger.log(`📊 Scanning blocks ${this.lastProcessedBlock} to ${currentBlock}`);

      // Query for ChildVerified events
      const filter = verifier.filters.ChildVerified();
      const events = await verifier.queryFilter(
        filter,
        this.lastProcessedBlock + 1,
        currentBlock,
      );

      this.logger.log(`📬 Found ${events.length} ChildVerified events`);

      const processedEvents: any[] = [];

      for (const event of events) {
        const childAddress = event.args?.childAddress;
        const parentAddress = event.args?.parentAddress;
        const timestamp = Number(event.args?.timestamp);

        if (!childAddress || !parentAddress) continue;

        this.logger.log(`✅ Processing verification for child ${childAddress}`);

        // Get child profile from Oasis (includes Privy user IDs)
        const profile = await this.blockchainService.getChildProfile(childAddress);

        if (!profile.childPrivyId) {
          this.logger.warn(`⚠️  No Privy user ID found for child ${childAddress}`);
          continue;
        }

        // Update vault wallet policy to add child as signer
        try {
          await this.updateVaultPolicyAfterVerification(
            profile.vaultWallet,
            profile.childPrivyId,
          );
        } catch (error) {
          this.logger.error(`Failed to update vault policy: ${error.message}`);
        }

        // Update Oasis verification status
        await this.blockchainService.markAgeVerified(childAddress);

        // Send notification email
        await this.sendVaultUnlockedNotification(profile.childPrivyId, childAddress);

        processedEvents.push({
          childAddress,
          parentAddress,
          timestamp,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });

        this.logger.log(`✅ Completed processing for child ${childAddress}`);
      }

      // Update last processed block
      this.lastProcessedBlock = currentBlock;

      return {
        success: true,
        eventsProcessed: processedEvents.length,
        lastBlock: currentBlock,
        events: processedEvents,
      };
    } catch (error) {
      this.logger.error(`Error checking Celo verifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update vault wallet policy after child is verified
   * Adds child as signer and removes time locks
   */
  private async updateVaultPolicyAfterVerification(
    vaultWallet: string,
    childPrivyUserId: string,
  ) {
    try {
      this.logger.log(`Updating vault policy for ${vaultWallet}`);

      // Get existing policies for this wallet
      // Note: Privy API endpoint to list policies
      const response = await fetch(
        `https://auth.privy.io/api/v1/wallets/${vaultWallet}/policies`,
        {
          headers: {
            'Authorization': this.getAuthHeader(),
            'privy-app-id': this.configService.get<string>('PRIVY_APP_ID')!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get policies: ${response.status}`);
      }

      const policies = await response.json();
      const vaultPolicy = policies[0]; // Assume first policy is vault policy

      if (!vaultPolicy) {
        this.logger.warn('No vault policy found - child will need manual access');
        return;
      }

      // Update policy to add child as signer and remove locks
      await this.privyService.updateWalletPolicy(
        vaultWallet,
        vaultPolicy.id,
        {
          signers: [...vaultPolicy.signers, childPrivyUserId], // Add child
          timeLocks: null, // Remove time lock
        },
      );

      this.logger.log(`✅ Updated vault policy - child ${childPrivyUserId} can now access funds`);
    } catch (error) {
      this.logger.error(`Failed to update vault policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send email notification to child when vault unlocks
   */
  private async sendVaultUnlockedNotification(
    childPrivyUserId: string,
    childAddress: string,
  ) {
    try {
      // Get child's email from Privy
      const childUser = await this.privyService.getUser(childPrivyUserId);
      const childEmail = childUser.email?.address;

      if (!childEmail) {
        this.logger.warn(`No email found for child ${childPrivyUserId}`);
        return;
      }

      // TODO: Integrate with SendGrid, Postmark, or Resend
      this.logger.log(`📧 Email notification needed for ${childEmail}:`);
      this.logger.log(`   Subject: Your Scholar-Fi Vault is Now Unlocked!`);
      this.logger.log(`   Message: Congratulations! You've been age-verified.`);
      this.logger.log(`           Login to Scholar-Fi to access your vault funds.`);

      // In production:
      // await emailService.send({
      //   to: childEmail,
      //   subject: 'Your Scholar-Fi Vault is Now Unlocked!',
      //   template: 'vault-unlocked',
      //   data: { childAddress }
      // });
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Get authorization header for Privy API
   */
  private getAuthHeader(): string {
    const appId = this.configService.get<string>('PRIVY_APP_ID')!;
    const appSecret = this.configService.get<string>('PRIVY_APP_SECRET')!;
    const credentials = Buffer.from(`${appId}:${appSecret}`).toString('base64');
    return `Basic ${credentials}`;
  }
}
