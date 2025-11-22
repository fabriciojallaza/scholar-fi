import { useState } from "react";
import { Shield, CheckCircle2, QrCode, ExternalLink, Info, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useMultiChain } from "../hooks/useMultiChain";
import { SELF_CONFIG, CHAIN_CONFIG } from "../config/contracts";

interface SelfVerificationProps {
  childAddress: string;
  onVerified?: () => void;
}

export function SelfVerification({ childAddress, onVerified }: SelfVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  const { vaultContract } = useMultiChain();

  const handleStartVerification = async () => {
    // In production, this would:
    // 1. Call Self Protocol SDK to generate verification URL
    // 2. User scans QR code with Self app
    // 3. Submits ZK proof of age 18+
    // 4. Vault contract's customVerificationHook is called automatically

    setIsVerifying(true);

    // Simulated verification URL (in production, would call Self SDK)
    const mockVerificationUrl = `https://verify.self.xyz/?chain=celo-sepolia&contract=${vaultContract?.target}&config=${SELF_CONFIG.scopeSeed}&user=${childAddress}`;

    setVerificationUrl(mockVerificationUrl);
    setIsVerifying(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-indigo-900 mb-1">
            Age Verification Required
          </h3>
          <p className="text-sm text-indigo-600">
            Unlock vault funds at age 18
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-white rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-2 mb-3">
          <Info className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900 font-medium mb-1">
              How It Works
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Verify your age (18+) using Self Protocol</li>
              <li>• Scan QR code with Self mobile app</li>
              <li>• Submit zero-knowledge proof of age</li>
              <li>• Vault funds automatically unlock on-chain</li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Verification Provider</span>
            <span className="text-indigo-600 font-medium">Self Protocol</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-600">Chain</span>
            <span className="text-indigo-600 font-medium">Celo Sepolia</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-600">Min Age</span>
            <span className="text-indigo-600 font-medium">{SELF_CONFIG.minAge} years</span>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      {!verificationUrl && (
        <Button
          onClick={handleStartVerification}
          disabled={isVerifying}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-2xl shadow-lg disabled:opacity-50"
        >
          {isVerifying ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating QR Code...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" />
              Start Verification
            </span>
          )}
        </Button>
      )}

      {/* QR Code Display */}
      {verificationUrl && (
        <div className="space-y-3">
          {/* QR Code Placeholder */}
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 text-center mb-2">
              Scan with Self mobile app
            </p>
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-700 underline flex items-center gap-1"
            >
              Or open verification link
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Instructions */}
          <div className="bg-indigo-50 rounded-2xl p-4">
            <p className="text-xs text-indigo-900 font-medium mb-2">
              Next Steps:
            </p>
            <ol className="text-xs text-indigo-700 space-y-1 list-decimal list-inside">
              <li>Download Self app from App Store or Play Store</li>
              <li>Create account and complete identity verification</li>
              <li>Scan QR code above to prove age 18+</li>
              <li>Your vault funds will unlock automatically</li>
            </ol>
          </div>

          {/* Self Protocol Link */}
          <a
            href="https://www.self.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <span className="text-sm font-medium">Learn more about Self Protocol</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Privacy Note */}
      <div className="mt-4 p-3 bg-white/50 rounded-xl">
        <p className="text-xs text-gray-600 text-center">
          <Shield className="w-3 h-3 inline mr-1" />
          Zero-knowledge proof: Your identity details stay private
        </p>
      </div>
    </div>
  );
}
