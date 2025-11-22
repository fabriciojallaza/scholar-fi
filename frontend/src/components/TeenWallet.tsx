import { Wallet, TrendingUp, Store, Info, ShoppingBag, Book, Utensils } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function TeenWallet() {
  const balance = 450.0;
  const weeklyLimit = 150.0;
  const spent = 65.0;

  const transactions = [
    {
      merchant: "Khan Academy Plus",
      amount: -15.0,
      category: "Education",
      icon: Book,
      date: "Today, 10:32 AM",
      status: "completed"
    },
    {
      merchant: "School Cafeteria",
      amount: -12.5,
      category: "Food",
      icon: Utensils,
      date: "Today, 12:15 PM",
      status: "completed"
    },
    {
      merchant: "Local Soccer Club",
      amount: -50.0,
      category: "Sports",
      icon: ShoppingBag,
      date: "Yesterday, 9:00 AM",
      status: "completed"
    },
    {
      merchant: "Weekly Allowance",
      amount: 100.0,
      category: "Deposit",
      icon: TrendingUp,
      date: "Nov 18, 2025",
      status: "completed"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 pb-24 rounded-b-[3rem]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1667179873742-915e940a31f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWVuJTIwc3R1ZGVudCUyMGhhcHB5fGVufDF8fHx8MTc2MzcyNTk3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Teen profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-white/80 text-sm">Welcome</p>
              <h2 className="text-white">Alex</h2>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-6 -mt-16 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-2">Your Balance</p>
              <div className="flex items-baseline gap-2">
                <h1 className="text-purple-900">${balance.toFixed(2)}</h1>
                <span className="text-gray-500 text-sm">USDC</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">This week's spending</span>
              <span className="text-sm text-purple-900">
                ${spent.toFixed(2)} / ${weeklyLimit.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${(spent / weeklyLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-6 mb-6">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-purple-700" />
          </div>
          <div>
            <h3 className="text-purple-900 text-sm mb-1">Protected by Parents</h3>
            <p className="text-xs text-purple-700">
              Some purchases may require parental approval. Your wallet has smart rules to keep you safe.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 pb-24">
        <h3 className="text-purple-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((transaction, index) => {
            const TransactionIcon = transaction.icon;
            const isPositive = transaction.amount > 0;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isPositive ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    <TransactionIcon
                      className={`w-6 h-6 ${
                        isPositive ? "text-green-600" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-purple-900 mb-1">{transaction.merchant}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          transaction.category === "Education"
                            ? "bg-purple-100 text-purple-700"
                            : transaction.category === "Food"
                            ? "bg-orange-100 text-orange-700"
                            : transaction.category === "Sports"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {transaction.category}
                      </span>
                      <span className="text-xs text-gray-500">{transaction.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm ${
                        isPositive ? "text-green-600" : "text-purple-900"
                      }`}
                    >
                      {isPositive ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="py-6 border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 rounded-2xl"
          >
            Request Money
          </Button>
          <Button className="py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl">
            View All
          </Button>
        </div>
      </div>
    </div>
  );
}