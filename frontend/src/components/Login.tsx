import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, Mail, Wallet, Shield, AlertCircle } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "./ui/button";
import { useMultiChain } from "../hooks/useMultiChain";

interface LoginProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  // Safely use Privy hooks with error handling
  let login: (() => void) | undefined;
  let ready = false;
  let authenticated = false;
  let privyError: string | null = null;

  try {
    const privyHooks = usePrivy();
    login = privyHooks.login;
    ready = privyHooks.ready;
    authenticated = privyHooks.authenticated;
  } catch (err: any) {
    console.error("Privy not initialized:", err);
    privyError = "Privy authentication is not configured. Please add VITE_PRIVY_APP_ID to .env";
  }

  const { isConnected, address, error } = useMultiChain();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to onboarding when authenticated
  useEffect(() => {
    if (authenticated && isConnected) {
      onLogin();
    }
  }, [authenticated, isConnected, onLogin]);

  const handleLogin = async () => {
    if (!login) {
      console.error("Privy login function not available");
      return;
    }

    try {
      setIsLoading(true);
      login();
    } catch (err: any) {
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 flex flex-col">
      {/* Header */}
      <div className="p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Wallet className="w-7 h-7 text-white" />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center text-white mb-2"
        >
          Scholar-Fi
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-white/80 text-sm"
        >
          Smart Education Savings for Families
        </motion.p>
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-1 bg-white rounded-t-[3rem] mt-8 p-8"
      >
        <h2 className="text-purple-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600 mb-8">Connect your wallet to continue</p>

        {/* Connection Status */}
        {isConnected && address && (
          <div className="mb-6 p-4 bg-green-50 rounded-2xl">
            <p className="text-sm text-green-900 mb-1">Connected</p>
            <p className="text-xs text-green-700 font-mono">{address.substring(0, 6)}...{address.substring(address.length - 4)}</p>
          </div>
        )}

        {/* Error Display */}
        {(error || privyError) && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-900">
                {privyError ? "Configuration Error" : "Connection Error"}
              </p>
              <p className="text-xs text-red-700 mt-1">{privyError || error}</p>
            </div>
          </div>
        )}

        {/* Login Methods */}
        <div className="space-y-4">
          {/* Privy Login Button */}
          <Button
            onClick={handleLogin}
            disabled={!ready || isLoading || authenticated || !!privyError}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Connecting...
              </span>
            ) : authenticated ? (
              "Connected"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </span>
            )}
          </Button>

          {/* Email Login (via Privy modal) */}
          <button
            onClick={handleLogin}
            disabled={!ready || isLoading || authenticated || !!privyError}
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-purple-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-5 h-5 text-purple-600" />
            <span className="text-purple-900">Continue with Email</span>
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-purple-50 rounded-2xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-purple-900">Secure & Non-Custodial</p>
            <p className="text-xs text-purple-600 mt-1">
              Your wallet is created and secured by Privy. We never have access to your funds.
            </p>
          </div>
        </div>

        {/* Multi-Chain Info */}
        <div className="mt-4 p-4 bg-indigo-50 rounded-2xl">
          <p className="text-sm text-indigo-900 mb-2">Multi-Chain Support</p>
          <div className="space-y-1 text-xs text-indigo-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              <span>Base Sepolia - Deposits with gas sponsorship</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              <span>Celo Sepolia - Secure vault with age verification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              <span>Oasis Sapphire - Encrypted data storage</span>
            </div>
          </div>
        </div>

        {/* Info text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            New users will automatically be registered on first login
          </p>
        </div>
      </motion.div>
    </div>
  );
}
