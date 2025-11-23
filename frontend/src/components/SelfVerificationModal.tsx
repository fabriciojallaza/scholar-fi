import { motion, AnimatePresence } from "motion/react";
import { X, Shield, CheckCircle2 } from "lucide-react";
import { SelfQRcodeWrapper } from '@selfxyz/qrcode';
import type { SelfApp } from '@selfxyz/sdk-common';

interface SelfVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selfApp: SelfApp | null;
  onSuccess: () => void;
}

export function SelfVerificationModal({
  isOpen,
  onClose,
  selfApp,
  onSuccess,
}: SelfVerificationModalProps) {
  if (!isOpen || !selfApp) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-900">Age Verification</h2>
              <p className="text-sm text-gray-600">Self Protocol ZK Proof</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-purple-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900 mb-2">
                  How to verify your age
                </p>
                <ol className="text-xs text-gray-700 space-y-1.5">
                  <li>1. Download the Self app on your phone</li>
                  <li>2. Scan this QR code with the Self app</li>
                  <li>3. Follow the passport scanning process</li>
                  <li>4. Your vault will unlock automatically</li>
                </ol>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-white p-4 rounded-2xl shadow-inner">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={onSuccess}
                size={280}
                darkMode={false}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              This verification uses zero-knowledge proofs. Your personal data stays private.
            </p>
          </div>

          {/* Privacy notice */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-600 text-center">
              🔒 Powered by Self Protocol • Privacy-preserving • On-chain verification
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
