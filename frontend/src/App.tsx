import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Welcome } from "./components/Welcome";
import { Login } from "./components/Login";
import { ParentOnboarding } from "./components/ParentOnboarding";
import { ParentDashboard } from "./components/ParentDashboard";
import { SpendingControls } from "./components/SpendingControls";
import { ApprovedMerchants } from "./components/ApprovedMerchants";
import { TransactionVerification } from "./components/TransactionVerification";
import { EducationSavings } from "./components/EducationSavings";
import { TeenWallet } from "./components/TeenWallet";
import { WalletRelease } from "./components/WalletRelease";
import { FAQ } from "./components/FAQ";
import { ManageFunds } from "./components/ManageFunds";
import { BottomNav } from "./components/BottomNav";

export type Screen =
  | "welcome"
  | "login"
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

export default function App() {
  const { ready, authenticated } = usePrivy();
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app state based on authentication and stored data
  useEffect(() => {
    if (!ready) return;

    // Check if user is authenticated and has child account data
    const childAccountData = localStorage.getItem('childAccountData');

    if (authenticated) {
      if (childAccountData) {
        // User is logged in and has child account - go to dashboard
        setCurrentScreen("dashboard");
      } else {
        // User is logged in but no child account - go to onboarding
        setCurrentScreen("onboarding");
      }
    } else {
      // User not logged in - show welcome
      setCurrentScreen("welcome");
    }

    setIsInitialized(true);
  }, [ready, authenticated]);

  const handleLogin = () => {
    // Check if child account already exists
    const childAccountData = localStorage.getItem('childAccountData');
    if (childAccountData) {
      setCurrentScreen("dashboard");
    } else {
      setCurrentScreen("onboarding");
    }
  };

  // Show loading while Privy initializes
  if (!ready || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-purple-900">Loading Scholar-Fi...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <Welcome onLogin={() => setCurrentScreen("login")} />;
      case "login":
        return <Login onLogin={handleLogin} onSwitchToRegister={() => {}} />;
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
        return <ManageFunds onBack={() => setCurrentScreen("dashboard")} />;
      default:
        return <Welcome onLogin={() => setCurrentScreen("login")} />;
    }
  };

  const showBottomNav = authenticated && !["welcome", "login", "onboarding", "teen", "release"].includes(currentScreen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-indigo-50">
      <div className="w-full sm:max-w-md mx-auto min-h-screen bg-white sm:shadow-xl relative">
        {renderScreen()}

        {showBottomNav && (
          <BottomNav currentScreen={currentScreen} onNavigate={(screen) => setCurrentScreen(screen as Screen)} />
        )}
      </div>
    </div>
  );
}