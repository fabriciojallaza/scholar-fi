import { Home, HelpCircle, PlusCircle } from "lucide-react";

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "addFunds", label: "Add Funds", icon: PlusCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-6 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                  isActive 
                    ? "text-purple-600" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "fill-purple-100" : ""}`} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
