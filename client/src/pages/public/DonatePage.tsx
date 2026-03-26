
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  Heart, Check, X, Sparkles, Utensils, Syringe, Home, Shield,
  Users, TrendingUp, Award, Lock, ChevronLeft, ChevronRight,
  PawPrint, ChevronDown, AlertTriangle
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import { FundraisingBar } from "../../components/donation/FundraisingBar";

const API = "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────
interface Pet {
  _id: string;
  name: string;
  species: string;
  images: string[];
  donationStory: string;
  donationCount: number;
  isFeatured: boolean;
  shelter: { _id: string; name: string; city?: string };
}

// ─── FeaturedPetCard ─────────────────────────────────────────
function FeaturedPetCard({
  pet,
  loading,
  onChangePet,
}: {
  pet: Pet | null;
  loading: boolean;
  onChangePet: () => void;
}) {
  if (loading) {
    return (
      <div className="rounded-3xl overflow-hidden border border-[var(--color-border)] animate-pulse" style={{ background: "var(--color-card)" }}>
        <div className="h-64 bg-gray-200" />
        <div className="p-6 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="rounded-3xl p-8 text-center border border-dashed border-[var(--color-border)]" style={{ background: "var(--color-card)" }}>
        <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "var(--color-text)" }} />
        <p style={{ color: "var(--color-text-light)" }}>No featured pet available right now.</p>
      </div>
    );
  }

  const imageUrl = pet.images?.[0] || "/rescue-hero.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden shadow-xl border border-[var(--color-border)]"
      style={{ background: "var(--color-card)" }}
    >
      {/* Pet Image */}
      <div className="relative h-64 overflow-hidden">
        <img src={imageUrl} alt={pet.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {pet.isFeatured && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-primary)] text-white flex items-center gap-1 shadow">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          </div>
        )}
        <div className="absolute bottom-4 left-4">
          <h3 className="text-2xl font-black text-white">{pet.name}</h3>
          <p className="text-white/80 text-sm capitalize">{pet.species}</p>
        </div>
      </div>

      {/* Pet Info */}
      <div className="p-6">
        {pet.donationStory ? (
          <p className="text-base leading-relaxed mb-4 italic" style={{ color: "var(--color-text)" }}>
            "{pet.donationStory}"
          </p>
        ) : (
          <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text-light)" }}>
            {pet.name} needs your help to get the care they deserve.
          </p>
        )}

        {/* Shelter attribution */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "var(--color-primary)15", color: "var(--color-primary)" }}>
            <Home className="w-3 h-3" />
            Your donation supports: <span className="font-bold">{pet.shelter?.name}</span>
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--color-text-light)" }}>
            {pet.donationCount} donations
          </span>
        </div>

        {/* Change pet */}
        <button
          onClick={onChangePet}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-light)" }}
        >
          <ChevronDown className="w-4 h-4" /> Choose a different pet
        </button>
      </div>
    </motion.div>
  );
}

// ─── PetPickerDrawer ──────────────────────────────────────────
function PetPickerDrawer({
  open,
  onClose,
  onSelect,
  currentPetId,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (pet: Pet) => void;
  currentPetId: string | null;
}) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`${API}/api/donations/pets?limit=24`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setPets(d.pets); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-800">Choose a pet to help</h3>
                <p className="text-sm text-gray-500">Your donation goes to their shelter</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto flex-1 p-5">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                      <div className="h-32 bg-gray-200" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : pets.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <PawPrint className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No pets available right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {pets.map((pet) => {
                    const img = pet.images?.[0] || "/rescue-hero.png";
                    const isSelected = pet._id === currentPetId;
                    return (
                      <motion.button
                        key={pet._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { onSelect(pet); onClose(); }}
                        className="relative rounded-2xl overflow-hidden border-2 transition-all text-left"
                        style={{ borderColor: isSelected ? "var(--color-primary)" : "transparent" }}
                      >
                        <div className="relative h-32">
                          <img src={img} alt={pet.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-white">
                          <p className="font-bold text-gray-800 text-sm">{pet.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{pet.species} · {pet.shelter?.name}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main DonatePage ─────────────────────────────────────────
export function DonatePage() {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1500);
  const [customAmount, setCustomAmount] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPickerDrawer, setShowPickerDrawer] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Featured pet state
  const [featuredPet, setFeaturedPet] = useState<Pet | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [petLoading, setPetLoading] = useState(true);
  
  // Custom pet stats state
  const [totalRaised, setTotalRaised] = useState(0);
  const [donorCount, setDonorCount] = useState(0);
  const [goalAmount, setGoalAmount] = useState(50000);

  // Payment States
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // UI States
  const [currentDonorIndex, setCurrentDonorIndex] = useState(0);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Active pet = selectedPet ?? featuredPet
  const activePet = selectedPet ?? featuredPet;

  // Fetch stats separately if user selects a different pet
  useEffect(() => {
    if (selectedPet) {
      fetch(`${API}/api/donations/pet-stats/${selectedPet._id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.stats) {
            setTotalRaised(d.stats.totalRaised || 0);
            setDonorCount(d.stats.donorCount || 0);
            setGoalAmount(d.stats.goalAmount || 50000);
          }
        })
        .catch(console.error);
    }
  }, [selectedPet]);

  // Fetch featured pet on mount
  useEffect(() => {
    setPetLoading(true);
    fetch(`${API}/api/donations/featured-pet`)
      .then((r) => r.json())
      .then((d) => { 
        if (d.success) {
          setFeaturedPet(d.pet); 
          if (d.stats) {
             setTotalRaised(d.stats.totalRaised || 0);
             setDonorCount(d.stats.donorCount || 0);
             setGoalAmount(d.stats.goalAmount || 50000);
          }
        }
      })
      .catch(console.error)
      .finally(() => setPetLoading(false));
  }, []);

  const donationAmounts = [
    { amount: 500, label: "Provide a warm meal", emotionalOutcome: "Fill their empty belly today", transformation: "Hunger → Contentment", subtext: "Feeds 5 pets like them", icon: Utensils, popular: false },
    { amount: 1500, label: "Essential Medical Care", emotionalOutcome: "Cover urgent treatment", transformation: "Pain → Recovery", subtext: "Medicines & first aid", icon: Syringe, popular: true },
    { amount: 3000, label: "Safe Shelter & Love", emotionalOutcome: "Give them a roof and a bed", transformation: "Cold Streets → Warm Bed", subtext: "Shelter & 24/7 care", icon: Home, popular: false },
    { amount: 5000, label: "Complete Rescue Package", emotionalOutcome: "Be their ultimate hero", transformation: "Abandoned → Saved Forever", subtext: "Rescue, Meds & Food", icon: Sparkles, popular: false },
  ];

  const impactStats = [
    { icon: Utensils, label: "Meals Provided", value: "12,450+" },
    { icon: Syringe, label: "Pets Vaccinated", value: "850+" },
    { icon: Home, label: "Pets Rescued", value: "500+" },
    { icon: Heart, label: "Happy Adoptions", value: "320+" },
  ];

  const defaultStories = [
    { petName: "Luna", rescueContext: "Found with a broken leg near Thamel", outcome: "Fully recovered and living in her forever home", beforeText: "Injured & Alone", afterText: "Healthy & Loved", impactTag: "Funded Surgery", quote: "Watching Luna go from a painful state to running again was the most fulfilling thing I've ever supported.", donorName: "Priya Sharma", color: "#FF6B6B", petImage: "/street_rescue_dog_1773750000000_png_1773750518794.png" },
    { petName: "Max", rescueContext: "Abandoned during the monsoon floods", outcome: "Thriving with his new family in Lalitpur", beforeText: "Weak & Hungry", afterText: "Strong & Thriving", impactTag: "Saved Max's Life", quote: "PetMate showed me exactly how my contribution provided Max with the nutrition and shelter he desperately needed.", donorName: "Rajesh Kumar", color: "#4ECDC4", petImage: "/save_a_life_candid_1773736158356.png" },
    { petName: "The Puppies", rescueContext: "Litter of 5 found in a construction site", outcome: "All vaccinated and healthy", beforeText: "Vulnerable", afterText: "Protected", impactTag: "Covered Vaccines", quote: "Knowing these five little souls are now safe from disease because of a small gift is a powerful feeling.", donorName: "Sita Thapa", color: "#FFE66D", petImage: "/find_match_candid_1773736183153.png" },
  ];

  const [donorStories, setDonorStories] = useState<any[]>(defaultStories);

  useEffect(() => {
    fetch(`${API}/api/donations/stories`)
      .then((r) => r.json())
      .then((d) => { 
        if (d.success && d.stories.length > 0) {
          const mappedStories = d.stories.map((s: any, i: number) => {
             const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF", "#FFD3B6"];
             return {
               petName: s.petId?.name || "A Rescue",
               rescueContext: s.petId?.donationStory || "Rescued and safe",
               beforeText: "In Need",
               afterText: "Supported",
               impactTag: `Donated Rs ${s.amount.toLocaleString()}`,
               quote: s.message,
               donorName: s.donorName || "Anonymous",
               color: colors[i % colors.length],
               petImage: s.petId?.images?.[0] || "/rescue-hero.png"
             };
          });
          setDonorStories(mappedStories);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (donorStories.length === 0) return;
    const timer = setInterval(() => setCurrentDonorIndex((prev) => (prev + 1) % donorStories.length), 5000);
    return () => clearInterval(timer);
  }, [donorStories]);

  const handleDonate = () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (amount) setShowFeedbackModal(true);
  };

  const handlePayment = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount) return;
    try {
      setLoading(true);
      const response = await api.post("/payment/esewa/initiate", {
        amount,
        petId: activePet?._id || null,
        donorName,
        donorEmail,
        message: feedbackMessage,
        userId: user?._id || null,
      });
      const data = response.data;
      if (data.success) {
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

      {/* Pet Picker Drawer */}
      <PetPickerDrawer
        open={showPickerDrawer}
        onClose={() => setShowPickerDrawer(false)}
        onSelect={(pet) => setSelectedPet(pet)}
        currentPetId={activePet?._id ?? null}
      />

      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative h-[90vh] min-h-[700px]">
        <div className="absolute inset-0">
          <img src="/rescue-hero.png" alt="Rescued dog" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(-105deg, rgba(10,6,4,0.88) 0%, rgba(10,6,4,0.65) 45%, rgba(10,6,4,0.20) 75%, rgba(10,6,4,0.05) 100%)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative h-full flex items-start justify-end z-10 pt-16 pb-32 md:pt-24">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex justify-end">
            <div className="max-w-xl lg:max-w-2xl text-right flex flex-col items-end">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: "rgba(255,220,200,0.85)" }}>Street Rescue · Kathmandu</span>
                <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: "#e85d3a" }} />
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.22 }} className="font-bold text-white leading-[1.08] mb-4" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.4rem, 5vw, 4rem)", textShadow: "0 2px 24px rgba(0,0,0,0.55)" }}>
                {activePet ? <>Help <span style={{ color: "#f4956a" }}>{activePet.name}</span><br />get the care they need.</> : <>She was found alone<br /><span style={{ color: "#f4956a" }}>on the street.</span></>}
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.38 }} className="text-base md:text-lg font-normal mb-6 leading-relaxed" style={{ color: "rgba(255,240,230,0.82)", maxWidth: "36rem" }}>
                {activePet?.donationStory || "Weak and injured near Patan, Kathmandu. She needs urgent veterinary care — today, not tomorrow."}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.54 }} className="flex flex-col items-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 36px rgba(232,93,58,0.55)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => document.getElementById("donate-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-3 px-9 py-4 rounded-full font-bold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #e85d3a 0%, #d4745c 100%)", fontSize: "1.05rem", boxShadow: "0 8px 28px rgba(232,93,58,0.42)", border: "1.5px solid rgba(255,255,255,0.18)" }}
                >
                  <Heart className="w-5 h-5 flex-shrink-0" fill="white" />
                  {activePet ? `Help ${activePet.name} Today` : "Help Her Survive Today"}
                </motion.button>
                <p className="text-xs italic pr-1" style={{ color: "rgba(255,210,190,0.60)" }}>Donations go directly to rescue and treatment — no overhead.</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Impact Stats Bar */}
        <div className="absolute -bottom-10 left-0 w-full px-4 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {impactStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + index * 0.1 }} className="text-center group flex flex-col items-center">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-3 group-hover:bg-white/20 transition-colors">
                        <Icon className="w-6 h-6 text-[#f4956a]" />
                      </div>
                      <div className="text-2xl md:text-3xl font-bold mb-1 tracking-tight">{stat.value}</div>
                      <div className="text-xs md:text-sm text-white/70 font-semibold tracking-wider uppercase">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Donation Section ─────────────────────────── */}
      <section id="donate-section" className="py-24" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Featured Pet Card ── */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto mb-10">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ background: "var(--color-primary)15", color: "var(--color-primary)" }}>
                <PawPrint className="w-3.5 h-3.5" /> Donate to a Pet
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}>
                {activePet ? `Help ${activePet.name} today` : "Choose a pet to help"}
              </h2>
              <p className="text-base" style={{ color: "var(--color-text-light)" }}>
                Your donation is linked to this pet and their shelter automatically.
              </p>
            </div>
            <FeaturedPetCard
              pet={activePet}
              loading={petLoading}
              onChangePet={() => setShowPickerDrawer(true)}
            />
          </motion.div>

          {/* UX IMPROVEMENT: Fundraising Progress Bar */}
          {activePet && !petLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
              <FundraisingBar totalRaised={totalRaised} goalAmount={goalAmount} />
            </motion.div>
          )}

          {/* ── Amount Cards ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
              Choose how much to give
            </h3>
            <p className="text-base" style={{ color: "var(--color-text-light)" }}>
              Every rupee makes a real difference for {activePet?.name || "a pet in need"}.
            </p>
          </motion.div>

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
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedAmount(option.amount); setCustomAmount(""); }}
                  className="relative p-7 rounded-[2.5rem] transition-all duration-300 flex flex-col items-center text-center h-full group"
                  style={{ background: isSelected ? "var(--color-primary)" : "var(--color-card)", color: isSelected ? "white" : "var(--color-text)", boxShadow: isSelected ? "0 20px 40px -10px rgba(212, 116, 92, 0.4)" : "0 4px 12px -1px rgba(0, 0, 0, 0.03)", border: isSelected ? "2px solid rgba(255,255,255,0.2)" : "1.5px solid rgba(0,0,0,0.04)" }}
                >
                  {option.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg whitespace-nowrap" style={{ background: "var(--color-secondary)", color: "white" }}>
                        <Award className="w-3 h-3" /> Most Popular
                      </motion.div>
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl mb-5 transition-transform group-hover:scale-110 ${isSelected ? "bg-white/20" : "bg-[var(--color-primary)]/10"}`}>
                    <Icon className={`w-8 h-8 ${isSelected ? "text-white" : "text-[var(--color-primary)]"}`} />
                  </div>
                  <div className="text-sm font-bold uppercase tracking-widest mb-1 opacity-70">{option.label}</div>
                  <div className="text-3xl font-bold mb-3 tracking-tight">Rs {option.amount.toLocaleString()}</div>
                  <div className={`text-md font-bold mb-2 leading-tight ${isSelected ? "text-white" : "text-[var(--color-text)]"}`}>{option.emotionalOutcome}</div>
                  <div className={`text-xs font-semibold py-1 px-3 rounded-full mb-4 ${isSelected ? "text-white/80 bg-white/10" : "text-[var(--color-text-light)] bg-black/5"}`}>{option.transformation}</div>
                  <div className={`text-sm mt-auto font-medium ${isSelected ? "text-white/80" : "text-[var(--color-text-light)] opacity-70"}`}>{option.subtext}</div>
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 text-[var(--color-primary)]" strokeWidth={3} />
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {(selectedAmount || customAmount) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="text-center mb-12">
                <p className="text-xl font-semibold text-[var(--color-primary)] flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Your Rs {(selectedAmount || parseInt(customAmount) || 0).toLocaleString()} will help {activePet?.name || "a pet in need"} today.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Amount & eSewa */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-center h-full">
              <label className="block text-lg font-bold mb-3 text-gray-800">Or enter a custom amount</label>
              <div className="relative group mb-2">
                <Input
                  type="number"
                  placeholder="e.g. 750"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                  className="pl-16 text-2xl py-8 rounded-2xl border-2 border-gray-100 group-hover:border-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all bg-gray-50 focus:bg-white w-full shadow-inner"
                  fullWidth
                  icon={<span className="font-bold text-xl text-gray-400 mr-2 border-r border-gray-200 pr-3 h-6 flex items-center">Rs</span>}
                />
              </div>
              <p className="text-sm text-gray-400 font-medium">Any amount helps save a life</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white rounded-[2rem] p-8 border border-[#60BB46] shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full bg-gradient-to-br from-white to-green-50/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#60BB46]/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-125" />
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 h-full">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-md p-2 border border-green-100 flex-shrink-0">
                  <img src="/esewa-logo.png" alt="eSewa" className="w-full h-auto object-contain" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-bold text-xl mb-1 text-gray-800">Securely send help via eSewa</div>
                  <div className="flex flex-col gap-1 items-start">
                    <div className="inline-flex items-center gap-1.5 bg-[#60BB46]/10 px-3 py-1 rounded-full text-xs font-bold text-[#60BB46] mb-1">
                      <Lock className="w-3 h-3" /> 100% Secure • Takes &lt; 30s
                    </div>
                    <div className="text-xs text-gray-400 font-medium">Safe for them, safe for you</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Donate Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 text-center">
            
            {/* UX IMPROVEMENT: Social Proof */}
            {activePet && donorCount > 0 && !petLoading && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                <p className="text-sm text-gray-500 font-medium">
                  🐾 {donorCount} {donorCount === 1 ? 'person has' : 'people have'} already helped {activePet.name} this month
                </p>
              </motion.div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleDonate}
              disabled={!(selectedAmount || customAmount) || user?.status === "suspended"}
              icon={user?.status === "suspended" ? <AlertTriangle className="w-6 h-6" /> : <Heart className="w-6 h-6" fill={(selectedAmount || customAmount) ? "white" : "none"} />}
              className="text-2xl py-8 px-16 rounded-full shadow-xl hover:shadow-[0_20px_40px_rgba(232,93,58,0.3)] hover:-translate-y-1 transition-all w-full md:w-auto font-bold"
            >
              {user?.status === "suspended" 
                ? "Account Suspended" 
                : (activePet ? `Help ${activePet.name}` : "Donate Now")} • Rs {(selectedAmount || parseInt(customAmount) || 0).toLocaleString()}
            </Button>
            
            {user?.status === "suspended" && (
                <p className="mt-4 text-sm text-red-500 font-bold">
                    Your account is suspended. Financial actions are temporarily disabled.
                </p>
            )}
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-center text-sm font-bold flex items-center justify-center gap-2" style={{ color: "var(--color-text-light)" }}>
                <Shield className="w-4 h-4 text-[#60BB46]" />
                {activePet ? `Directly supports ${activePet.name} at ${activePet.shelter?.name}` : "Directly funds rescue & treatment"}
              </p>
              <div className="flex items-center gap-6 opacity-60">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Used by 1,200+ donors</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Secure & verified</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Section ────────────────────────────────── */}
      <section className="py-20 bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "100% Transparent", desc: "Every rupee goes directly to the pet's care.", color: "var(--color-primary)" },
              { icon: Users, title: "1,200+ Donors", desc: "Join our compassionate community.", color: "var(--color-secondary)" },
              { icon: TrendingUp, title: "Real Impact", desc: "Track how your help saves lives.", color: "var(--color-success)" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="text-center p-8 rounded-3xl bg-[var(--color-card)] hover:shadow-xl transition-shadow border border-transparent hover:border-[var(--color-border)]">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `${item.color}15` }}>
                    <Icon className="w-10 h-10" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: "var(--color-text)" }}>{item.title}</h3>
                  <p style={{ color: "var(--color-text-light)" }}>{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Donor Stories Carousel ────────────────────────── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "var(--color-surface)" }}>
        <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--color-text)" }}>Rescue Stories Enabled by You</h2>
            <p className="text-xl max-w-2xl mx-auto opacity-70" style={{ color: "var(--color-text-light)" }}>From the streets to a warm bed—see the real lives you've helped transform.</p>
          </motion.div>

          <div className="relative h-[450px] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {donorStories.map((story, index) => {
                let position = index - currentDonorIndex;
                if (position < -1) position += donorStories.length;
                if (position > 1) position -= donorStories.length;
                if (Math.abs(position) > 1 && donorStories.length > 2) return null;
                const isActive = position === 0;
                const isPrev = position === -1 || (currentDonorIndex === 0 && index === donorStories.length - 1);
                const isNext = position === 1 || (currentDonorIndex === donorStories.length - 1 && index === 0);
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
                    animate={{ opacity: isActive ? 1 : 0.4, scale: isActive ? 1 : 0.85, x: visualPosition === 0 ? "0%" : visualPosition < 0 ? "-65%" : "65%", zIndex: isActive ? 20 : 10, rotateY: visualPosition === 0 ? 0 : visualPosition < 0 ? 15 : -15 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute w-[85%] md:w-[70%] max-w-4xl"
                    style={{ perspective: "1000px" }}
                  >
                    <div className="bg-[var(--color-card)] rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row h-full md:h-[420px]" style={{ boxShadow: isActive ? "0 40px 80px -15px rgba(0,0,0,0.2)" : "0 20px 40px -10px rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.05)", filter: isActive ? "none" : "blur(2px) grayscale(0.3)" }}>
                      <div className="w-full md:w-2/5 h-64 md:h-full relative overflow-hidden">
                        <img src={story.petImage} alt={story.petName} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                        <div className="absolute top-6 left-6">
                          <div className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-primary)] shadow-sm">{story.impactTag}</div>
                        </div>
                      </div>
                      <div className="flex-1 p-8 md:p-10 flex flex-col justify-center relative">
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-3xl font-black" style={{ color: "var(--color-text)" }}>{story.petName}</h3>
                            <div className="h-6 w-px bg-gray-200" />
                            <span className="text-sm font-bold text-gray-400 italic">{story.rescueContext}</span>
                          </div>
                          <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase text-gray-400">Before</span>
                              <span className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold border border-red-100 italic">{story.beforeText}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase text-gray-400">After</span>
                              <span className="px-3 py-1 rounded-lg bg-green-50 text-green-600 text-[11px] font-bold border border-green-100 italic">{story.afterText}</span>
                            </div>
                          </div>
                          <blockquote className="text-xl leading-relaxed font-medium mb-8 pr-6" style={{ color: "var(--color-text)", fontStyle: "italic" }}>"{story.quote}"</blockquote>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm" style={{ background: story.color }}>{story.donorName.charAt(0)}</div>
                            <div>
                              <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{story.donorName}</div>
                              <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Donor Hero</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 z-30">
              <button onClick={() => setCurrentDonorIndex((prev) => (prev - 1 + donorStories.length) % donorStories.length)} className="p-4 rounded-full bg-white shadow-lg text-[var(--color-text)] hover:scale-110 active:scale-95 transition-all border border-gray-100">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-30">
              <button onClick={() => setCurrentDonorIndex((prev) => (prev + 1) % donorStories.length)} className="p-4 rounded-full bg-white shadow-lg text-[var(--color-text)] hover:scale-110 active:scale-95 transition-all border border-gray-100">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-8">
            {donorStories.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentDonorIndex(idx)} className={`transition-all duration-300 rounded-full ${idx === currentDonorIndex ? "w-8 bg-[var(--color-primary)]" : "w-2.5 bg-gray-300 hover:bg-gray-400"}`} style={{ height: "10px" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Confirm & Pay Modal ───────────────────────────── */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)" }} onClick={() => !loading && setShowFeedbackModal(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-primary)]" />
              {!loading ? (
                <>
                  <button onClick={() => setShowFeedbackModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                  <div className="text-center mb-6">
                    {activePet?.images?.[0] ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-4 border-[var(--color-primary)]/20">
                        <img src={activePet.images[0]} alt={activePet.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-orange-500" fill="#f97316" />
                      </div>
                    )}
                    <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Confirm Donation</h2>
                    <p style={{ color: "var(--color-text-light)" }}>
                      You are donating <span className="font-bold text-[var(--color-primary)] text-lg">Rs {selectedAmount || customAmount}</span>
                      {activePet ? <> to help <span className="font-bold">{activePet.name}</span> at <span className="font-semibold">{activePet.shelter?.name}</span></> : ""}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>Name (Optional)</label>
                        <Input placeholder="Your Name" value={donorName} onChange={(e) => setDonorName(e.target.value)} fullWidth />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>Email (Optional)</label>
                        <Input type="email" placeholder="Receipt Email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} fullWidth />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>Message (Optional)</label>
                      <textarea value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)} placeholder={activePet ? `A message for ${activePet.name}...` : "Why are you donating today?"} rows={2} className="w-full p-3 rounded-xl border-2 focus:border-[var(--color-primary)] outline-none transition-colors resize-none bg-gray-50" />
                    </div>
                    <Button variant="primary" size="lg" fullWidth onClick={handlePayment} className="py-4 text-lg shadow-lg hover:shadow-xl mt-2">
                      Proceed to eSewa
                    </Button>
                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" /> Secure payment via eSewa
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-6" />
                  <h3 className="text-xl font-bold mb-2">Redirecting to eSewa...</h3>
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
