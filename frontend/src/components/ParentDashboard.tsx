import {
  User,
  Wallet,
  Settings,
  Store,
  FileText,
  PiggyBank,
  ChevronRight,
  TrendingUp,
  Copy,
  Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { Button } from "./ui/button";
import { Screen } from "../App";

interface ParentDashboardProps {
  onNavigate: (screen: Screen) => void;
}

interface ChildAccountData {
  childName: string;
  childDateOfBirth: number;
  parentEmail: string;
  parentWallet?: string;
  checkingWallet?: string;
  vaultWallet?: string;
}

export function ParentDashboard({ onNavigate }: ParentDashboardProps) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [childData, setChildData] = useState<ChildAccountData | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState<string>("0");
  const [vaultBalance, setVaultBalance] = useState<string>("0");
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Get parent's name from Privy
  const parentName = user?.email?.address?.split('@')[0] ||
                     user?.google?.name ||
                     user?.twitter?.name ||
                     "Parent";

  // Get parent's wallet address
  const parentWallet = wallets[0]?.address || null;

  // Load child account data from localStorage
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
        // Use Base Sepolia RPC
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
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [childData]);

  // Calculate child's age from date of birth
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

  const childAge = childData ? calculateAge(childData.childDateOfBirth) : null;

  // Copy wallet address to clipboard
  const handleCopyAddress = () => {
    if (parentWallet) {
      navigator.clipboard.writeText(parentWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 p-6 pb-24 rounded-b-[3rem] shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/90 text-sm">Welcome back</p>
              <h2 className="text-white capitalize">{parentName}</h2>
            </div>
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Child Wallet Card */}
      <div className="px-6 -mt-16 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-purple-600 text-sm mb-1">Child's Wallet</p>
              <h3 className="text-purple-900 mb-1">{childData?.childName || "Loading..."}</h3>
              <p className="text-gray-500 text-xs">
                {childAge !== null ? `Age ${childAge}` : "Loading..."} • Active
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          {/* Total Balance */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Total Balance</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-purple-900">
                {isLoadingBalances ? "Loading..." : `$${(parseFloat(checkingBalance) + parseFloat(vaultBalance)).toFixed(2)}`}
              </h1>
              <span className="text-gray-500 text-base">USDC</span>
            </div>
          </div>

          {/* Balance Breakdown */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-sm text-gray-700">Checking (70%)</span>
              </div>
              <span className="text-indigo-600">
                {isLoadingBalances ? "..." : `$${parseFloat(checkingBalance).toFixed(2)}`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-sm text-gray-700">Vault (30%)</span>
              </div>
              <span className="text-amber-600">
                {isLoadingBalances ? "..." : `$${parseFloat(vaultBalance).toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-xs mb-1">Main Wallet Address</p>
                <p className="text-gray-900 text-xs font-mono truncate">
                  {parentWallet || "Loading..."}
                </p>
              </div>
              {parentWallet && (
                <button
                  onClick={handleCopyAddress}
                  className="flex-shrink-0 p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-purple-600" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h3 className="text-purple-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("spending")}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-2"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-purple-900">Set Spending Rules</span>
          </button>

          <button
            onClick={() => onNavigate("merchants")}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-2"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-purple-900">Manage Merchants</span>
          </button>

          <button
            onClick={() => onNavigate("transaction")}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-2"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm text-purple-900">View Transactions</span>
          </button>

          <button
            onClick={() => onNavigate("savings")}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-2"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-purple-900">Education Savings</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 pb-24">
        <h3 className="text-purple-900 mb-4">Recent Activity</h3>
        <div className="bg-white rounded-3xl p-4 shadow-sm space-y-3">
          {[
            { merchant: "Khan Academy Plus", amount: "-$15.00", category: "Education", status: "approved" },
            { merchant: "Soccer Team Fees", amount: "-$50.00", category: "Sports", status: "approved" },
            { merchant: "Gaming Store", amount: "-$25.00", category: "Entertainment", status: "blocked" },
          ].map((transaction, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                transaction.status === "approved" 
                  ? "bg-green-100" 
                  : "bg-red-100"
              }`}>
                <Store className={`w-5 h-5 ${
                  transaction.status === "approved" 
                    ? "text-green-600" 
                    : "text-red-600"
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-purple-900">{transaction.merchant}</p>
                <p className="text-xs text-gray-500">{transaction.category}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${
                  transaction.status === "approved" 
                    ? "text-purple-900" 
                    : "text-red-600"
                }`}>
                  {transaction.amount}
                </p>
                <p className={`text-xs ${
                  transaction.status === "approved" 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}>
                  {transaction.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}