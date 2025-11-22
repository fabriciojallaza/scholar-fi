import { useState } from "react";
import { ArrowLeft, GraduationCap, TrendingUp, Lock, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface EducationSavingsProps {
  onBack: () => void;
}

export function EducationSavings({ onBack }: EducationSavingsProps) {
  const [autoSavePercentage, setAutoSavePercentage] = useState(20);

  const currentSavings = 1250.0;
  const goal = 20000.0;
  const progress = (currentSavings / goal) * 100;

  const percentageOptions = [10, 20, 30, 40, 50];

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
        <h2 className="text-purple-900">Education Savings</h2>
      </div>

      <div className="p-6 space-y-6 pb-24">
        {/* Hero Image */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1659080908120-ee0a52629e86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwc2F2aW5ncyUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NjM3ODQ2NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Graduation and education"
            className="w-full h-48 object-cover"
          />
        </div>

        {/* Progress Ring Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl p-8 text-white shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            </div>

            <h2 className="text-white mb-2">University Fund</h2>
            <p className="text-white/80 text-sm mb-4">For Alex's future education</p>

            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-5xl text-white">${currentSavings.toLocaleString()}</span>
            </div>
            <p className="text-white/80">of ${goal.toLocaleString()} goal</p>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+${(currentSavings * 0.05).toFixed(2)} this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Save Settings */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-purple-900">Auto-Save Percentage</h3>
              <p className="text-sm text-gray-600">From each incoming transaction</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {percentageOptions.map((percentage) => (
              <button
                key={percentage}
                onClick={() => setAutoSavePercentage(percentage)}
                className={`flex-1 py-4 rounded-2xl transition-all ${
                  autoSavePercentage === percentage
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <div className="text-2xl mb-1">{percentage}%</div>
              </button>
            ))}
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl">
            <p className="text-sm text-purple-900">
              <span className="font-medium">{autoSavePercentage}%</span> of every deposit will
              automatically go to the education fund.
            </p>
          </div>
        </div>

        {/* Lock Information */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-purple-900 mb-2">Locked Until Age 18</h3>
              <p className="text-sm text-gray-600 mb-3">
                These funds are securely locked in a smart contract and will automatically become
                available when Alex turns 18 years old.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  Unlocks: June 15, 2029
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Contribution */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-purple-900 mb-4">Additional Contribution</h3>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Amount in USDC"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none"
            />
            <Button className="px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl">
              Add Funds
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-2xl shadow-lg">
          Adjust Auto-Save Settings
        </Button>
      </div>
    </div>
  );
}