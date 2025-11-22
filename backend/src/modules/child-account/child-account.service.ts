import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { PrivyService } from '../privy/privy.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import {
  CreateChildAccountDto,
  CreateChildAccountResponse,
} from '../../common/dto/create-child-account.dto';

@Injectable()
export class ChildAccountService {
  private readonly logger = new Logger(ChildAccountService.name);

  constructor(
    private privyService: PrivyService,
    private blockchainService: BlockchainService,
  ) {}

  /**
   * Create complete child account across all chains
   * With Privy policies for multi-signer wallets
   */
  async createChildAccount(
    dto: CreateChildAccountDto,
  ): Promise<CreateChildAccountResponse> {
    try {
      this.logger.log(`Creating child account for parent: ${dto.parentUserId}`);

      // STEP 1: Verify gas sponsorship is enabled
      const gasEnabled = await this.privyService.verifyGasSponsorship(84532); // Base Sepolia
      if (!gasEnabled) {
        this.logger.warn('⚠️  Gas sponsorship not enabled - deposits will require parent to have ETH');
      }

      // STEP 2: Get parent's embedded wallet address
      const parentWallet = await this.privyService.getUserWallet(dto.parentUserId);
      if (!parentWallet) {
        throw new Error('Parent does not have an embedded wallet');
      }

      this.logger.log(`Parent wallet: ${parentWallet}`);

      // STEP 3: Create child Privy user
      const childEmail = `child-${Date.now()}-${Math.random().toString(36).slice(2)}@scholarfi.internal`;
      const childUser = await this.privyService.createUser(childEmail, {
        name: dto.childName,
        parent_email: dto.parentEmail,
        account_type: 'child',
        created_at: Date.now(),
      });

      const childUserId = childUser.id;
      this.logger.log(`Child Privy user created: ${childUserId}`);

      // STEP 4: Generate deterministic child address (used as identifier in contracts)
      const childAddress = ethers.keccak256(
        ethers.toUtf8Bytes(`${childUserId}-${dto.childName}`)
      ).slice(0, 42);

      this.logger.log(`Child address (identifier): ${childAddress}`);

      // STEP 5: Create checking and vault wallets (EOA wallets)
      // These are server-controlled for now, with Privy policies for signers
      const checkingWallet = ethers.Wallet.createRandom();
      const vaultWallet = ethers.Wallet.createRandom();

      this.logger.log(`Checking wallet: ${checkingWallet.address}`);
      this.logger.log(`Vault wallet: ${vaultWallet.address}`);

      // STEP 6: Create Privy policies for multi-signer wallets
      // This allows both parent and child to sign transactions
      let policiesCreated = false;
      try {
        // Policy for checking wallet (70% - immediate spending)
        // Both parent and child can sign
        await this.privyService.createWalletPolicy(
          checkingWallet.address,
          [dto.parentUserId, childUserId],
          {
            // No spending limits on checking account
          }
        );

        // Policy for vault wallet (30% - locked until age 18)
        // Initially only parent can sign, child added after verification
        await this.privyService.createWalletPolicy(
          vaultWallet.address,
          [dto.parentUserId],  // Only parent initially
          {
            timeLocks: {
              unlockDate: dto.childDateOfBirth + (18 * 365 * 24 * 60 * 60), // 18 years from birth
            },
          }
        );

        policiesCreated = true;
        this.logger.log('✅ Privy wallet policies created');
      } catch (error) {
        this.logger.error(`Failed to create Privy policies: ${error.message}`);
        this.logger.warn('Continuing without policies - wallets will be server-controlled only');
      }

      // STEP 7: Register on Base Sepolia
      const baseRegistered = await this.blockchainService.registerOnBase(
        childAddress,
        checkingWallet.address,
        vaultWallet.address,
      );

      // STEP 8: Register on Celo Sepolia
      const celoRegistered = await this.blockchainService.registerOnCelo(
        childAddress,
        parentWallet,
      );

      // STEP 9: Create encrypted profile on Oasis with Privy IDs
      const oasisProfileCreated = await this.blockchainService.createOasisProfile({
        childAddress,
        childName: dto.childName,
        dateOfBirth: dto.childDateOfBirth,
        parentEmail: dto.parentEmail,
        checkingWallet: checkingWallet.address,
        vaultWallet: vaultWallet.address,
        parentWallet,
        childPrivyUserId: childUserId,
        parentPrivyUserId: dto.parentUserId,
      });

      // STEP 10: Securely store wallet private keys
      // TODO: Implement secure storage (AWS KMS, Vault, etc.)
      await this.storeWalletKeysSecurely(childAddress, {
        checkingPrivateKey: checkingWallet.privateKey,
        vaultPrivateKey: vaultWallet.privateKey,
      });

      this.logger.log(`✅ Child account created successfully: ${childAddress}`);

      return {
        success: true,
        childAddress,
        childUserId,
        childPrivyEmail: childEmail,
        checkingWallet: checkingWallet.address,
        vaultWallet: vaultWallet.address,
        parentWallet,
        oasisProfileCreated,
        celoRegistered,
        baseRegistered,
        policiesCreated,
        message: policiesCreated
          ? 'Child account created with multi-signer policies'
          : 'Child account created (policies failed - using server-controlled wallets)',
      };
    } catch (error) {
      this.logger.error(`Failed to create child account: ${error.message}`);
      throw error;
    }
  }

  /**
   * Securely store wallet private keys
   * CRITICAL: Implement proper encryption and secure storage
   */
  private async storeWalletKeysSecurely(
    childAddress: string,
    keys: { checkingPrivateKey: string; vaultPrivateKey: string },
  ): Promise<void> {
    // TODO: Implement secure storage
    // Options:
    // 1. Encrypt with parent's Privy embedded wallet public key
    // 2. Store in AWS Secrets Manager / HashiCorp Vault
    // 3. Split key with Shamir Secret Sharing
    // 4. Store encrypted in Oasis Sapphire contract

    this.logger.warn('⚠️  Private keys need secure storage implementation!');
    this.logger.warn(`   Child address: ${childAddress}`);
    this.logger.warn(`   Checking wallet key: ${keys.checkingPrivateKey.substring(0, 10)}...`);
    this.logger.warn(`   Vault wallet key: ${keys.vaultPrivateKey.substring(0, 10)}...`);

    // For MVP: Log to secure location
    // In production: NEVER log private keys!
  }
}
