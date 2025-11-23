import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrivyClient } from '@privy-io/server-auth';

@Injectable()
export class PrivyService {
  private readonly logger = new Logger(PrivyService.name);
  private readonly privyClient: PrivyClient;

  constructor(private configService: ConfigService) {
    const appId = this.configService.get<string>('PRIVY_APP_ID');
    const appSecret = this.configService.get<string>('PRIVY_APP_SECRET');

    if (!appId || !appSecret) {
      throw new Error('PRIVY_APP_ID and PRIVY_APP_SECRET must be set');
    }

    this.privyClient = new PrivyClient(appId, appSecret);
    this.logger.log('✅ Privy Client initialized');
  }

  /**
   * Get Privy client instance
   */
  getClient(): PrivyClient {
    return this.privyClient;
  }

  /**
   * Create a new Privy user (for child account)
   */
  async createUser(email: string, metadata?: Record<string, any>) {
    try {
      this.logger.log(`Creating Privy user with email: ${email}`);

      // Note: Privy's actual API for user creation
      // This creates a user entity but NO wallet yet
      // Wallet is created on first login via frontend
      const user = await this.privyClient.createUser({
        // Privy will auto-generate user ID
      });

      this.logger.log(`✅ Created Privy user: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create Privy user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user's embedded wallet address
   */
  async getUserWallet(userId: string): Promise<string | null> {
    try {
      this.logger.log(`Getting wallet for user: ${userId}`);
      const user = await this.privyClient.getUser(userId);

      this.logger.log(`User data: ${JSON.stringify(user)}`);

      // Check if user has linkedAccounts (camelCase!)
      if (!user.linkedAccounts || !Array.isArray(user.linkedAccounts)) {
        this.logger.warn(`User ${userId} has no linkedAccounts`);
        return null;
      }

      // Find embedded wallet
      const embeddedWallet = user.linkedAccounts.find(
        (account: any) =>
          account.type === 'wallet' &&
          (account.walletClientType === 'privy' || account.connectorType === 'embedded')
      );

      if (embeddedWallet) {
        this.logger.log(`Found embedded wallet: ${embeddedWallet.address}`);
        return embeddedWallet.address;
      }

      this.logger.warn(`User ${userId} has no embedded wallet`);
      return null;
    } catch (error) {
      this.logger.error(`Failed to get user wallet: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string) {
    try {
      return await this.privyClient.getUser(userId);
    } catch (error) {
      this.logger.error(`Failed to get user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create wallet policy for multi-signer setup
   * Uses Privy Policies API: https://docs.privy.io/api-reference/policies/create
   */
  async createWalletPolicy(
    walletAddress: string,
    signers: string[],
    policyConfig: {
      spendingLimits?: {
        amount: string;
        period: 'daily' | 'weekly' | 'monthly';
      };
      timeLocks?: {
        unlockDate: number;
      };
    }
  ) {
    try {
      this.logger.log(`Creating wallet policy for ${walletAddress}`);

      // Using Privy Policies API
      // POST https://auth.privy.io/api/v1/wallets/{address}/policies
      const response = await fetch(
        `https://auth.privy.io/api/v1/wallets/${walletAddress}/policies`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json',
            'privy-app-id': this.configService.get<string>('PRIVY_APP_ID')!,
          },
          body: JSON.stringify({
            signers,  // Array of Privy user IDs that can sign
            ...policyConfig,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Privy API error: ${response.status} - ${error}`);
      }

      const policy = await response.json();
      this.logger.log(`✅ Created wallet policy: ${policy.id}`);
      return policy;
    } catch (error) {
      this.logger.error(`Failed to create wallet policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update wallet policy (e.g., transfer ownership after age verification)
   */
  async updateWalletPolicy(
    walletAddress: string,
    policyId: string,
    updates: {
      signers?: string[];
      spendingLimits?: null | {
        amount: string;
        period: 'daily' | 'weekly' | 'monthly';
      };
      timeLocks?: null | {
        unlockDate: number;
      };
    }
  ) {
    try {
      this.logger.log(`Updating wallet policy ${policyId} for ${walletAddress}`);

      const response = await fetch(
        `https://auth.privy.io/api/v1/wallets/${walletAddress}/policies/${policyId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json',
            'privy-app-id': this.configService.get<string>('PRIVY_APP_ID')!,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Privy API error: ${response.status} - ${error}`);
      }

      const policy = await response.json();
      this.logger.log(`✅ Updated wallet policy: ${policy.id}`);
      return policy;
    } catch (error) {
      this.logger.error(`Failed to update wallet policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify gas sponsorship is enabled for a chain
   */
  async verifyGasSponsorship(chainId: number): Promise<boolean> {
    try {
      this.logger.log(`Checking gas sponsorship for chain ${chainId}...`);

      // Use Privy SDK to check app config
      // Note: The /apps/me endpoint requires proper permissions
      const appId = this.configService.get<string>('PRIVY_APP_ID');
      const appSecret = this.configService.get<string>('PRIVY_APP_SECRET');

      const response = await fetch(
        `https://auth.privy.io/api/v1/apps/${appId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.getAuthHeader(),
            'privy-app-id': appId,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Privy API error: ${response.status} - ${errorText}`);
        this.logger.warn(`⚠️  Could not verify gas sponsorship via API`);
        this.logger.warn(`   Please verify manually at: https://dashboard.privy.io/settings`);
        this.logger.warn(`   Enable Gas Sponsorship for Base Sepolia (Chain ID: 84532)`);
        // Continue anyway - don't block account creation
        return true;
      }

      const appConfig = await response.json();
      this.logger.log(`App config: ${JSON.stringify(appConfig)}`);

      // Check if gas sponsorship is configured
      const gasSponsorshipEnabled = appConfig.rpcConfig?.sponsorshipEnabled || false;

      if (gasSponsorshipEnabled) {
        this.logger.log(`✅ Gas sponsorship is enabled`);
      } else {
        this.logger.warn(`⚠️  Gas sponsorship NOT enabled`);
        this.logger.warn(`   Enable at: https://dashboard.privy.io → Settings → Embedded Wallets → Gas Sponsorship`);
      }

      return gasSponsorshipEnabled;
    } catch (error) {
      this.logger.error(`Failed to verify gas sponsorship: ${error.message}`);
      this.logger.warn(`   Continuing without verification - configure manually in Privy Dashboard`);
      return true; // Don't block account creation
    }
  }

  /**
   * Get authorization header for Privy API calls
   */
  private getAuthHeader(): string {
    const appId = this.configService.get<string>('PRIVY_APP_ID')!;
    const appSecret = this.configService.get<string>('PRIVY_APP_SECRET')!;
    const credentials = Buffer.from(`${appId}:${appSecret}`).toString('base64');
    return `Basic ${credentials}`;
  }
}
