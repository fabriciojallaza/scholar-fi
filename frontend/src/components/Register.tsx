import { useState } from "react";
import { motion } from "motion/react";
import { Lock, Mail, Eye, EyeOff, Wallet, User, Shield, Check } from "lucide-react";
import { Button } from "./ui/button";

interface RegisterProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (!acceptedTerms) {
      alert("Please accept the terms and conditions");
      return;
    }
    onRegister();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 flex flex-col">
      {/* Header */}
      <div className="p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Wallet className="w-7 h-7 text-white" />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center text-white mb-2"
        >
          EduSafe Wallet
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-white/80 text-sm"
        >
          Create your family wallet account
        </motion.p>
      </div>

      {/* Register Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-1 bg-white rounded-t-[3rem] mt-8 p-8 overflow-y-auto"
      >
        <h2 className="text-purple-900 mb-2">Create Account</h2>
        <p className="text-gray-600 mb-6">Set up your secure family wallet</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Sarah Johnson"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                acceptedTerms
                  ? "bg-purple-600 border-purple-600"
                  : "border-gray-300 bg-white"
              }`}
            >
              {acceptedTerms && <Check className="w-4 h-4 text-white" />}
            </button>
            <p className="text-sm text-gray-600">
              I agree to the{" "}
              <button type="button" className="text-purple-600 hover:text-purple-700">
                Terms of Service
              </button>{" "}
              and{" "}
              <button type="button" className="text-purple-600 hover:text-purple-700">
                Privacy Policy
              </button>
            </p>
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-2xl shadow-lg mt-6"
          >
            Create Account
          </Button>
        </form>

        {/* Security Features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-purple-900">Your account includes:</p>
          </div>
          <ul className="space-y-2 ml-7">
            <li className="text-xs text-purple-600 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
              Bank-level encryption
            </li>
            <li className="text-xs text-purple-600 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
              Multi-signature wallet security
            </li>
            <li className="text-xs text-purple-600 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
              Parental control dashboard
            </li>
          </ul>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center pb-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-700"
            >
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
