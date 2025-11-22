import { useState } from "react";
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sapphire, sapphireTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Welcome } from "./components/Welcome";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ParentOnboarding } from "./components/ParentOnboarding";
import { ParentDashboard } from "./components/ParentDashboard";
import { SpendingControls } from "./components/SpendingControls";
import { ApprovedMerchants } from "./components/ApprovedMerchants";
import { TransactionVerification } from "./components/TransactionVerification";
import { EducationSavings } from "./components/EducationSavings";
import { TeenWallet } from "./components/TeenWallet";
import { WalletRelease } from "./components/WalletRelease";
import { FAQ } from "./components/FAQ";
import { AddFunds } from "./components/AddFunds";
import { BottomNav } from "./components/BottomNav";

export type Screen = 
  | "welcome"
  | "login"
  | "register"
  | "onboarding" 
  | "dashboard" 
  | "spending" 
  | "merchants"
  | "transaction" 
  | "savings" 
  | "teen" 
  | "release"
  | "faq"
  | "addFunds";

// Configuración de Wagmi para Oasis Sapphire
const wagmiConfig = createConfig({
  chains: [sapphireTestnet, sapphire],
  transports: {
    [sapphireTestnet.id]: http(),
    [sapphire.id]: http(),
  },
});

const queryClient = new QueryClient();

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen("onboarding");
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    setCurrentScreen("onboarding");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <Welcome onLogin={() => setCurrentScreen("login")} onRegister={() => setCurrentScreen("register")} />;
      case "login":
        return <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentScreen("register")} />;
      case "register":
        return <Register onRegister={handleRegister} onSwitchToLogin={() => setCurrentScreen("login")} />;
      case "onboarding":
        return <ParentOnboarding onComplete={() => setCurrentScreen("dashboard")} />;
      case "dashboard":
        return <ParentDashboard onNavigate={setCurrentScreen} />;
      case "spending":
        return <SpendingControls onBack={() => setCurrentScreen("dashboard")} />;
      case "merchants":
        return <ApprovedMerchants onBack={() => setCurrentScreen("dashboard")} />;
      case "transaction":
        return <TransactionVerification onBack={() => setCurrentScreen("dashboard")} />;
      case "savings":
        return <EducationSavings onBack={() => setCurrentScreen("dashboard")} />;
      case "teen":
        return <TeenWallet />;
      case "release":
        return <WalletRelease onStart={() => setCurrentScreen("teen")} />;
      case "faq":
        return <FAQ onBack={() => setCurrentScreen("dashboard")} />;
      case "addFunds":
        return <AddFunds onBack={() => setCurrentScreen("dashboard")} />;
      default:
        return <Welcome onLogin={() => setCurrentScreen("login")} onRegister={() => setCurrentScreen("register")} />;
    }
  };

  const showBottomNav = isAuthenticated && !["welcome", "login", "register", "onboarding", "teen", "release"].includes(currentScreen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-indigo-50">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative">
        {renderScreen()}
        
        {showBottomNav && (
          <BottomNav currentScreen={currentScreen} onNavigate={(screen) => setCurrentScreen(screen as Screen)} />
        )}
      </div>
      
      {/* Screen Navigation Toolbar (for demo purposes) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 overflow-x-auto">
        <div className="flex gap-2 justify-center max-w-4xl mx-auto flex-wrap">
          <button
            onClick={() => setCurrentScreen("onboarding")}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Onboarding
          </button>
          <button
            onClick={() => setCurrentScreen("dashboard")}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentScreen("spending")}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Spending
          </button>
          <button
            onClick={() => setCurrentScreen("merchants")}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Merchants
          </button>
          <button
            onClick={() => setCurrentScreen("transaction")}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Transaction
          </button>
          <button
            onClick={() => setCurrentScreen("savings")}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Savings
          </button>
          <button
            onClick={() => setCurrentScreen("teen")}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Teen Wallet
          </button>
          <button
            onClick={() => setCurrentScreen("release")}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Release
          </button>
          <button
            onClick={() => setCurrentScreen("faq")}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            FAQ
          </button>
          <button
            onClick={() => setCurrentScreen("addFunds")}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Add Funds
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PrivyProvider
      appId="cmiaafkvf02z1jj0ce0vlo5ts"
      config={{
        loginMethods: ['email', 'wallet', 'google', 'apple'],
        appearance: {
          theme: 'light',
          accentColor: '#8B5CF6',
          logo: 'https://your-logo-url.com/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        supportedChains: [sapphireTestnet, sapphire],
        defaultChain: sapphireTestnet,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <AppContent />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}