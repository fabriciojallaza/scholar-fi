import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, Mail, Eye, EyeOff, Wallet, User, Shield, Check, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { usePrivy } from '@privy-io/react-auth';

interface RegisterProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const { ready, authenticated, login, user } = usePrivy();

  useEffect(() => {
    if (authenticated && user) {
      onRegister();
    }
  }, [authenticated, user, onRegister]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join ScholarFi to start your journey</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={login}
            disabled={!ready}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!ready ? 'Loading...' : authenticated ? 'Wallet Created!' : 'Create Wallet & Register'}
          </button>

          <div className="text-center text-sm text-gray-500">
            <p>✓ Email, Google or Apple sign-up</p>
            <p>✓ Automatic wallet creation</p>
            <p>✓ No seed phrases needed</p>
          </div>

          <div className="text-center">
            <button
              onClick={onSwitchToLogin}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
