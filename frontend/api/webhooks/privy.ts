/**
 * Privy Webhook Handler
 * Listens for wallet.balance_changed events to track deposits
 *
 * Webhook Setup (Privy Dashboard):
 * 1. Go to Privy Dashboard → Webhooks
 * 2. Add webhook URL: https://your-domain.vercel.app/api/webhooks/privy
 * 3. Subscribe to: wallet.balance_changed
 * 4. Copy webhook secret to env: PRIVY_WEBHOOK_SECRET
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';
import { ethers } from 'ethers';

interface PrivyWebhookPayload {
  event: string;
  data: {
    wallet_id: string;
    user_id: string;
    address: string;
    balance_change: string;
    chain_type: string;
    timestamp: number;
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Step 1: Verify webhook signature
    const signature = req.headers['x-privy-signature'] as string;
    const webhookSecret = process.env.PRIVY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('PRIVY_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!verifySignature(JSON.stringify(req.body), signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = req.body as PrivyWebhookPayload;

    // Step 2: Only process balance_changed events
    if (payload.event !== 'wallet.balance_changed') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const { address, balance_change, user_id } = payload.data;
    const balanceChangeWei = BigInt(balance_change);

    // Only process positive balance changes (deposits)
    if (balanceChangeWei <= 0) {
      return res.status(200).json({ message: 'Not a deposit' });
    }

    // Step 3: Find which child account this deposit belongs to
    const childAddress = await findChildByWallet(address);

    if (!childAddress) {
      console.log(`Deposit to ${address} does not belong to any child account`);
      return res.status(200).json({ message: 'Not a child wallet' });
    }

    // Step 4: Update Oasis ChildDataStore with deposit amount
    const oasisUpdated = await recordDepositOnOasis(childAddress, balanceChangeWei);

    console.log(`✅ Processed deposit for child ${childAddress}: ${ethers.formatEther(balanceChangeWei)} ETH`);

    return res.status(200).json({
      success: true,
      childAddress,
      depositAmount: balance_change,
      oasisUpdated
    });

  } catch (error: any) {
    console.error('Error processing Privy webhook:', error);
    return res.status(500).json({
      error: 'Failed to process webhook',
      message: error.message
    });
  }
}

// ============ Helper Functions ============

/**
 * Verify Privy webhook signature
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');

  return signature === expectedSignature;
}

/**
 * Find child address by wallet address
 * Query Oasis to find which child profile this wallet belongs to
 */
async function findChildByWallet(walletAddress: string): Promise<string | null> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.VITE_OASIS_SAPPHIRE_RPC);
    const datastoreAddress = process.env.VITE_OASIS_DATASTORE_ADDRESS;

    const datastoreAbi = [
      'function getBaseWallets(address) external view returns (address checking, address vault, address parent)'
    ];

    const datastore = new ethers.Contract(datastoreAddress!, datastoreAbi, provider);

    // Note: This is inefficient for production. Consider maintaining an off-chain index.
    // For MVP, we'd need to iterate through known child addresses or use events.
    // Alternative: Store wallet->child mapping in a database when accounts are created.

    // For now, we'll assume the backend maintains this mapping
    // This function should query your database/cache

    return null; // TODO: Implement proper lookup
  } catch (error) {
    console.error('Failed to find child by wallet:', error);
    return null;
  }
}

/**
 * Record deposit on Oasis Sapphire ChildDataStore
 */
async function recordDepositOnOasis(childAddress: string, depositAmount: bigint): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.VITE_OASIS_SAPPHIRE_RPC);
    const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);

    const datastoreAddress = process.env.VITE_OASIS_DATASTORE_ADDRESS;
    const datastoreAbi = [
      'function recordDeposit(address childAddress, uint256 additionalDeposit) external'
    ];

    const datastore = new ethers.Contract(datastoreAddress!, datastoreAbi, signer);
    const tx = await datastore.recordDeposit(childAddress, depositAmount);
    await tx.wait();

    console.log(`✅ Updated Oasis for child ${childAddress}: +${ethers.formatEther(depositAmount)} ETH`);
    return true;
  } catch (error) {
    console.error('Failed to record deposit on Oasis:', error);
    return false;
  }
}
