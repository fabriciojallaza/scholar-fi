import { ArrowLeft, CheckCircle2, XCircle, Store, Shield, Clock } from "lucide-react";
import { Button } from "./ui/button";

interface TransactionVerificationProps {
  onBack: () => void;
}

export function TransactionVerification({ onBack }: TransactionVerificationProps) {
  const transactions = [
    {
      merchant: "Khan Academy Plus",
      amount: "$15.00",
      category: "Education",
      date: "Nov 22, 2025 • 10:32 AM",
      status: "approved",
      reason: "Merchant in approved category",
      address: "0x8f42...a1c9"
    },
    {
      merchant: "Gaming Marketplace",
      amount: "$45.00",
      category: "Entertainment",
      date: "Nov 21, 2025 • 3:15 PM",
      status: "blocked",
      reason: "Merchant not in approved category",
      address: "0x2e91...7b3f"
    },
    {
      merchant: "Local Soccer Club",
      amount: "$50.00",
      category: "Sports",
      date: "Nov 20, 2025 • 9:00 AM",
      status: "approved",
      reason: "Pre-approved merchant",
      address: "0x5c23...4d8a"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-purple-900">Transaction Verification</h2>
      </div>

      <div className="p-6 space-y-4 pb-24">
        {transactions.map((transaction, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl p-6 shadow-sm"
          >
            {/* Transaction Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    transaction.status === "approved"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <Store
                    className={`w-6 h-6 ${
                      transaction.status === "approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-purple-900 mb-1">{transaction.merchant}</h3>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-teal-900">{transaction.amount}</p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-600">Category:</span>
                <span className="text-purple-900">{transaction.category}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-600">Contract:</span>
                <span className="text-purple-900 font-mono text-xs">
                  {transaction.address}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`p-4 rounded-2xl ${
                transaction.status === "approved"
                  ? "bg-green-50"
                  : "bg-red-50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {transaction.status === "approved" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-900">Transaction Approved</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-900">Transaction Blocked</span>
                  </>
                )}
              </div>
              <p
                className={`text-sm ${
                  transaction.status === "approved"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {transaction.reason}
              </p>
            </div>

            {/* Action Buttons */}
            {transaction.status === "blocked" && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Approve Once
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  Add to Approved
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Summary Stats */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-purple-900 mb-4">This Week's Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Approved</span>
              </div>
              <p className="text-2xl text-green-900">12</p>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">Blocked</span>
              </div>
              <p className="text-2xl text-red-900">3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}