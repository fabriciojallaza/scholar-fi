/**
 * Celo Event Listener (Serverless Cron Job)
 * Monitors ScholarFiAgeVerifier for ChildVerified events
 * Triggers Privy wallet policy updates when age verification completes
 *
 * Deployment:
 * - Configure in vercel.json as cron job (runs every 5 minutes)
 * - Can also be triggered manually: POST /api/webhooks/celo
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';

interface ChildVerifiedEvent {
  childAddress: string;
  parentAddress: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}

// Track last processed block (in production, use Redis/database)
let lastProcessedBlock = 0;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Allow both GET (cron) and POST (manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Checking Celo for ChildVerified events...');

    // Step 1: Connect to Celo Sepolia
    const provider = new ethers.JsonRpcProvider(process.env.VITE_CELO_SEPOLIA_RPC);
    const verifierAddress = process.env.VITE_CELO_VERIFIER_ADDRESS;

    if (!verifierAddress) {
      return res.status(500).json({ error: 'Celo verifier address not configured' });
    }

    // Step 2: Setup contract interface
    const verifierAbi = [
      'event ChildVerified(address indexed childAddress, address indexed parentAddress, uint256 timestamp, tuple(bytes32 scope, uint256 nonce) output)',
      'function getChildVerification(address) external view returns (tuple(address childAddress, address parentAddress, bool isVerified, uint256 verifiedAt))'
    ];

    const verifier = new ethers.Contract(verifierAddress, verifierAbi, provider);

    // Step 3: Fetch latest block
    const currentBlock = await provider.getBlockNumber();

    // If first run, only check last 1000 blocks to avoid hitting rate limits
    if (lastProcessedBlock === 0) {
      lastProcessedBlock = Math.max(0, currentBlock - 1000);
    }

    console.log(`📊 Scanning blocks ${lastProcessedBlock} to ${currentBlock}`);

    // Step 4: Query for ChildVerified events
    const filter = verifier.filters.ChildVerified();
    const events = await verifier.queryFilter(filter, lastProcessedBlock + 1, currentBlock);

    console.log(`📬 Found ${events.length} ChildVerified events`);

    const processedEvents: ChildVerifiedEvent[] = [];

    // Step 5: Process each event
    for (const event of events) {
      const childAddress = event.args?.childAddress;
      const parentAddress = event.args?.parentAddress;
      const timestamp = Number(event.args?.timestamp);

      if (!childAddress || !parentAddress) continue;

      console.log(`✅ Processing verification for child ${childAddress}`);

      // Step 6: Update Privy wallet policy (transfer ownership to child)
      const privyUpdated = await updatePrivyPolicy(childAddress, parentAddress);

      // Step 7: Update Oasis datastore
      const oasisUpdated = await updateOasisVerification(childAddress);

      processedEvents.push({
        childAddress,
        parentAddress,
        timestamp,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });

      console.log(`✅ Completed processing for child ${childAddress}`);
    }

    // Step 8: Update last processed block
    lastProcessedBlock = currentBlock;

    return res.status(200).json({
      success: true,
      eventsProcessed: processedEvents.length,
      lastBlock: currentBlock,
      events: processedEvents
    });

  } catch (error: any) {
    console.error('Error processing Celo events:', error);
    return res.status(500).json({
      error: 'Failed to process Celo events',
      message: error.message
    });
  }
}

// ============ Helper Functions ============

/**
 * Update Privy wallet policy to transfer ownership from parent to child
 */
async function updatePrivyPolicy(childAddress: string, parentAddress: string): Promise<boolean> {
  try {
    const privyAppId = process.env.PRIVY_APP_ID;
    const privyAppSecret = process.env.PRIVY_APP_SECRET;

    if (!privyAppId || !privyAppSecret) {
      console.error('Privy credentials not configured');
      return false;
    }

    // Step 1: Get child's Privy user ID from Oasis
    const childUserId = await getChildUserIdFromOasis(childAddress);

    if (!childUserId) {
      console.error(`Could not find Privy user ID for child ${childAddress}`);
      return false;
    }

    // Step 2: Get parent's Privy user ID
    const parentUserId = await getParentUserIdFromOasis(parentAddress);

    if (!parentUserId) {
      console.error(`Could not find Privy user ID for parent ${parentAddress}`);
      return false;
    }

    // Step 3: Get parent's wallets to find vault wallet (index 2)
    const parentWallets = await getPrivyWallets(privyAppId, privyAppSecret, parentUserId);
    const vaultWallet = parentWallets.find((w: any) => w.wallet_index === 2);

    if (!vaultWallet) {
      console.error(`Could not find vault wallet for parent ${parentAddress}`);
      return false;
    }

    // Step 4: Update vault wallet policy to transfer ownership
    // Note: Privy's exact API for this may vary - adjust based on docs
    const response = await fetch(`https://auth.privy.io/api/v1/wallets/${vaultWallet.id}/policy`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        primary_signer: childUserId,  // Transfer ownership to child
        spending_limits: null,         // Remove restrictions
        time_locks: null
      })
    });

    if (!response.ok) {
      console.error(`Failed to update Privy policy: ${response.statusText}`);
      return false;
    }

    console.log(`✅ Transferred vault ownership to child ${childAddress}`);
    return true;

  } catch (error) {
    console.error('Failed to update Privy policy:', error);
    return false;
  }
}

/**
 * Update Oasis ChildDataStore with verification status
 */
async function updateOasisVerification(childAddress: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.VITE_OASIS_SAPPHIRE_RPC);
    const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);

    const datastoreAddress = process.env.VITE_OASIS_DATASTORE_ADDRESS;
    const datastoreAbi = [
      'function markAgeVerified(address childAddress) external'
    ];

    const datastore = new ethers.Contract(datastoreAddress!, datastoreAbi, signer);
    const tx = await datastore.markAgeVerified(childAddress);
    await tx.wait();

    console.log(`✅ Updated Oasis verification status for child ${childAddress}`);
    return true;
  } catch (error) {
    console.error('Failed to update Oasis:', error);
    return false;
  }
}

/**
 * Get Privy user ID from Oasis (stored in metadata when account created)
 */
async function getChildUserIdFromOasis(childAddress: string): Promise<string | null> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.VITE_OASIS_SAPPHIRE_RPC);
    const datastoreAddress = process.env.VITE_OASIS_DATASTORE_ADDRESS;

    const datastoreAbi = [
      'function getChildProfile(address) external view returns (string memory, uint256, string memory, address, address, address, bool, uint256, uint256, uint256)'
    ];

    const datastore = new ethers.Contract(datastoreAddress!, datastoreAbi, provider);
    const profile = await datastore.getChildProfile(childAddress);

    // Note: Current ChildDataStore doesn't store Privy user ID
    // Need to either:
    // 1. Add it to the struct, or
    // 2. Maintain mapping in database
    // For MVP, we'll need to extend ChildDataStore

    return null; // TODO: Implement proper storage/retrieval
  } catch (error) {
    console.error('Failed to get child user ID from Oasis:', error);
    return null;
  }
}

/**
 * Get parent's Privy user ID from Oasis
 */
async function getParentUserIdFromOasis(parentAddress: string): Promise<string | null> {
  // Similar to getChildUserIdFromOasis
  // Need to implement proper storage
  return null; // TODO: Implement
}

/**
 * Get Privy wallets for a user
 */
async function getPrivyWallets(appId: string, appSecret: string, userId: string): Promise<any[]> {
  const response = await fetch(`https://auth.privy.io/api/v1/users/${userId}/wallets`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get Privy wallets: ${response.statusText}`);
  }

  const data = await response.json();
  return data.wallets || [];
}
