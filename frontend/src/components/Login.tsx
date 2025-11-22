import { usePrivy } from '@privy-io/react-auth';
import { Wallet, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

interface LoginProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const { ready, authenticated, login, user } = usePrivy();

  useEffect(() => {
    if (authenticated && user) {
      onLogin();
    }
  }, [authenticated, user, onLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Connect your wallet to continue</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={login}
            disabled={!ready}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!ready ? 'Loading...' : authenticated ? 'Connected' : 'Connect Wallet'}
          </button>

          <div className="text-center text-sm text-gray-500">
            <p>Supports Email, Google, Apple & Web3 Wallets</p>
          </div>

          <div className="text-center">
            <button
              onClick={onSwitchToRegister}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Don't have an account? Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
