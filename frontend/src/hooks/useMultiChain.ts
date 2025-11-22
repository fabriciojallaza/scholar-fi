import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CHAIN_CONFIG, CONTRACT_ADDRESSES } from "../config/contracts";

// Import ABIs
import ScholarFiBridgeABI from "../abis/ScholarFiBridge.json";
import ScholarFiVaultABI from "../abis/ScholarFiVault.json";
import ChildDataStoreABI from "../abis/ChildDataStore.json";

export interface MultiChainProviders {
  // Base Sepolia (Privy + gas sponsorship)
  baseProvider: ethers.BrowserProvider | null;
  baseSigner: ethers.JsonRpcSigner | null;
  bridgeContract: ethers.Contract | null;

  // Celo Sepolia (vault + Self verification)
  celoProvider: ethers.JsonRpcProvider | null;
  vaultContract: ethers.Contract | null;

  // Oasis Sapphire (encrypted storage)
  oasisProvider: ethers.JsonRpcProvider | null;
  datastoreContract: ethers.Contract | null;

  // Connection status
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing multi-chain connections
 * - Base Sepolia: Privy wallet with gas sponsorship
 * - Celo Sepolia: Read-only provider for vault operations
 * - Oasis Sapphire: Read-only provider for encrypted data
 */
export function useMultiChain(): MultiChainProviders {
  // Safely use Privy hooks with error handling
  let ready = false;
  let authenticated = false;
  let user: any = null;
  let wallets: any[] = [];
  let privyAvailable = true;

  try {
    const privyHooks = usePrivy();
    const walletHooks = useWallets();
    ready = privyHooks.ready;
    authenticated = privyHooks.authenticated;
    user = privyHooks.user;
    wallets = walletHooks.wallets;
  } catch (err) {
    console.error("Privy hooks not available:", err);
    privyAvailable = false;
  }

  const [baseProvider, setBaseProvider] = useState<ethers.BrowserProvider | null>(null);
  const [baseSigner, setBaseSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [celoProvider, setCeloProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [oasisProvider, setOasisProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize providers when wallet is connected
  useEffect(() => {
    async function initializeProviders() {
      try {
        setError(null);

        if (!privyAvailable) {
          setError("Wallet provider not configured");
          return;
        }

        if (!authenticated || !user || wallets.length === 0) {
          return;
        }

        // Get the embedded wallet from Privy
        const wallet = wallets[0];

        // Switch to Base Sepolia for transactions
        await wallet.switchChain(CHAIN_CONFIG.baseSepolia.chainId);

        // Create ethers provider from Privy wallet
        const provider = await wallet.getEthersProvider();
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const userAddress = await signer.getAddress();

        setBaseProvider(ethersProvider);
        setBaseSigner(signer);
        setAddress(userAddress);

        // Initialize Celo read-only provider
        const celoRpc = new ethers.JsonRpcProvider(CHAIN_CONFIG.celoSepolia.rpcUrl);
        setCeloProvider(celoRpc);

        // Initialize Oasis read-only provider
        const oasisRpc = new ethers.JsonRpcProvider(CHAIN_CONFIG.oasisSapphire.rpcUrl);
        setOasisProvider(oasisRpc);

      } catch (err: any) {
        console.error("Failed to initialize providers:", err);
        setError(err.message || "Failed to connect wallets");
      }
    }

    initializeProviders();
  }, [authenticated, user, wallets, privyAvailable]);

  // Create contract instances
  const bridgeContract = useMemo(() => {
    if (!baseSigner || !CONTRACT_ADDRESSES.baseBridge) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.baseBridge,
      ScholarFiBridgeABI,
      baseSigner
    );
  }, [baseSigner]);

  const vaultContract = useMemo(() => {
    if (!celoProvider || !CONTRACT_ADDRESSES.celoVault) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.celoVault,
      ScholarFiVaultABI,
      celoProvider
    );
  }, [celoProvider]);

  const datastoreContract = useMemo(() => {
    if (!oasisProvider || !CONTRACT_ADDRESSES.oasisDataStore) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.oasisDataStore,
      ChildDataStoreABI,
      oasisProvider
    );
  }, [oasisProvider]);

  return {
    baseProvider,
    baseSigner,
    bridgeContract,
    celoProvider,
    vaultContract,
    oasisProvider,
    datastoreContract,
    isConnected: authenticated && !!address,
    address,
    isLoading: !ready,
    error,
  };
}
