import { useState } from "react";
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

export default function App() {
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
      <div className="w-full sm:max-w-md mx-auto min-h-screen bg-white sm:shadow-xl relative">
        {renderScreen()}

        {showBottomNav && (
          <BottomNav currentScreen={currentScreen} onNavigate={(screen) => setCurrentScreen(screen as Screen)} />
        )}
      </div>
    </div>
  );
}