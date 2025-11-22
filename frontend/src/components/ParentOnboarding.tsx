import { useState } from "react";
import { Wallet, UserPlus, Sparkles, ChevronRight, Loader2, AlertCircle, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { usePrivy } from "@privy-io/react-auth";

interface ParentOnboardingProps {
  onComplete: () => void;
}

export function ParentOnboarding({ onComplete }: ParentOnboardingProps) {
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState("");
  const [childDateOfBirth, setChildDateOfBirth] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, authenticated } = usePrivy();

  const steps = [
    {
      icon: UserPlus,
      title: "Welcome",
      description: "You're logged in with Privy"
    },
    {
      icon: Sparkles,
      title: "Add child information",
      description: "Tell us about your child"
    },
    {
      icon: Wallet,
      title: "Create child account",
      description: "We'll set up everything automatically"
    }
  ];

  const handleCreateAccount = async () => {
    if (!authenticated || !user) {
      setError("Please log in to continue");
      return;
    }

    // Get parent's email from Privy user object
    const parentEmail = user.email?.address || user.google?.email || user.twitter?.username;
    if (!parentEmail) {
      setError("Unable to retrieve your email. Please ensure you logged in with email.");
      return;
    }

    // Convert date of birth to Unix timestamp
    const dobTimestamp = new Date(childDateOfBirth).getTime() / 1000;

    try {
      setIsCreating(true);
      setError(null);

      // Call serverless API to create child account
      const response = await fetch('/api/create-child-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentUserId: user.id,
          childName,
          childDateOfBirth: dobTimestamp,
          parentEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create child account');
      }

      const data = await response.json();

      console.log('✅ Child account created:', data);

      // Success! Move to dashboard
      onComplete();
    } catch (err: any) {
      console.error("Failed to create child account:", err);
      setError(err.message || "Failed to create account. Please try again.");
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
      if (!childDateOfBirth) {
        setError("Please enter your child's date of birth");
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
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </label>
              <input
                type="date"
                value={childDateOfBirth}
                onChange={(e) => {
                  setChildDateOfBirth(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Required for age verification when your child turns 18
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-sm mb-6 space-y-4">
            <div className="p-4 bg-purple-50 rounded-2xl">
              <p className="text-sm text-purple-900 mb-2">What happens next:</p>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• Child Privy account created</li>
                <li>• Checking wallet (70% spending)</li>
                <li>• Vault wallet (30% savings)</li>
                <li>• Registered across all chains</li>
              </ul>
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
