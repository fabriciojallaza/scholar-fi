import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Register child wallets on Base Sepolia ParentDepositSplitter
   */
  async registerOnBase(
    childAddress: string,
    checkingWallet: string,
    vaultWallet: string
  ): Promise<boolean> {
    try {
      this.logger.log(`Registering child on Base: ${childAddress}`);

      const provider = new ethers.JsonRpcProvider(
        this.configService.get<string>('BASE_SEPOLIA_RPC')
      );
      const signer = new ethers.Wallet(
        this.configService.get<string>('PRIVATE_KEY')!,
        provider
      );

      const splitterAddress = this.configService.get<string>('BASE_SPLITTER_ADDRESS');
      const splitterAbi = [
        'function registerChildWallets(address childAddress, address checkingWallet, address vaultWallet) external'
      ];

      const splitter = new ethers.Contract(splitterAddress!, splitterAbi, signer);
      const tx = await splitter.registerChildWallets(
        childAddress,
        checkingWallet,
        vaultWallet
      );
      await tx.wait();

      this.logger.log(`✅ Registered child on Base: ${tx.hash}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to register on Base: ${error.message}`);
      return false;
    }
  }

  /**
   * Register child on Celo Sepolia ScholarFiAgeVerifier
   */
  async registerOnCelo(
    childAddress: string,
    parentAddress: string
  ): Promise<boolean> {
    try {
      this.logger.log(`Registering child on Celo: ${childAddress}`);

      const provider = new ethers.JsonRpcProvider(
        this.configService.get<string>('CELO_SEPOLIA_RPC')
      );
      const signer = new ethers.Wallet(
        this.configService.get<string>('PRIVATE_KEY')!,
        provider
      );

      const verifierAddress = this.configService.get<string>('CELO_VERIFIER_ADDRESS');
      const verifierAbi = [
        'function registerChild(address childAddress, address parentAddress) external'
      ];

      const verifier = new ethers.Contract(verifierAddress!, verifierAbi, signer);
      const tx = await verifier.registerChild(childAddress, parentAddress);
      await tx.wait();

      this.logger.log(`✅ Registered child on Celo: ${tx.hash}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to register on Celo: ${error.message}`);
      return false;
    }
  }

  /**
   * Create encrypted child profile on Oasis Sapphire
   * Stores Privy user IDs for webhook lookups
   */
  async createOasisProfile(params: {
    childAddress: string;
    childName: string;
    dateOfBirth: number;
    parentEmail: string;
    checkingWallet: string;
    vaultWallet: string;
    parentWallet: string;
    childPrivyUserId: string;
    parentPrivyUserId: string;
  }): Promise<boolean> {
    try {
      this.logger.log(`Creating Oasis profile for: ${params.childAddress}`);

      const provider = new ethers.JsonRpcProvider(
        this.configService.get<string>('OASIS_SAPPHIRE_RPC')
      );
      const signer = new ethers.Wallet(
        this.configService.get<string>('PRIVATE_KEY')!,
        provider
      );

      const datastoreAddress = this.configService.get<string>('OASIS_DATASTORE_ADDRESS');

      // ABI matches current ChildDataStore.sol
      // Note: You'll need to update the contract to accept Privy IDs
      const datastoreAbi = [
        'function createChildProfile(address,string,uint256,string,address,address,address,address) external'
      ];

      const datastore = new ethers.Contract(datastoreAddress!, datastoreAbi, signer);

      // For now, encode Privy IDs in parentEmail field as JSON
      // TODO: Update ChildDataStore.sol to have dedicated fields
      const emailWithPrivyIds = JSON.stringify({
        email: params.parentEmail,
        childPrivyId: params.childPrivyUserId,
        parentPrivyId: params.parentPrivyUserId
      });

      const tx = await datastore.createChildProfile(
        params.childAddress,
        params.childName,
        params.dateOfBirth,
        emailWithPrivyIds,  // Temporary: encode Privy IDs here
        params.checkingWallet,
        params.vaultWallet,
        params.parentWallet,
        this.configService.get<string>('CELO_VERIFIER_ADDRESS')!
      );
      await tx.wait();

      this.logger.log(`✅ Created Oasis profile: ${tx.hash}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to create Oasis profile: ${error.message}`);
      return false;
    }
  }

  /**
   * Get child address by wallet address (reverse lookup)
   */
  async getChildByWallet(walletAddress: string): Promise<string | null> {
    try {
      const provider = new ethers.JsonRpcProvider(
        this.configService.get<string>('OASIS_SAPPHIRE_RPC')
      );
      const datastoreAddress = this.configService.get<string>('OASIS_DATASTORE_ADDRESS');

      // This requires ChildDataStore.sol to be updated with walletToChild mapping
      const datastoreAbi = [
        'function walletToChild(address) external view returns (address)'
      ];

      const datastore = new ethers.Contract(datastoreAddress!, datastoreAbi, provider);
      const childAddress = await datastore.walletToChild(walletAddress);

      if (childAddress === ethers.ZeroAddress) {
        return null;
      }

      return childAddress;
    } catch (error) {
      this.logger.error(`Failed to look up child by wallet: ${error.message}`);
      return null;
    }
  }

  /**
   * Get child profile from Oasis (including Privy IDs)
   */
  async getChildProfile(childAddress: string) {
    try {
      const provider = new ethers.JsonRpcProvider(
        this.configService.get<string>('OASIS_SAPPHIRE_RPC')
      );
      const datastoreAddress = this.configService.get<string>('OASIS_DATASTORE_ADDRESS');

      const datastoreAbi = [
        'function getChildProfile(address) external view returns (string,uint256,string,address,address,address,bool,uint256,uint256,uint256)'
      ];

      const datastore = new ethers.Contract(datastoreAddress!, datastoreAbi, provider);
      const profile = await datastore.getChildProfile(childAddress);

      // Parse email field which contains Privy IDs (temporary solution)
      let childPrivyId = null;
      let parentPrivyId = null;
      let email = profile[2];

      try {
        const parsed = JSON.parse(profile[2]);
        email = parsed.email;
        childPrivyId = parsed.childPrivyId;
        parentPrivyId = parsed.parentPrivyId;
      } catch {
        // Old format without Privy IDs
      }

      return {
        name: profile[0],
        dateOfBirth: Number(profile[1]),
        email,
        checkingWallet: profile[3],
        vaultWallet: profile[4],
        parentWallet: profile[5],
        isVerified: profile[6],
        totalDeposited: profile[7],
        vaultGrowth: profile[8],
        lastUpdated: profile[9],
        childPrivyId,
        parentPrivyId,
      };
    } catch (error) {
      this.logger.error(`Failed to get child profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update Oasis with age verification status
   */
  async markAgeVerified(childAddress: string): Promise<boolean> {
    try {
      const provider = new ethers.JsonRpcProvider(
        this.configService.get<string>('OASIS_SAPPHIRE_RPC')
      );
      const signer = new ethers.Wallet(
        this.configService.get<string>('PRIVATE_KEY')!,
        provider
      );

      const datastoreAddress = this.configService.get<string>('OASIS_DATASTORE_ADDRESS');
      const datastoreAbi = [
        'function markAgeVerified(address childAddress) external'
      ];

      const datastore = new ethers.Contract(datastoreAddress!, datastoreAbi, signer);
      const tx = await datastore.markAgeVerified(childAddress);
      await tx.wait();

      this.logger.log(`✅ Marked age verified on Oasis: ${tx.hash}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to mark age verified: ${error.message}`);
      return false;
    }
  }
}
