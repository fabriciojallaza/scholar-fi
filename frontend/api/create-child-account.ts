/**
 * Serverless function to create child account
 * Calls Privy Server API to create HD wallets with additional_signers
 *
 * Deploy to: Vercel/Railway/Netlify
 * Endpoint: POST /api/create-child-account
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';

interface CreateChildAccountRequest {
  parentUserId: string;
  childName: string;
  childDateOfBirth: number;
  parentEmail: string;
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
    const { parentUserId, childName, childDateOfBirth, parentEmail } = req.body as CreateChildAccountRequest;

    // Validate inputs
    if (!parentUserId || !childName || !childDateOfBirth || !parentEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Privy Server API key from env
    const privyAppId = process.env.PRIVY_APP_ID;
    const privyAppSecret = process.env.PRIVY_APP_SECRET;

    if (!privyAppId || !privyAppSecret) {
      return res.status(500).json({ error: 'Privy credentials not configured' });
    }

    // Step 1: Create child user entity in Privy
    const childUserId = await createPrivyUser(privyAppId, privyAppSecret, childName, parentEmail);

    // Step 2: Get parent's main wallet (index 0)
    const parentWallets = await getPrivyWallets(privyAppId, privyAppSecret, parentUserId);
    const parentMainWallet = parentWallets.find((w: any) => w.wallet_index === 0);

    if (!parentMainWallet) {
      return res.status(400).json({ error: 'Parent does not have a main wallet' });
    }

    // Step 3: Create checking wallet (index 1, child as additional_signer)
    const checkingWallet = await createPrivyWallet(
      privyAppId,
      privyAppSecret,
      parentUserId,
      1, // Wallet index 1
      [{ signer_id: childUserId }] // Child is additional signer
    );

    // Step 4: Create vault wallet (index 2, child as additional_signer)
    const vaultWallet = await createPrivyWallet(
      privyAppId,
      privyAppSecret,
      parentUserId,
      2, // Wallet index 2
      [{ signer_id: childUserId }] // Child is additional signer
    );

    // Step 5: Generate unique child address (derived from child user ID)
    const childAddress = ethers.keccak256(ethers.toUtf8Bytes(childUserId)).slice(0, 42);

    // Step 6: Register wallets on Base Sepolia ParentDepositSplitter
    const baseRegistered = await registerOnBase(
      childAddress,
      checkingWallet.address,
      vaultWallet.address
    );

    // Step 7: Register child on Celo ScholarFiAgeVerifier
    const celoRegistered = await registerOnCelo(
      childAddress,
      parentMainWallet.address
    );

    // Step 8: Create encrypted profile on Oasis Sapphire
    const oasisProfileCreated = await createOasisProfile(
      childAddress,
      childName,
      childDateOfBirth,
      parentEmail,
      checkingWallet.address,
      vaultWallet.address,
      parentMainWallet.address
    );

    // Success!
    return res.status(200).json({
      success: true,
      childAddress,
      childUserId,
      checkingWallet: {
        id: checkingWallet.id,
        address: checkingWallet.address
      },
      vaultWallet: {
        id: vaultWallet.id,
        address: vaultWallet.address
      },
      oasisProfileCreated,
      celoRegistered,
      baseRegistered
    });

  } catch (error: any) {
    console.error('Error creating child account:', error);
    return res.status(500).json({
      error: 'Failed to create child account',
      message: error.message
    });
  }
}

// ============ Helper Functions ============

async function createPrivyUser(appId: string, appSecret: string, name: string, parentEmail: string): Promise<string> {
  // Generate temporary email for child
  const tempEmail = `child-${Date.now()}@scholarfi.temp`;

  const response = await fetch('https://auth.privy.io/api/v1/users', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: tempEmail,
      metadata: {
        name,
        parent_email: parentEmail,
        account_type: 'child',
        created_at: Date.now()
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create Privy user: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

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

async function createPrivyWallet(
  appId: string,
  appSecret: string,
  userId: string,
  walletIndex: number,
  additionalSigners: { signer_id: string }[]
): Promise<any> {
  const response = await fetch('https://auth.privy.io/api/v1/wallets', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      chain_type: 'ethereum',
      entropy_type: 'hd',
      wallet_index: walletIndex,
      additional_signers: additionalSigners
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create Privy wallet: ${response.statusText}`);
  }

  return await response.json();
}

async function registerOnBase(childAddress: string, checkingWallet: string, vaultWallet: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.VITE_BASE_SEPOLIA_RPC);
    const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);

    const splitterAddress = process.env.VITE_BASE_SPLITTER_ADDRESS;
    const splitterAbi = [
      'function registerChildWallets(address childAddress, address checkingWallet, address vaultWallet) external'
    ];

    const splitter = new ethers.Contract(splitterAddress!, splitterAbi, signer);
    const tx = await splitter.registerChildWallets(childAddress, checkingWallet, vaultWallet);
    await tx.wait();

    return true;
  } catch (error) {
    console.error('Failed to register on Base:', error);
    return false;
  }
}

async function registerOnCelo(childAddress: string, parentAddress: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.VITE_CELO_SEPOLIA_RPC);
    const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);

    const verifierAddress = process.env.VITE_CELO_VERIFIER_ADDRESS;
    const verifierAbi = [
      'function registerChild(address childAddress, address parentAddress) external'
    ];

    const verifier = new ethers.Contract(verifierAddress!, verifierAbi, signer);
    const tx = await verifier.registerChild(childAddress, parentAddress);
    await tx.wait();

    return true;
  } catch (error) {
    console.error('Failed to register on Celo:', error);
    return false;
  }
}

async function createOasisProfile(
  childAddress: string,
  childName: string,
  dateOfBirth: number,
  parentEmail: string,
  checkingWallet: string,
  vaultWallet: string,
  parentWallet: string
): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.VITE_OASIS_SAPPHIRE_RPC);
    const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);

    const datastoreAddress = process.env.VITE_OASIS_DATASTORE_ADDRESS;
    const datastoreAbi = [
      'function createChildProfile(address,string,uint256,string,address,address,address,address) external'
    ];

    const datastore = new ethers.Contract(datastoreAddress!, datastoreAbi, signer);
    const tx = await datastore.createChildProfile(
      childAddress,
      childName, // Encrypted by Sapphire TEE
      dateOfBirth,
      parentEmail,
      checkingWallet,
      vaultWallet,
      parentWallet,
      process.env.VITE_CELO_VERIFIER_ADDRESS!
    );
    await tx.wait();

    return true;
  } catch (error) {
    console.error('Failed to create Oasis profile:', error);
    return false;
  }
}
