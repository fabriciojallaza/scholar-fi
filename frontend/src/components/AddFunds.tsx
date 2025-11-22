import { useState } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft,
  Wallet,
  ArrowRight,
  Info,
  PiggyBank,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Button } from "./ui/button";
import { useMultiChain } from "../hooks/useMultiChain";
import { ethers } from "ethers";

interface AddFundsProps {
  onBack: () => void;
}

export function AddFunds({ onBack }: AddFundsProps) {
  const [amount, setAmount] = useState("");
  const [childAddress, setChildAddress] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { splitterContract, baseSigner, address, isConnected } = useMultiChain();

  const quickAmounts = ["10", "25", "50", "100"];

  const numAmount = parseFloat(amount) || 0;
  const vaultAmount = numAmount * 0.30; // 30% to vault
  const spendingAmount = numAmount * 0.70; // 70% to spending

  const handleAddFunds = async () => {
    if (!isConnected || !splitterContract || !baseSigner) {
      setError("Please connect your wallet");
      return;
    }

    if (!childAddress || !ethers.isAddress(childAddress)) {
      setError("Please enter a valid child address");
      return;
    }

    if (numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setIsDepositing(true);
      setError(null);
      setSuccess(false);

      const depositAmount = ethers.parseEther(amount);

      // Call depositForChild on Base ParentDepositSplitter
      // This automatically splits 70/30 to checking/vault wallets
      const tx = await splitterContract.depositForChild(childAddress, {
        value: depositAmount
      });

      // Wait for transaction
      const receipt = await tx.wait();

      setTxHash(receipt.hash);
      setSuccess(true);

      // Reset form
      setAmount("");
    } catch (err: any) {
      console.error("Failed to add funds:", err);
      if (err.code === "ACTION_REJECTED") {
        setError("Transaction rejected by user");
      } else if (err.message?.includes("insufficient funds")) {
        setError("Insufficient balance for deposit");
      } else if (err.message?.includes("ChildNotRegistered")) {
        setError("Child not registered. Please complete onboarding first.");
      } else {
        setError(err.message || "Failed to deposit funds. Please try again.");
      }
    } finally {
      setIsDepositing(false);
    }
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
          <h1 className="text-white">Add Funds</h1>
        </div>
        <p className="text-white/80 text-sm ml-14">
          Deposit to child's account on Base Sepolia
        </p>
      </div>

      <div className="px-6 -mt-4">
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 rounded-3xl p-5 mb-4 border border-green-200"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-900 font-medium mb-1">
                  Deposit Successful!
                </p>
                <p className="text-xs text-green-700 mb-2">
                  Funds automatically split: 70% to checking, 30% to vault.
                </p>
                {txHash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:text-green-700 underline flex items-center gap-1"
                  >
                    View transaction <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 rounded-3xl p-5 mb-4 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-900 font-medium">Error</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Child Address Input */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
          <label className="block text-sm text-gray-600 mb-3">Child Address</label>
          <input
            type="text"
            value={childAddress}
            onChange={(e) => {
              setChildAddress(e.target.value);
              setError(null);
            }}
            placeholder="0x..."
            className="w-full px-4 py-3 text-sm font-mono text-purple-900 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            The child address from onboarding (not the wallet addresses)
          </p>
        </div>

        {/* Amount Input */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
          <label className="block text-sm text-gray-600 mb-3">Deposit Amount (ETH)</label>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl">Ξ</span>
            <input
              type="number"
              step="0.001"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-4 text-2xl text-purple-900 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount((parseFloat(quickAmount) / 1000).toString())}
                className={`py-2 rounded-xl text-sm transition-colors ${
                  amount === (parseFloat(quickAmount) / 1000).toString()
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {quickAmount}m
              </button>
            ))}
          </div>
        </div>

        {/* Fund Breakdown */}
        {numAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-5 mb-4 border border-purple-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-purple-600" />
              <p className="text-sm text-purple-900">Automatic Split</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-gray-700">Checking Wallet (70%)</span>
                </div>
                <span className="text-indigo-600">{spendingAmount.toFixed(4)} ETH</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-700">Vault Wallet (30%)</span>
                </div>
                <span className="text-amber-600">{vaultAmount.toFixed(4)} ETH</span>
              </div>

              <div className="pt-3 border-t border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-900">Total Deposit</span>
                  <span className="text-purple-900 font-medium">
                    {numAmount.toFixed(4)} ETH
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Gas fees sponsored by Privy
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add Funds Button */}
        <Button
          onClick={handleAddFunds}
          disabled={!isConnected || !amount || numAmount <= 0 || !childAddress || isDepositing}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isDepositing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Depositing...</span>
            </>
          ) : (
            <>
              <span>Deposit {numAmount > 0 ? numAmount.toFixed(4) : "0.00"} ETH</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>

        {/* Info Note */}
        <div className="mt-4 p-4 bg-white rounded-2xl">
          <p className="text-xs text-gray-500 text-center">
            Funds are deposited on Base Sepolia and automatically split 70/30 between
            checking and vault wallets. Gas fees are sponsored by Privy.
          </p>
        </div>
      </div>
    </div>
  );
}
