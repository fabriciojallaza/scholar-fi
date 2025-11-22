import { useState } from "react";
import { Wallet, UserPlus, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ParentOnboardingProps {
  onComplete: () => void;
}

export function ParentOnboarding({ onComplete }: ParentOnboardingProps) {
  const [step, setStep] = useState(1);

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-purple-900 mb-2">EduSafe Wallet</h1>
          <p className="text-indigo-600">Smart Web3 wallet for parents and teens</p>
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
          onClick={() => {
            if (step < 3) {
              setStep(step + 1);
            } else {
              onComplete();
            }
          }}
          className="w-full max-w-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-2xl shadow-lg"
        >
          {step < 3 ? "Continue" : "Get Started"}
        </Button>
      </div>
    </div>
  );
}