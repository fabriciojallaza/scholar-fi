import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft,
  Wallet,
  Lock,
  ArrowDownToLine,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { Button } from "./ui/button";
import { ethers } from "ethers";

interface ManageFundsProps {
  onBack: () => void;
}

interface ChildAccountData {
  childName: string;
  childDateOfBirth: number;
  childAddress?: string;
  checkingWallet?: string;
  vaultWallet?: string;
}

export function ManageFunds({ onBack }: ManageFundsProps) {
  const [childData, setChildData] = useState<ChildAccountData | null>(null);
  const [checkingBalance, setCheckingBalance] = useState<string>("0");
  const [vaultBalance, setVaultBalance] = useState<string>("0");
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  // Withdraw state
  const [error, setError] = useState<string | null>(null);

  // Calculate if child is 18+
  const calculateAge = (dobTimestamp: number) => {
    const birthDate = new Date(dobTimestamp * 1000);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isChild18Plus = childData ? calculateAge(childData.childDateOfBirth) >= 18 : false;

  // Load child account data
  useEffect(() => {
    const storedData = localStorage.getItem('childAccountData');
    if (storedData) {
      setChildData(JSON.parse(storedData));
    }
  }, []);

  // Fetch wallet balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!childData?.checkingWallet || !childData?.vaultWallet) return;

      setIsLoadingBalances(true);
      try {
        const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

        // USDC contract on Base Sepolia
        const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
        const USDC_ABI = [
          "function balanceOf(address account) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ];

        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);

        // Fetch USDC balances
        const [checkingBalanceRaw, vaultBalanceRaw] = await Promise.all([
          usdcContract.balanceOf(childData.checkingWallet),
          usdcContract.balanceOf(childData.vaultWallet)
        ]);

        // USDC has 6 decimals
        setCheckingBalance(ethers.formatUnits(checkingBalanceRaw, 6));
        setVaultBalance(ethers.formatUnits(vaultBalanceRaw, 6));
      } catch (error) {
        console.error("Failed to fetch balances:", error);
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [childData]);

  // Check verification status on Celo
  useEffect(() => {
    const checkVerification = async () => {
      if (!childData?.childAddress) return;

      setIsCheckingVerification(true);
      try {
        // Connect to Celo Sepolia
        const celoProvider = new ethers.JsonRpcProvider("https://forno.celo-sepolia.celo-testnet.org");

        const VERIFIER_ADDRESS = "0x181A6c2359A39628415aB91bD99306c2927DfAb9";
        const VERIFIER_ABI = [
          "function isChildVerified(address childAddress) external view returns (bool)"
        ];

        const verifierContract = new ethers.Contract(VERIFIER_ADDRESS, VERIFIER_ABI, celoProvider);
        const verified = await verifierContract.isChildVerified(childData.childAddress);

        setIsVerified(verified);
      } catch (error) {
        console.error("Failed to check verification status:", error);
      } finally {
        setIsCheckingVerification(false);
      }
    };

    checkVerification();
    // Refresh every 60 seconds
    const interval = setInterval(checkVerification, 60000);
    return () => clearInterval(interval);
  }, [childData]);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedWallet(address);
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 p-6 pb-8 rounded-b-[3rem] shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white">Manage Funds</h1>
        </div>
        <p className="text-white/80 text-sm ml-14">
          View and manage your child's wallets
        </p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 rounded-3xl p-5 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-900 font-medium">Error</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Checking Wallet Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-purple-900 font-medium">Checking Wallet</h3>
                <p className="text-gray-500 text-xs">Available for spending (70%)</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-1">Balance</p>
            <p className="text-2xl text-purple-900 font-bold">
              {isLoadingBalances ? "Loading..." : `$${parseFloat(checkingBalance).toFixed(2)} USDC`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 mb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-1">Wallet Address</p>
                <p className="text-xs font-mono text-gray-900 truncate">
                  {childData?.checkingWallet || "Loading..."}
                </p>
              </div>
              {childData?.checkingWallet && (
                <button
                  onClick={() => handleCopyAddress(childData.checkingWallet!)}
                  className="flex-shrink-0 p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors"
                >
                  {copiedWallet === childData.checkingWallet ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>

          <Button
            onClick={() => {
              setError("Withdrawal functionality coming soon. Use Privy dashboard to send funds for now.");
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Withdraw</span>
          </Button>
        </div>

        {/* Vault Wallet Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-purple-900 font-medium">Vault Wallet</h3>
                <p className="text-gray-500 text-xs">Locked until age 18 (30%)</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-1">Balance</p>
            <p className="text-2xl text-purple-900 font-bold">
              {isLoadingBalances ? "Loading..." : `$${parseFloat(vaultBalance).toFixed(2)} USDC`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 mb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-1">Wallet Address</p>
                <p className="text-xs font-mono text-gray-900 truncate">
                  {childData?.vaultWallet || "Loading..."}
                </p>
              </div>
              {childData?.vaultWallet && (
                <button
                  onClick={() => handleCopyAddress(childData.vaultWallet!)}
                  className="flex-shrink-0 p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors"
                >
                  {copiedWallet === childData.vaultWallet ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-4">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-900 font-medium">Vault Locked</p>
                <p className="text-xs text-amber-700 mt-1">
                  This wallet is locked until your child turns 18. They'll need to verify their age with Self Protocol to unlock.
                </p>
              </div>
            </div>
          </div>

          <Button
            disabled
            className="w-full bg-gray-300 text-gray-500 py-3 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            <span>Unlock at Age 18</span>
          </Button>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-5 border border-purple-100">
          <h4 className="text-sm font-medium text-purple-900 mb-3">How it works</h4>
          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span><strong>Checking Wallet (70%):</strong> Available for immediate use. You can withdraw funds anytime.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600">•</span>
              <span><strong>Vault Wallet (30%):</strong> Automatically saved for education. Unlocks when child turns 18 and verifies age.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Both wallets are controlled by a key quorum - both parent and child can sign transactions.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
