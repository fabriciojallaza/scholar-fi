import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronLeft, PiggyBank, Shield, TrendingUp, Lock } from "lucide-react";

interface FAQProps {
  onBack: () => void;
}

export function FAQ({ onBack }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does the Education Fund work?",
      answer: "The Education Fund is an automatic savings feature that sets aside a percentage of every deposit into your child's wallet. This money is locked until they turn 18 or meet specific educational milestones. It's designed to help families build a secure financial foundation for college, vocational training, or other educational expenses.",
      icon: PiggyBank,
      color: "amber"
    },
    {
      question: "What percentage goes to the Education Fund?",
      answer: "By default, 10% of every deposit is automatically allocated to the Education Fund. You can adjust this percentage from 5% to 25% in your Spending Controls settings. For example, if you deposit $100, $10 goes to the Education Fund and $90 remains available for spending.",
      icon: TrendingUp,
      color: "indigo"
    },
    {
      question: "When can my child access the Education Fund?",
      answer: "The Education Fund becomes accessible when your child turns 18 years old. At that time, they'll receive full control of their wallet through our Wallet Release process. The funds can also be released earlier with parental approval for verified educational expenses like tuition, books, or educational programs.",
      icon: Lock,
      color: "purple"
    },
    {
      question: "Is the Education Fund safe and secure?",
      answer: "Yes! The Education Fund uses smart contract technology on the blockchain, which means the funds are automatically secured and cannot be accessed or moved without meeting the predefined conditions. Your funds are stored in USDC, a stable cryptocurrency backed 1:1 by US dollars, minimizing volatility.",
      icon: Shield,
      color: "green"
    },
    {
      question: "Can I change the Education Fund percentage?",
      answer: "Absolutely! You can adjust the savings percentage at any time through the Spending Controls screen. Changes will apply to all future deposits. Previously saved amounts remain locked in the Education Fund according to the original agreement.",
      icon: TrendingUp,
      color: "orange"
    },
    {
      question: "What happens to the Education Fund if we stop using the wallet?",
      answer: "The Education Fund remains secure in the smart contract regardless of wallet activity. The funds will continue to be accessible when your child turns 18 or when you approve an educational expense. There are no maintenance fees or penalties for inactivity.",
      icon: Shield,
      color: "indigo"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      amber: "bg-amber-100 text-amber-600",
      indigo: "bg-indigo-100 text-indigo-600",
      purple: "bg-purple-100 text-purple-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600"
    };
    return colors[color as keyof typeof colors] || colors.purple;
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
          <h1 className="text-white">Frequently Asked Questions</h1>
        </div>
        <p className="text-white/80 text-sm ml-14">
          Learn about the Education Fund and how it works
        </p>
      </div>

      {/* FAQ Content */}
      <div className="px-6 -mt-4">
        {/* Highlight Box */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl p-6 text-white shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-white">Education Fund</h2>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">
            Automatically save for your child's future education with every transaction. 
            A smart way to build a college fund while teaching financial responsibility.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getColorClasses(faq.color)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="flex-1 text-left text-sm text-purple-900">
                    {faq.question}
                  </p>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pl-[4.5rem]">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="mt-6 p-4 bg-white rounded-2xl shadow-sm text-center">
          <p className="text-sm text-gray-600 mb-2">Still have questions?</p>
          <button className="text-sm text-purple-600 hover:text-purple-700">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
