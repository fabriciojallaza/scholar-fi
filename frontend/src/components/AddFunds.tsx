import { useState } from "react";
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  Wallet, 
  CreditCard, 
  Building2, 
  Smartphone,
  ArrowRight,
  Info,
  PiggyBank
} from "lucide-react";
import { Button } from "./ui/button";

interface AddFundsProps {
  onBack: () => void;
}

export function AddFunds({ onBack }: AddFundsProps) {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const quickAmounts = ["25", "50", "100", "200"];

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Instant deposit",
      fee: "2.9% + $0.30"
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: Building2,
      description: "1-3 business days",
      fee: "Free"
    },
    {
      id: "wallet",
      name: "Crypto Wallet",
      icon: Wallet,
      description: "Instant from your wallet",
      fee: "Network fees apply"
    }
  ];

  const numAmount = parseFloat(amount) || 0;
  const educationAmount = numAmount * 0.10;
  const availableAmount = numAmount - educationAmount;

  const handleAddFunds = () => {
    if (!amount || numAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }
    alert(`Successfully added $${amount} to wallet!`);
    onBack();
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
          Deposit funds to your child's wallet
        </p>
      </div>

      <div className="px-6 -mt-4">
        {/* Amount Input */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
          <label className="block text-sm text-gray-600 mb-3">Enter Amount</label>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-4 text-2xl text-purple-900 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount)}
                className={`py-2 rounded-xl text-sm transition-colors ${
                  amount === quickAmount
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ${quickAmount}
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
                  <span className="text-sm text-gray-700">Available Balance</span>
                </div>
                <span className="text-indigo-600">${availableAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-700">Education Fund (10%)</span>
                </div>
                <span className="text-amber-600">${educationAmount.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-900">Total Deposit</span>
                  <span className="text-purple-900">${numAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-purple-900 mb-3">Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-purple-100" : "bg-gray-100"
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isSelected ? "text-purple-600" : "text-gray-600"
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm mb-0.5 ${
                        isSelected ? "text-purple-900" : "text-gray-900"
                      }`}>
                        {method.name}
                      </p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">{method.fee}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Funds Button */}
        <Button
          onClick={handleAddFunds}
          disabled={!amount || numAmount <= 0 || !selectedMethod}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Add ${numAmount > 0 ? numAmount.toFixed(2) : "0.00"}</span>
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Security Note */}
        <div className="mt-4 p-4 bg-white rounded-2xl text-center">
          <p className="text-xs text-gray-500">
            All transactions are encrypted and secure. Funds are converted to USDC stablecoin.
          </p>
        </div>
      </div>
    </div>
  );
}
