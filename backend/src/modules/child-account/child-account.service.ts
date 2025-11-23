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
      this.logger.log(`✅ Child Privy user created: ${childUserId}`);

      // STEP 4: Generate deterministic child address (used as identifier in contracts)
      const childAddress = ethers.keccak256(
        ethers.toUtf8Bytes(`${childUserId}-${dto.childName}`)
      ).slice(0, 42);

      this.logger.log(`Child address (identifier): ${childAddress}`);

      // STEP 5: Create key quorum (parent + child = either can sign)
      this.logger.log(`Creating key quorum with parent and child...`);
      const keyQuorum = await this.privyService.createKeyQuorum(
        [dto.parentUserId, childUserId],
        1,  // Threshold = 1 means either parent OR child can sign
        `${dto.childName}_quorum`
      );

      this.logger.log(`✅ Key quorum created: ${keyQuorum.id}`);

      // STEP 6: Create checking and vault wallets using key quorum
      this.logger.log(`Creating checking wallet with key quorum as owner...`);
      const checkingWallet = await this.privyService.createWallet(
        keyQuorum.id,  // Key quorum as owner
        [],  // No additional signers needed
        'ethereum'
      );

      this.logger.log(`Creating vault wallet with key quorum as owner...`);
      const vaultWallet = await this.privyService.createWallet(
        keyQuorum.id,  // Key quorum as owner
        [],  // No additional signers needed
        'ethereum'
      );

      this.logger.log(`✅ Checking wallet: ${checkingWallet.address} (ID: ${checkingWallet.id})`);
      this.logger.log(`✅ Vault wallet: ${vaultWallet.address} (ID: ${vaultWallet.id})`);

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

      // STEP 9: Create encrypted profile on Oasis with Privy IDs and wallet info
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

      this.logger.log(`✅ Child account created successfully: ${childAddress}`);

      return {
        success: true,
        childAddress,
        childUserId,
        childPrivyEmail: childEmail,
        checkingWallet: checkingWallet.address,
        checkingWalletId: checkingWallet.id,
        vaultWallet: vaultWallet.address,
        vaultWalletId: vaultWallet.id,
        parentWallet,
        oasisProfileCreated,
        celoRegistered,
        baseRegistered,
        // Include contract addresses so frontend can validate
        contractAddresses: {
          celoVerifier: this.blockchainService.getVerifierAddress(),
          baseSplitter: this.blockchainService.getSplitterAddress(),
          oasisDatastore: this.blockchainService.getDatastoreAddress(),
        },
        message: 'Child account created with checking and vault wallets (child as additional signer)',
      };
    } catch (error) {
      this.logger.error(`Failed to create child account: ${error.message}`);
      throw error;
    }
  }
}
