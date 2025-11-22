import { useState, useEffect } from "react";
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
import { HYPERLANE_CONFIG } from "../config/contracts";

interface AddFundsProps {
  onBack: () => void;
}

export function AddFunds({ onBack }: AddFundsProps) {
  const [amount, setAmount] = useState("");
  const [childWallet, setChildWallet] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [estimatedFees, setEstimatedFees] = useState<string>("0");

  const { bridgeContract, baseSigner, address, isConnected } = useMultiChain();

  const quickAmounts = ["10", "25", "50", "100"];

  const numAmount = parseFloat(amount) || 0;
  const vaultAmount = numAmount * 0.30; // 30% to vault
  const spendingAmount = numAmount * 0.70; // 70% to spending

  // Estimate Hyperlane fees when amount or child wallet changes
  useEffect(() => {
    async function getFees() {
      if (!bridgeContract || !childWallet || numAmount <= 0) {
        setEstimatedFees("0");
        return;
      }

      try {
        const fees = await bridgeContract.estimateFees(
          childWallet,
          ethers.parseEther(amount)
        );
        setEstimatedFees(ethers.formatEther(fees));
      } catch (err) {
        console.error("Failed to estimate fees:", err);
        setEstimatedFees("0.001"); // Fallback estimate
      }
    }

    getFees();
  }, [bridgeContract, childWallet, amount, numAmount]);

  const handleAddFunds = async () => {
    if (!isConnected || !bridgeContract || !baseSigner) {
      setError("Please connect your wallet");
      return;
    }

    if (!childWallet || !ethers.isAddress(childWallet)) {
      setError("Please enter a valid child wallet address");
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

      // Calculate total = deposit amount + Hyperlane fees
      const depositAmount = ethers.parseEther(amount);
      const fees = ethers.parseEther(estimatedFees);
      const totalAmount = depositAmount + fees;

      // Call depositForChild on Base bridge
      const tx = await bridgeContract.depositForChild(childWallet, {
        value: totalAmount
      });

      // Wait for transaction
      const receipt = await tx.wait();

      // Extract message ID from event
      const event = receipt.logs
        .map((log: any) => {
          try {
            return bridgeContract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e?.name === "DepositBridged");

      if (event) {
        setMessageId(event.args.messageId);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Failed to add funds:", err);
      if (err.code === "ACTION_REJECTED") {
        setError("Transaction rejected by user");
      } else if (err.message?.includes("insufficient funds")) {
        setError("Insufficient balance to cover deposit + fees");
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
          Cross-chain deposit via Hyperlane
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
                  Your deposit is being bridged to Celo Sepolia via Hyperlane.
                </p>
                {messageId && (
                  <a
                    href={`${HYPERLANE_CONFIG.explorerUrl}/message/${messageId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:text-green-700 underline flex items-center gap-1"
                  >
                    Track message <ExternalLink className="w-3 h-3" />
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

        {/* Child Wallet Input */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
          <label className="block text-sm text-gray-600 mb-3">Child's Wallet Address</label>
          <input
            type="text"
            value={childWallet}
            onChange={(e) => {
              setChildWallet(e.target.value);
              setError(null);
            }}
            placeholder="0x..."
            className="w-full px-4 py-3 text-sm font-mono text-purple-900 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
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
              <p className="text-sm text-purple-900">Fund Allocation</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-gray-700">Spending Balance (70%)</span>
                </div>
                <span className="text-indigo-600">{spendingAmount.toFixed(4)} ETH</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-700">Vault (30%)</span>
                </div>
                <span className="text-amber-600">{vaultAmount.toFixed(4)} ETH</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Hyperlane Fees</span>
                </div>
                <span className="text-gray-600">{parseFloat(estimatedFees).toFixed(4)} ETH</span>
              </div>

              <div className="pt-3 border-t border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-900">Total Cost</span>
                  <span className="text-purple-900 font-medium">
                    {(numAmount + parseFloat(estimatedFees)).toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add Funds Button */}
        <Button
          onClick={handleAddFunds}
          disabled={!isConnected || !amount || numAmount <= 0 || !childWallet || isDepositing}
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
            Deposits are bridged from Base Sepolia to Celo Sepolia via Hyperlane.
            The transaction may take a few minutes to complete.
          </p>
        </div>
      </div>
    </div>
  );
}
