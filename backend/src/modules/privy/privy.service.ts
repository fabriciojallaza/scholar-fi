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
      const user = await this.privyClient.getUser(userId);

      // Find embedded wallet
      const embeddedWallet = user.linked_accounts.find(
        (account: any) =>
          account.type === 'wallet' &&
          account.wallet_client === 'privy'
      );

      return embeddedWallet?.address || null;
    } catch (error) {
      this.logger.error(`Failed to get user wallet: ${error.message}`);
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

      // GET app configuration from Privy
      const response = await fetch(
        'https://auth.privy.io/api/v1/apps/me',
        {
          headers: {
            'Authorization': this.getAuthHeader(),
            'privy-app-id': this.configService.get<string>('PRIVY_APP_ID')!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get app config: ${response.status}`);
      }

      const appConfig = await response.json();

      // Check if gas sponsorship is enabled for this chain
      const gasSponsorship = appConfig.embedded_wallets?.gas_sponsorship;
      const isEnabled = gasSponsorship?.chains?.includes(chainId) || false;

      if (isEnabled) {
        this.logger.log(`✅ Gas sponsorship enabled for chain ${chainId}`);
      } else {
        this.logger.warn(`⚠️  Gas sponsorship NOT enabled for chain ${chainId}`);
        this.logger.warn(`   Enable it at: https://dashboard.privy.io/settings/embedded-wallets`);
      }

      return isEnabled;
    } catch (error) {
      this.logger.error(`Failed to verify gas sponsorship: ${error.message}`);
      return false;
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
