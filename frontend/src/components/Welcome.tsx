import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wallet, 
  Shield, 
  PiggyBank, 
  TrendingUp, 
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface WelcomeProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function Welcome({ onLogin, onRegister }: WelcomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Smart Parental Controls",
      description: "Monitor and manage your children's money with customizable controls, spending limits, and real-time merchant approval.",
      icon: Shield,
      color: "from-purple-600 to-indigo-600",
      image: "https://images.unsplash.com/photo-1758686254415-9348b5b5df01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBmaW5hbmNpYWwlMjBzZWN1cml0eXxlbnwxfHx8fDE3NjM3ODczMjl8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      title: "Automatic Education Fund",
      description: "Automatically save 10% of every deposit for your child's college future. A secure fund that grows with each transaction.",
      icon: PiggyBank,
      color: "from-amber-500 to-orange-500",
      image: "https://images.unsplash.com/photo-1653213096286-a5dd683c0f44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJlbnQlMjBjaGlsZCUyMGVkdWNhdGlvbiUyMHNhdmluZ3N8ZW58MXx8fHwxNzYzNzg3MzI4fDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      title: "Secure Crypto Wallet",
      description: "Use blockchain technology with USDC stablecoin for secure, fast transactions without volatility. Enterprise-level banking protection.",
      icon: Wallet,
      color: "from-indigo-600 to-purple-600",
      image: "https://images.unsplash.com/photo-1758144153721-8b3eba045f74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9jdXJyZW5jeSUyMGRpZ2l0YWwlMjBwYXltZW50fGVufDF8fHx8MTc2Mzc4NzMyOXww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      title: "Financial Education for Teens",
      description: "Teach financial responsibility with a simple and secure wallet. Your children learn while spending smartly.",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      image: "https://images.unsplash.com/photo-1614330315994-efd5ea8163a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWVuYWdlciUyMHNtYXJ0cGhvbmUlMjBkaWdpdGFsJTIwd2FsbGV0fGVufDF8fHx8MTc2Mzc4NzMyOHww&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Logo Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 pt-12 flex items-center justify-center"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-purple-900">EduSafe Wallet</h1>
        </div>
      </motion.div>

      {/* Carousel */}
      <div className="flex-1 px-4 pb-8 relative">
        <div className="relative h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Image Section */}
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={currentSlideData.image}
                  alt={currentSlideData.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${currentSlideData.color} opacity-80`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="bg-white p-8 min-h-[240px] flex flex-col justify-center">
                <h2 className="text-purple-900 mb-3 text-center">
                  {currentSlideData.title}
                </h2>
                <p className="text-gray-600 text-center leading-relaxed">
                  {currentSlideData.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5 text-purple-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5 text-purple-600" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 h-2 bg-purple-600"
                    : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 space-y-3 bg-gradient-to-t from-purple-50 to-white"
      >
        <Button
          onClick={onLogin}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          <span>Sign In</span>
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button
          onClick={onRegister}
          className="w-full bg-white hover:bg-purple-50 text-purple-600 py-6 rounded-2xl border-2 border-purple-200 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <span>Create Account</span>
          <ChevronRight className="w-5 h-5" />
        </Button>

        <p className="text-center text-xs text-gray-500 pt-2">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}