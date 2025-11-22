import { Sparkles, PartyPopper, Wallet, TrendingUp, Unlock } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";

interface WalletReleaseProps {
  onStart: () => void;
}

export function WalletRelease({ onStart }: WalletReleaseProps) {
  const educationFund = 1250.0;
  const walletBalance = 450.0;
  const totalBalance = educationFund + walletBalance;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="mb-8"
        >
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <Unlock className="w-16 h-16 text-purple-600" />
            </div>
            
            {/* Floating Sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 8) * 60,
                  y: Math.sin((i * Math.PI * 2) / 8) * 60
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2"
              >
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <h1 className="text-white mb-4">Congratulations, Alex!</h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-white/90 mb-2"
          >
            You've turned 18!
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-white/80"
          >
            Your EduSafe Wallet is now fully yours
          </motion.p>
        </motion.div>

        {/* Balance Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="w-full max-w-sm space-y-4 mb-8"
        >
          {/* Total Balance */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-teal-600" />
              <span className="text-sm text-gray-600">Total Available Balance</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-teal-900">${totalBalance.toLocaleString()}</h2>
              <span className="text-gray-500">USDC</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Wallet Balance</p>
                <p className="text-blue-900">${walletBalance.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Education Fund</p>
                <p className="text-teal-900">${educationFund.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Features Unlocked */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-teal-900 mb-4 flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-teal-600" />
              Now Unlocked
            </h3>
            <div className="space-y-3">
              {[
                "Full control of your wallet",
                "Access to education savings",
                "No spending limits",
                "All merchant categories",
                "Independent transactions"
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8 }}
          className="w-full max-w-sm"
        >
          <Button
            onClick={onStart}
            className="w-full bg-white text-purple-600 hover:bg-gray-50 py-6 rounded-2xl shadow-2xl text-lg"
          >
            <span className="mr-2">Start Using Your Wallet Freely</span>
            <Sparkles className="w-5 h-5" />
          </Button>
          
          <p className="text-center text-white/80 text-sm mt-4">
            Thank you for trusting EduSafe Wallet
          </p>
        </motion.div>
      </div>
    </div>
  );
}