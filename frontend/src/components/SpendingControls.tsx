import { useState } from "react";
import { ArrowLeft, ShieldCheck, DollarSign, Store } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";

interface SpendingControlsProps {
  onBack: () => void;
}

export function SpendingControls({ onBack }: SpendingControlsProps) {
  const [approvedOnly, setApprovedOnly] = useState(true);
  const [weeklyLimit, setWeeklyLimit] = useState([150]);
  const [selectedCategories, setSelectedCategories] = useState([
    "Schools",
    "Learning platforms",
    "Food"
  ]);

  const categories = [
    "Schools",
    "Sports clubs",
    "Learning platforms",
    "Food",
    "Supplies",
    "Books",
    "Transportation"
  ];

  const approvedMerchants = [
    { name: "Khan Academy", category: "Education" },
    { name: "Coursera", category: "Education" },
    { name: "Local Soccer Club", category: "Sports" },
    { name: "School Cafeteria", category: "Food" },
    { name: "City Library", category: "Education" }
  ];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-purple-900">Spending Controls</h2>
      </div>

      <div className="p-6 space-y-6 pb-24">
        {/* Approved Institutions Toggle */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-purple-900 mb-1">Approved Institutions Only</h3>
              <p className="text-sm text-gray-600">
                Only allow spending on pre-approved merchants
              </p>
            </div>
            <Switch checked={approvedOnly} onCheckedChange={setApprovedOnly} />
          </div>
        </div>

        {/* Category Selector */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-purple-900">Allowed Categories</h3>
              <p className="text-sm text-gray-600">Select spending categories</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedCategories.includes(category)
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Spending Limit */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-purple-900">Weekly Spend Limit</h3>
              <p className="text-sm text-gray-600">Maximum weekly allowance</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl text-purple-900">${weeklyLimit[0]}</span>
              <span className="text-gray-500">per week</span>
            </div>
            <Slider
              value={weeklyLimit}
              onValueChange={setWeeklyLimit}
              max={500}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-2xl shadow-lg">
          Save Smart Rules
        </Button>
      </div>
    </div>
  );
}