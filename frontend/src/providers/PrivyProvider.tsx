import { useState } from "react";
import { PrivyProvider as PrivyAuth } from "@privy-io/react-auth";
import { base, baseSepolia } from "viem/chains";
import { PRIVY_CONFIG, CHAIN_CONFIG, validateConfig } from "../config/contracts";

interface PrivyProviderProps {
  children: React.ReactNode;
}

/**
 * Configuration warning banner component
 */
function ConfigWarning({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⚠️</span>
            <p className="font-semibold">Configuration Required</p>
          </div>
          <p className="text-sm opacity-90 pl-7">
            Missing Privy App ID. Get it from{" "}
            <a
              href="https://dashboard.privy.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80 font-medium"
            >
              dashboard.privy.io
            </a>
            {" "}and add to <code className="bg-yellow-600 px-1 rounded">.env</code> as <code className="bg-yellow-600 px-1 rounded">VITE_PRIVY_APP_ID</code>
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-white hover:opacity-80 text-2xl leading-none font-bold px-2 py-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Privy authentication provider with gas sponsorship for Base Sepolia
 * Handles wallet creation, authentication, and gasless transactions
 */
export function PrivyProvider({ children }: PrivyProviderProps) {
  const [showWarning, setShowWarning] = useState(true);

  // Check if Privy is properly configured
  const hasValidPrivyId = PRIVY_CONFIG.appId &&
                          PRIVY_CONFIG.appId !== "clxxx-placeholder-replace-with-real-id" &&
                          PRIVY_CONFIG.appId.startsWith("cl");

  // If no valid Privy ID, render children without PrivyAuth wrapper but show warning
  if (!hasValidPrivyId) {
    return (
      <>
        {showWarning && <ConfigWarning onDismiss={() => setShowWarning(false)} />}
        <div className={showWarning ? "pt-20" : ""}>
          {children}
        </div>
      </>
    );
  }

  return (
    <PrivyAuth
      appId={PRIVY_CONFIG.appId}
      config={{
        // Appearance
        appearance: {
          theme: "light",
          accentColor: "#8B5CF6", // purple-500
          logo: "/logo.png",
        },

        // Embedded wallets
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false,
        },

        // Supported login methods
        loginMethods: ["email", "wallet"],

        // Default chain for wallet creation
        defaultChain: baseSepolia,

        // Supported chains (Base Sepolia for deposits, others for reading)
        supportedChains: [
          baseSepolia,
          {
            id: CHAIN_CONFIG.celoSepolia.chainId,
            name: CHAIN_CONFIG.celoSepolia.name,
            network: "celo-sepolia",
            nativeCurrency: CHAIN_CONFIG.celoSepolia.nativeCurrency,
            rpcUrls: {
              default: { http: [CHAIN_CONFIG.celoSepolia.rpcUrl] },
              public: { http: [CHAIN_CONFIG.celoSepolia.rpcUrl] },
            },
            blockExplorers: {
              default: {
                name: "Celoscan",
                url: CHAIN_CONFIG.celoSepolia.explorer,
              },
            },
          },
          {
            id: CHAIN_CONFIG.oasisSapphire.chainId,
            name: CHAIN_CONFIG.oasisSapphire.name,
            network: "oasis-sapphire",
            nativeCurrency: CHAIN_CONFIG.oasisSapphire.nativeCurrency,
            rpcUrls: {
              default: { http: [CHAIN_CONFIG.oasisSapphire.rpcUrl] },
              public: { http: [CHAIN_CONFIG.oasisSapphire.rpcUrl] },
            },
            blockExplorers: {
              default: {
                name: "Oasis Explorer",
                url: CHAIN_CONFIG.oasisSapphire.explorer,
              },
            },
          },
        ],
      }}
    >
      {children}
    </PrivyAuth>
  );
}
