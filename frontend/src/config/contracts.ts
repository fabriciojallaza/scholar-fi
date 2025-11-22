/**
 * Contract addresses and chain configuration for Scholar-Fi
 * Update these after deployment
 */

export const CHAIN_CONFIG = {
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: import.meta.env.VITE_BASE_SEPOLIA_RPC || "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
  celoSepolia: {
    chainId: 11142220,
    name: "Celo Sepolia",
    rpcUrl: import.meta.env.VITE_CELO_SEPOLIA_RPC || "https://celo-sepolia-rpc.publicnode.com",
    explorer: "https://sepolia.celoscan.io",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
  },
  oasisSapphire: {
    chainId: 23295,
    name: "Oasis Sapphire Testnet",
    rpcUrl: import.meta.env.VITE_OASIS_SAPPHIRE_RPC || "https://testnet.sapphire.oasis.io",
    explorer: "https://explorer.oasis.io/testnet/sapphire",
    nativeCurrency: {
      name: "TEST",
      symbol: "TEST",
      decimals: 18,
    },
  },
} as const;

export const CONTRACT_ADDRESSES = {
  baseBridge: import.meta.env.VITE_BASE_BRIDGE_ADDRESS || "",
  celoVault: import.meta.env.VITE_CELO_VAULT_ADDRESS || "",
  oasisDataStore: import.meta.env.VITE_OASIS_DATASTORE_ADDRESS || "",
} as const;

// Hyperlane Configuration
export const HYPERLANE_CONFIG = {
  explorerUrl: "https://explorer.hyperlane.xyz",
  mailboxes: {
    baseSepolia: "0x6966b0E55883d49BFB24539356a2f8A673E02039",
    celoSepolia: "0xD0680F80F4f947968206806C2598Cbc5b6FE5b03",
  },
  domains: {
    baseSepolia: 84532,
    celoSepolia: 11142220,
  },
} as const;

// Self Protocol Configuration
export const SELF_CONFIG = {
  hubAddress: "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74", // Self Hub V2 on Celo Sepolia
  scopeSeed: "scholar-fi-v1",
  minAge: 18,
} as const;

// Privy Configuration
export const PRIVY_CONFIG = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || "",
  // Supported chains for Privy gas sponsorship
  supportedChains: [CHAIN_CONFIG.baseSepolia.chainId],
} as const;

// Validation helpers
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!CONTRACT_ADDRESSES.baseBridge) {
    errors.push("Missing Base bridge contract address");
  }
  if (!CONTRACT_ADDRESSES.celoVault) {
    errors.push("Missing Celo vault contract address");
  }
  if (!CONTRACT_ADDRESSES.oasisDataStore) {
    errors.push("Missing Oasis data store contract address");
  }
  if (!PRIVY_CONFIG.appId) {
    errors.push("Missing Privy App ID");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
