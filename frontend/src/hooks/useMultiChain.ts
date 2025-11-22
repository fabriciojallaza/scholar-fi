import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CHAIN_CONFIG, CONTRACT_ADDRESSES } from "../config/contracts";

// Import ABIs
import ParentDepositSplitterABI from "../abis/ParentDepositSplitter.json";
import ScholarFiAgeVerifierABI from "../abis/ScholarFiAgeVerifier.json";
import ChildDataStoreABI from "../abis/ChildDataStore.json";

export interface MultiChainProviders {
  // Base Sepolia (Privy + gas sponsorship + deposits)
  baseProvider: ethers.BrowserProvider | null;
  baseSigner: ethers.JsonRpcSigner | null;
  splitterContract: ethers.Contract | null; // ParentDepositSplitter

  // Celo Sepolia (Self age verification)
  celoProvider: ethers.JsonRpcProvider | null;
  verifierContract: ethers.Contract | null; // ScholarFiAgeVerifier

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
 * - Base Sepolia: All wallet operations (Privy HD wallets + gas sponsorship)
 * - Celo Sepolia: Age verification via Self Protocol
 * - Oasis Sapphire: Encrypted child data storage
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
  const splitterContract = useMemo(() => {
    if (!baseSigner || !CONTRACT_ADDRESSES.baseSplitter) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.baseSplitter,
      ParentDepositSplitterABI,
      baseSigner
    );
  }, [baseSigner]);

  const verifierContract = useMemo(() => {
    if (!celoProvider || !CONTRACT_ADDRESSES.celoVerifier) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.celoVerifier,
      ScholarFiAgeVerifierABI,
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
    splitterContract,
    celoProvider,
    verifierContract,
    oasisProvider,
    datastoreContract,
    isConnected: authenticated && !!address,
    address,
    isLoading: !ready,
    error,
  };
}
