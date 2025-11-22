import { useState } from "react";
import { ArrowLeft, Store, Plus, Search, ShoppingBag, GraduationCap, Utensils } from "lucide-react";
import { Button } from "./ui/button";

interface ApprovedMerchantsProps {
  onBack: () => void;
}

export function ApprovedMerchants({ onBack }: ApprovedMerchantsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const merchants = [
    { 
      name: "Khan Academy", 
      category: "Education", 
      icon: GraduationCap,
      color: "purple",
      description: "Online learning platform"
    },
    { 
      name: "Coursera", 
      category: "Education", 
      icon: GraduationCap,
      color: "purple",
      description: "University courses online"
    },
    { 
      name: "Local Soccer Club", 
      category: "Sports", 
      icon: ShoppingBag,
      color: "orange",
      description: "Sports team fees"
    },
    { 
      name: "School Cafeteria", 
      category: "Food", 
      icon: Utensils,
      color: "amber",
      description: "School meals"
    },
    { 
      name: "City Library", 
      category: "Education", 
      icon: GraduationCap,
      color: "purple",
      description: "Library services"
    },
    { 
      name: "Art Supply Store", 
      category: "Supplies", 
      icon: Store,
      color: "indigo",
      description: "Educational supplies"
    }
  ];

  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorClasses = (color: string) => {
    const colors = {
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      amber: "bg-amber-100 text-amber-600",
      indigo: "bg-indigo-100 text-indigo-600"
    };
    return colors[color as keyof typeof colors] || colors.purple;
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
        <div>
          <h2 className="text-purple-900">Approved Merchants</h2>
          <p className="text-sm text-gray-600">Manage pre-approved stores</p>
        </div>
      </div>

      <div className="p-6 space-y-6 pb-24">
        {/* Search Bar */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Approved</p>
            <p className="text-2xl text-purple-900">{merchants.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Categories</p>
            <p className="text-2xl text-orange-900">4</p>
          </div>
        </div>

        {/* Add New Merchant Button */}
        <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-2xl shadow-lg">
          <Plus className="w-5 h-5 mr-2" />
          Add New Merchant
        </Button>

        {/* Merchants List */}
        <div className="space-y-3">
          <h3 className="text-purple-900">Active Merchants</h3>
          {filteredMerchants.map((merchant, index) => {
            const MerchantIcon = merchant.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${getColorClasses(merchant.color)}`}>
                    <MerchantIcon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-purple-900 mb-1">{merchant.name}</h3>
                        <p className="text-sm text-gray-600">{merchant.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-3 py-1.5 rounded-full ${
                        merchant.category === "Education"
                          ? "bg-purple-100 text-purple-700"
                          : merchant.category === "Sports"
                          ? "bg-orange-100 text-orange-700"
                          : merchant.category === "Food"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {merchant.category}
                      </span>
                      <button className="text-sm text-red-500 hover:text-red-700 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMerchants.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No merchants found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
