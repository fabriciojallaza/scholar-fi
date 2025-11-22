import { useState, useEffect } from "react";
import { ExternalLink, Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { HYPERLANE_CONFIG } from "../config/contracts";

interface HyperlaneTrackerProps {
  messageId: string;
  onClose?: () => void;
}

type MessageStatus = "pending" | "delivered" | "failed" | "unknown";

export function HyperlaneTracker({ messageId, onClose }: HyperlaneTrackerProps) {
  const [status, setStatus] = useState<MessageStatus>("pending");
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Simulate tracking (in production, would poll Hyperlane API)
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);

      // Simulate status updates (normally would fetch from Hyperlane)
      if (elapsed > 30) {
        setStatus("delivered");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [messageId]);

  const explorerUrl = `${HYPERLANE_CONFIG.explorerUrl}/message/${messageId}`;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-purple-900 mb-1">
            Cross-Chain Transfer
          </h3>
          <p className="text-sm text-gray-600">Hyperlane Message Status</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-3 mb-4">
        {status === "pending" && (
          <>
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-900">Processing</p>
              <p className="text-xs text-blue-600">{elapsedTime}s elapsed</p>
            </div>
          </>
        )}
        {status === "delivered" && (
          <>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Delivered</p>
              <p className="text-xs text-green-600">Funds received on Celo</p>
            </div>
          </>
        )}
        {status === "failed" && (
          <>
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">Failed</p>
              <p className="text-xs text-red-600">Message delivery failed</p>
            </div>
          </>
        )}
      </div>

      {/* Message ID */}
      <div className="mb-4 p-3 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-600 mb-1">Message ID</p>
        <p className="text-xs font-mono text-gray-900 break-all">{messageId}</p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-900">Dispatched from Base Sepolia</p>
            <p className="text-xs text-gray-500">Transaction confirmed</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            status === "delivered" ? "bg-green-100" : "bg-gray-100"
          }`}>
            {status === "pending" ? (
              <Clock className="w-4 h-4 text-gray-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-900">Relayed to Celo Sepolia</p>
            <p className="text-xs text-gray-500">
              {status === "delivered" ? "Message delivered" : "Waiting for relayer..."}
            </p>
          </div>
        </div>
      </div>

      {/* Explorer Link */}
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
      >
        <span className="text-sm font-medium">View on Hyperlane Explorer</span>
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
