
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  Heart, 
  Check, 
  X, 
  Sparkles,
  Utensils,
  Syringe,
  Home,
  Shield,
  Users,
  TrendingUp,
  Award,
  Lock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1500);
  const [customAmount, setCustomAmount] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  
  // Payment States
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // UI States
  const [showStickyDonate, setShowStickyDonate] = useState(false);
  const [currentDonorIndex, setCurrentDonorIndex] = useState(0);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);
  
  const donationAmounts = [
    {
      amount: 500,
      impact: "Feed 5 pets for a day",
      icon: Utensils,
      popular: false,
    },
    {
      amount: 1500,
      impact: "Medical care for 2 pets",
      icon: Syringe,
      popular: true,
    },
    {
      amount: 3000,
      impact: "Shelter & recovery",
      icon: Home,
      popular: false,
    },
    {
      amount: 5000,
      impact: "Complete rescue package",
      icon: Sparkles,
      popular: false,
    },
  ];

  const impactStats = [
    { icon: Utensils, label: "Meals Provided", value: "12,450+" },
    { icon: Syringe, label: "Pets Vaccinated", value: "850+" },
    { icon: Home, label: "Pets Rescued", value: "500+" },
    { icon: Heart, label: "Happy Adoptions", value: "320+" },
  ];

  const donorStories = [
    {
      name: "Priya Sharma",
      quote: "Seeing the direct impact of my donations brings me immense joy. Every rupee truly makes a difference in their lives.",
      amount: "Monthly Donor",
      petSaved: "Helped rescue Luna",
      color: "#FF6B6B"
    },
    {
      name: "Rajesh Kumar",
      quote: "After adopting my dog from PetMate, I knew I had to give back. These animals deserve a second chance at happiness.",
      amount: "Rs 5,000 Donor",
      petSaved: "Helped rescue Max",
      color: "#4ECDC4"
    },
    {
      name: "Sita Thapa",
      quote: "Every small contribution adds up to save a life. I'm proud to support this amazing cause.",
      amount: "Rs 1,000 Donor",
      petSaved: "Vaccinated 5 puppies",
      color: "#FFE66D"
    }
  ];

  // Scroll handler for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyDonate(window.scrollY > 800);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Donor stories auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDonorIndex((prev) => (prev + 1) % donorStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleDonate = () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (amount) {
      setShowFeedbackModal(true);
    }
  };

  const handlePayment = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/payment/esewa/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          donorName,
          donorEmail,
          message: feedbackMessage,
          productId: "Donation-" + Date.now(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Create hidden form and submit
        const form = document.createElement("form");
        form.action = data.url;
        form.method = "POST";
        form.style.display = "none";

        Object.keys(data.data).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data.data[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        alert("Payment initiation failed: " + data.message);
        setLoading(false);
      }
    } catch (error) {
       console.error("Payment error:", error);
       alert("Something went wrong. Please try again.");
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      {/* Hero Section with Text Overlay and Parallax */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <motion.div
          style={{ scale: heroScale }}
          className="absolute inset-0"
        >
          <img
            src="/pets-hero.png"
            alt="Rescued pet looking at camera"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full flex items-center justify-center text-center px-4 z-10"
        >
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full mb-8 border backdrop-blur-md shadow-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <Heart className="w-4 h-4 text-red-400" fill="#F87171" />
                <span className="text-white text-sm font-semibold tracking-wide uppercase">
                  Every donation saves a life
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
                Your Donation Can
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[#FF8C66]" style={{ textShadow: "0 0 30px rgba(212, 116, 92, 0.3)" }}>
                  Save a Life Today
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                Join <span className="font-semibold text-white">1,200+ compassionate donors</span> helping rescue, heal, and
                rehome pets in need across Nepal.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    document.getElementById("donate-section")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  icon={<Heart className="w-6 h-6" fill="white" />}
                  className="text-xl py-6 px-10 rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(212,116,92,0.6)] border-2 border-white/20"
                >
                  Donate Now
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Improved Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={() => document.getElementById("donate-section")?.scrollIntoView({ behavior: "smooth" })}
        >
          <div className="flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-white/80 text-xs tracking-widest uppercase">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2 backdrop-blur-sm">
              <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Impact Stats Bar - Floating overlap */}
      <section className="relative z-20 -mt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[var(--color-primary)] rounded-3xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {impactStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center group"
                  >
                    <div className="inline-flex p-4 rounded-2xl bg-white/20 mb-4 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold mb-1 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-white/80 font-medium tracking-wide uppercase">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Donation Section */}
      <section
        id="donate-section"
        className="py-24"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "var(--color-text)" }}
            >
              Choose Your Impact
            </h2>
            <p
              className="text-xl md:text-2xl max-w-2xl mx-auto"
              style={{ color: "var(--color-text-light)" }}
            >
              Every contribution, no matter the size, directly helps provide care for pets in need.
            </p>
          </motion.div>

          {/* Donation Amount Cards - 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {donationAmounts.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedAmount === option.amount;
              return (
                <motion.button
                  key={option.amount}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedAmount(option.amount);
                    setCustomAmount("");
                  }}
                  className="relative p-8 rounded-3xl transition-all duration-300 flex flex-col items-center text-center h-full"
                  style={{
                    background: isSelected ? "var(--color-primary)" : "var(--color-card)",
                    color: isSelected ? "white" : "var(--color-text)",
                    boxShadow: isSelected ? "0 20px 40px -10px rgba(212, 116, 92, 0.4)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    border: isSelected ? "none" : "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  {option.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div
                        className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg whitespace-nowrap"
                        style={{
                          background: "var(--color-secondary)",
                          color: "white",
                        }}
                      >
                        <Award className="w-3 h-3" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl mb-6 transition-colors ${isSelected ? 'bg-white/20' : 'bg-[var(--color-primary)]/10'}`}>
                    <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-[var(--color-primary)]'}`} />
                  </div>

                  <div className="text-3xl font-bold mb-2 tracking-tight">
                    Rs {option.amount.toLocaleString()}
                  </div>
                  
                  <div className={`text-sm font-medium leading-relaxed ${isSelected ? "text-white/90" : "text-[var(--color-text-light)]"}`}>
                    {option.impact}
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4"
                    >
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Check className="w-5 h-5 text-[var(--color-primary)]" strokeWidth={3} />
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Custom Amount & Payment */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Custom Amount */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-center h-full"
            >
              <label className="block text-lg font-bold mb-4 text-gray-800">
                Or enter a custom amount
              </label>
              <div className="relative group">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  className="pl-16 text-2xl py-8 rounded-2xl border-2 border-gray-200 group-hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all bg-gray-50 focus:bg-white w-full shadow-inner"
                  fullWidth
                  icon={
                    <span className="font-bold text-xl text-gray-500 mr-2 border-r-2 border-gray-300 pr-3 h-6 flex items-center">
                      Rs
                    </span>
                  }
                />
              </div>
            </motion.div>

            {/* eSewa Payment */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2rem] p-8 border border-[#60BB46] shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full bg-gradient-to-br from-white to-green-50/50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#60BB46]/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-125" />
              
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 h-full">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-md p-2 border border-green-100 flex-shrink-0">
                  <img src="/esewa-logo.png" alt="eSewa" className="w-full h-auto object-contain" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-bold text-xl mb-2 text-gray-800">
                    Pay via eSewa
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-[#60BB46]/10 px-4 py-1.5 rounded-full text-sm font-medium text-[#60BB46]">
                    <Lock className="w-3.5 h-3.5" />
                    Secure & Encrypted
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Donate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleDonate}
              disabled={!(selectedAmount || customAmount)}
              icon={<Heart className="w-6 h-6" fill={selectedAmount ? "white" : "none"} />}
              className="text-2xl py-8 px-16 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all w-full md:w-auto"
            >
              Donate Rs {(selectedAmount || parseInt(customAmount) || 0).toLocaleString()} Now
            </Button>
            <p className="text-center text-sm mt-4 font-medium flex items-center justify-center gap-2" style={{ color: "var(--color-text-light)" }}>
              <Shield className="w-4 h-4" />
              100% secure • Tax deductible • Direct impact
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "100% Transparent", desc: "Every rupee goes directly to care.", color: "var(--color-primary)" },
              { icon: Users, title: "1,200+ Donors", desc: "Join our compassionate community.", color: "var(--color-secondary)" },
              { icon: TrendingUp, title: "Real Impact", desc: "Track how your help saves lives.", color: "var(--color-success)" }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-8 rounded-3xl bg-[var(--color-card)] hover:shadow-xl transition-shadow border border-transparent hover:border-[var(--color-border)]"
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform hover:rotate-12" style={{ background: `${item.color}15` }}>
                    <Icon className="w-10 h-10" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: "var(--color-text)" }}>{item.title}</h3>
                  <p style={{ color: "var(--color-text-light)" }}>{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Donor Stories Carousel - Stacked Design */}
      <section className="py-24 relative overflow-hidden" style={{ background: "var(--color-surface)" }}>
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
              Stories from Our Heroes
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "var(--color-text-light)" }}>
              Real people making real differences. Hear from those who chose to save a life.
            </p>
          </motion.div>

          <div className="relative h-[450px] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {donorStories.map((story, index) => {
                // Calculate position relative to current index
                // We handle circular navigation visual logic here
                let position = index - currentDonorIndex;
                if (position < -1) position += donorStories.length;
                if (position > 1) position -= donorStories.length;
                
                // Only render active, prev, next
                if (Math.abs(position) > 1 && donorStories.length > 2) return null;

                const isActive = position === 0;
                const isPrev = position === -1 || (currentDonorIndex === 0 && index === donorStories.length - 1);
                const isNext = position === 1 || (currentDonorIndex === donorStories.length - 1 && index === 0);

                // Override position for circular logic edge cases
                let visualPosition = position;
                if (donorStories.length > 2) {
                   if (isActive) visualPosition = 0;
                   if (isPrev) visualPosition = -1;
                   if (isNext) visualPosition = 1;
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isActive ? 1 : 0.4,
                      scale: isActive ? 1 : 0.85,
                      x: visualPosition === 0 ? "0%" : visualPosition < 0 ? "-65%" : "65%", // Adjusted for peeking
                      zIndex: isActive ? 20 : 10,
                      rotateY: visualPosition === 0 ? 0 : visualPosition < 0 ? 15 : -15, // 3D effect
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute w-[85%] md:w-[70%] max-w-4xl"
                    style={{
                      perspective: "1000px",
                    }}
                  >
                    <div 
                      className="bg-[var(--color-card)] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
                      style={{
                        boxShadow: isActive ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" : "none",
                        border: "1px solid rgba(0,0,0,0.05)"
                      }}
                    >
                      {/* Decorative quote mark */}
                      <div className="absolute top-6 right-8 opacity-5 text-9xl font-serif text-[var(--color-text)]">"</div>
                      
                      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                        <div className="relative flex-shrink-0 group">
                          <div 
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                            style={{ background: story.color || "var(--color-primary)" }}
                          >
                            {story.name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md">
                            <Heart className="w-6 h-6 text-red-500" fill="#EF4444" />
                          </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
                            {story.name}
                          </h3>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                            <span className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-bold">
                              {story.amount}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <span className="text-[var(--color-text-light)] text-sm font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {story.petSaved}
                            </span>
                          </div>
                          <blockquote className="text-xl md:text-2xl leading-relaxed font-medium italic" style={{ color: "var(--color-text-light)" }}>
                            "{story.quote}"
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 z-30">
              <button
                onClick={() => setCurrentDonorIndex((prev) => (prev - 1 + donorStories.length) % donorStories.length)}
                className="p-4 rounded-full bg-white shadow-lg text-[var(--color-text)] hover:scale-110 active:scale-95 transition-all border border-gray-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-30">
              <button
                onClick={() => setCurrentDonorIndex((prev) => (prev + 1) % donorStories.length)}
                className="p-4 rounded-full bg-white shadow-lg text-[var(--color-text)] hover:scale-110 active:scale-95 transition-all border border-gray-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {donorStories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentDonorIndex(idx)}
                className={`transition-all duration-300 rounded-full ${idx === currentDonorIndex ? 'w-8 bg-[var(--color-primary)]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
                style={{ height: '10px' }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Donate Bar - Updated UI */}
      <AnimatePresence>
        {showStickyDonate && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t backdrop-blur-lg"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              borderColor: "var(--color-border)",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.05)"
            }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden md:flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" fill="white" />
                </div>
                <div>
                  <div className="font-bold text-lg" style={{ color: "var(--color-text)" }}>
                    Make a difference today
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-text-light)" }}>
                    Your support saves lives immediately.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="hidden sm:block text-right mr-2">
                  <span className="block text-xs uppercase tracking-wider text-[var(--color-text-light)]">Selected Amount</span>
                  <span className="block font-bold text-xl text-[var(--color-primary)]">
                    Rs {(selectedAmount || parseInt(customAmount) || 0).toLocaleString()}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDonate}
                  disabled={!(selectedAmount || customAmount)}
                  icon={<Heart className="w-5 h-5" fill="white" />}
                  className="flex-1 md:flex-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all rounded-xl"
                >
                  Donate Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ & Feedback Modal (Existing Logic) */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)" }}
            onClick={() => !loading && setShowFeedbackModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-primary)]" />
              
              {!loading ? (
                <>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-green-600" fill="#16A34A" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Confirm Donation</h2>
                    <p style={{ color: "var(--color-text-light)" }}>
                      You are donating <span className="font-bold text-[var(--color-primary)] text-lg">Rs {selectedAmount || customAmount}</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                                Name (Optional)
                            </label>
                            <Input
                                placeholder="Your Name"
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                fullWidth
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                                Email (Optional)
                            </label>
                            <Input
                                type="email"
                                placeholder="Receipt Email"
                                value={donorEmail}
                                onChange={(e) => setDonorEmail(e.target.value)}
                                fullWidth
                            />
                        </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                        Message (Optional)
                      </label>
                      <textarea
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Why are you donating today?"
                        rows={2}
                        className="w-full p-3 rounded-xl border-2 focus:border-[var(--color-primary)] outline-none transition-colors resize-none bg-gray-50"
                      />
                    </div>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handlePayment}
                      className="py-4 text-lg shadow-lg hover:shadow-xl mt-2"
                    >
                      Proceed to eSewa
                    </Button>
                    
                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" /> Secure payment via eSewa
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-6"
                  />
                  <h3 className="text-xl font-bold mb-2">Redirecting...</h3>
                  <p className="text-gray-500">Please wait while we take you to eSewa.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
