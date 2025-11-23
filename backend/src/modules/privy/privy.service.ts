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
   * Uses REST API: POST https://api.privy.io/v1/users
   */
  async createUser(email: string, metadata?: Record<string, any>) {
    try {
      this.logger.log(`Creating Privy user with email: ${email}`);

      const response = await fetch('https://api.privy.io/v1/users', {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
          'privy-app-id': this.configService.get<string>('PRIVY_APP_ID')!,
        },
        body: JSON.stringify({
          linked_accounts: [
            {
              type: 'email',
              address: email,
            }
          ],
          custom_metadata: metadata || {},
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Privy API error: ${response.status} - ${error}`);
      }

      const user = await response.json();
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
      ) as any;

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
   * Extract CUID2 from Privy DID format
   * Example: did:privy:cmib02phj00v8lh0c06dbkk9i -> cmib02phj00v8lh0c06dbkk9i
   */
  private extractCuid2(privyId: string): string {
    if (privyId.startsWith('did:privy:')) {
      return privyId.replace('did:privy:', '');
    }
    return privyId;
  }

  /**
   * Create a key quorum (multi-signer entity)
   * Uses Privy Key Quorums API: POST https://api.privy.io/v1/key_quorums
   *
   * @param userIds - Array of Privy user IDs (full DID format)
   * @param threshold - Minimum signatures required (default: 1 = any can sign)
   * @param displayName - Optional name for the quorum
   */
  async createKeyQuorum(
    userIds: string[],
    threshold: number = 1,
    displayName?: string
  ) {
    try {
      this.logger.log(`Creating key quorum with users: ${userIds.join(', ')}, threshold: ${threshold}`);

      const response = await fetch('https://api.privy.io/v1/key_quorums', {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
          'privy-app-id': this.configService.get<string>('PRIVY_APP_ID')!,
        },
        body: JSON.stringify({
          user_ids: userIds,
          authorization_threshold: threshold,
          display_name: displayName,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Privy API error: ${response.status} - ${error}`);
      }

      const quorum = await response.json();
      this.logger.log(`✅ Created key quorum: ${quorum.id}`);
      return quorum;
    } catch (error) {
      this.logger.error(`Failed to create key quorum: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create wallet with owner
   * Uses Privy Wallets API: POST https://api.privy.io/v1/wallets
   *
   * IMPORTANT: Per Privy docs:
   * - If ownerId starts with "did:privy:", use owner.user_id (single user)
   * - Otherwise, use owner_id (key quorum ID)
   *
   * @param ownerId - Owner's Privy user ID (did:privy:xxx) OR key quorum ID
   * @param additionalSignerIds - Array of key quorum IDs to add as signers
   * @param chainType - Blockchain type (default: ethereum)
   */
  async createWallet(
    ownerId: string,
    additionalSignerIds: string[] = [],
    chainType: string = 'ethereum'
  ) {
    try {
      this.logger.log(`Creating wallet for owner: ${ownerId} with additional signers: ${additionalSignerIds.join(', ')}`);

      const requestBody: any = {
        chain_type: chainType,
      };

      // Check if owner is a user DID or key quorum ID
      if (ownerId.startsWith('did:privy:')) {
        // Single user owner
        requestBody.owner = {
          user_id: ownerId,
        };
      } else {
        // Key quorum owner
        requestBody.owner_id = ownerId;
      }

      // Only add additional_signers if we have any
      if (additionalSignerIds.length > 0) {
        requestBody.additional_signers = additionalSignerIds.map(signerId => ({
          signer_id: signerId,
        }));
      }

      const response = await fetch('https://api.privy.io/v1/wallets', {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
          'privy-app-id': this.configService.get<string>('PRIVY_APP_ID')!,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Privy API error: ${response.status} - ${error}`);
      }

      const wallet = await response.json();
      this.logger.log(`✅ Created wallet: ${wallet.address} (ID: ${wallet.id})`);
      return wallet;
    } catch (error) {
      this.logger.error(`Failed to create wallet: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all wallets for a user
   * Uses SDK method
   */
  async getUserWallets(userId: string) {
    try {
      this.logger.log(`Getting all wallets for user: ${userId}`);
      const user = await this.privyClient.getUser(userId);

      if (!user.linkedAccounts || !Array.isArray(user.linkedAccounts)) {
        this.logger.warn(`User ${userId} has no linked accounts`);
        return [];
      }

      const wallets = user.linkedAccounts.filter(
        (account: any) => account.type === 'wallet'
      );

      this.logger.log(`Found ${wallets.length} wallets for user ${userId}`);
      return wallets;
    } catch (error) {
      this.logger.error(`Failed to get user wallets: ${error.message}`);
      return [];
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
            'privy-app-id': appId!,
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
