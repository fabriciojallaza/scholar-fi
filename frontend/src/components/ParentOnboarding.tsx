import { useState } from "react";
import { Wallet, UserPlus, Sparkles, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useMultiChain } from "../hooks/useMultiChain";
import { ethers } from "ethers";

interface ParentOnboardingProps {
  onComplete: () => void;
}

export function ParentOnboarding({ onComplete }: ParentOnboardingProps) {
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState("");
  const [childWalletAddress, setChildWalletAddress] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { vaultContract, celoProvider, address } = useMultiChain();

  const steps = [
    {
      icon: UserPlus,
      title: "Create parent account",
      description: "Set up your secure account"
    },
    {
      icon: Sparkles,
      title: "Add child information",
      description: "Tell us about your child"
    },
    {
      icon: Wallet,
      title: "Generate child's smart wallet",
      description: "We'll create a secure Web3 wallet"
    }
  ];

  const generateChildWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    setChildWalletAddress(wallet.address);
  };

  const handleCreateAccount = async () => {
    if (!vaultContract || !childWalletAddress) {
      setError("Please connect wallet and enter child wallet address");
      return;
    }

    if (!ethers.isAddress(childWalletAddress)) {
      setError("Invalid wallet address");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Call createChildAccount on Celo vault
      const tx = await vaultContract.createChildAccount(childWalletAddress);
      await tx.wait();

      // Success! Move to dashboard
      onComplete();
    } catch (err: any) {
      console.error("Failed to create child account:", err);
      if (err.code === "ACTION_REJECTED") {
        setError("Transaction rejected by user");
      } else if (err.message?.includes("AccountAlreadyExists")) {
        setError("This child wallet already has an account");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!childName.trim()) {
        setError("Please enter your child's name");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      await handleCreateAccount();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-purple-900 mb-2">Scholar-Fi</h1>
          <p className="text-indigo-600">Smart education savings for families</p>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-sm mb-8 rounded-3xl overflow-hidden shadow-lg">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1763013259118-ffbc78b2bdb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJlbnQlMjBjaGlsZCUyMHRvZ2V0aGVyfGVufDF8fHx8MTc2MzY5MTU2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Parent and child together"
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Title */}
        <h2 className="text-center text-purple-900 mb-3">
          Create a Smart Wallet for Your Child
        </h2>
        <p className="text-center text-indigo-600 mb-8 max-w-sm">
          Safe, educational, and controlled. Teach financial responsibility with Web3.
        </p>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-sm mb-6 p-4 bg-red-50 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-900">Error</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Form Fields */}
        {step === 2 && (
          <div className="w-full max-w-sm mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Child's Name
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => {
                  setChildName(e.target.value);
                  setError(null);
                }}
                placeholder="Enter name"
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-sm mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Child's Wallet Address
              </label>
              <input
                type="text"
                value={childWalletAddress}
                onChange={(e) => {
                  setChildWalletAddress(e.target.value);
                  setError(null);
                }}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
              <button
                onClick={generateChildWallet}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700 underline"
              >
                Generate new wallet
              </button>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          {steps.map((stepItem, index) => {
            const StepIcon = stepItem.icon;
            const isActive = step === index + 1;
            const isCompleted = step > index + 1;

            return (
              <div
                key={index}
                className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg scale-105"
                    : isCompleted
                    ? "bg-purple-100 text-purple-800"
                    : "bg-white text-gray-400"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isActive
                      ? "bg-white/20"
                      : isCompleted
                      ? "bg-purple-200"
                      : "bg-gray-100"
                  }`}
                >
                  <StepIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm mb-0.5">{stepItem.title}</h3>
                  <p
                    className={`text-xs ${
                      isActive
                        ? "text-white/90"
                        : isCompleted
                        ? "text-purple-600"
                        : "text-gray-400"
                    }`}
                  >
                    {stepItem.description}
                  </p>
                </div>
                {isActive && <ChevronRight className="w-5 h-5" />}
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleContinue}
          disabled={isCreating}
          className="w-full max-w-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Account...
            </span>
          ) : step < 3 ? (
            "Continue"
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </div>
  );
}
