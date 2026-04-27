import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { formatAge } from "../../utils/ageUtils";
import { motion } from "framer-motion";
import {
  Heart,
  Shield,
  PawPrint,
  CheckCircle,
  Search,
  Sparkles,
  Building2,
  MapPin,
  Clock,
  BookOpen,
  FileEdit,
  Leaf,
  Users as UsersIcon,
} from "lucide-react";


const SHELTERS = [
  {
    name: "Kathmandu Animal Shelter",
    location: "Kathmandu, Nepal",
    petsAdopted: 320,
    totalPets: 48,
    volunteers: 34,
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&fit=crop",
  },
  {
    name: "Patan Pet Rescue",
    location: "Lalitpur, Nepal",
    petsAdopted: 185,
    totalPets: 31,
    volunteers: 18,
    image: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?q=80&w=800&fit=crop",
  },
  {
    name: "Valley Pet Haven",
    location: "Bhaktapur, Nepal",
    petsAdopted: 210,
    totalPets: 55,
    volunteers: 22,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&fit=crop",
  },
  {
    name: "Pokhara Animal Welfare",
    location: "Pokhara, Nepal",
    petsAdopted: 140,
    totalPets: 40,
    volunteers: 15,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&fit=crop",
  },
];

function ShelterSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sheltersList, setSheltersList] = useState<any[]>(SHELTERS);
  const [featuredPets, setFeaturedPets] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/shelter")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.slice(0, 4).map((s: any, index: number) => {
            let imgUrl = s.coverImage || s.logo;
            if (imgUrl && !imgUrl.startsWith("http")) {
              imgUrl = `http://localhost:5000/${imgUrl.replace(/^\//, "")}`;
            }
            return {
              ...s,
              name: s.name || "Unknown Shelter",
              location: s.city ? `${s.city}, ${s.state || "Nepal"}` : s.address || "Location Hidden",
              petsAdopted: typeof s.adoptionsSheltered === 'number' ? s.adoptionsSheltered : (s.stats?.adoptions || Math.floor(Math.random() * 200) + 50),
              totalPets: typeof s.totalPets === 'number' ? s.totalPets : (s.stats?.totalPets || Math.floor(Math.random() * 50) + 5),
              image: imgUrl || SHELTERS[index]?.image || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&fit=crop",
              story: s.description || `At ${s.name || 'our shelter'}, we believe every animal deserves a loving family. We are dedicated to rescuing, rehabilitating, and rehoming pets in need, giving them a second chance at happiness.`
            };
          });
          setSheltersList(enriched);
        }
      })
      .catch((err) => console.log("Failed to fetch real shelters", err));
  }, []);

  // Fetch a featured pet for the currently selected shelter
  useEffect(() => {
    const selected = sheltersList[selectedIndex];
    if (selected?._id && !featuredPets[selected._id]) {
      fetch(`http://localhost:5000/api/pets?shelter=${selected._id}&limit=1&status=available`)
        .then(res => res.json())
        .then(data => {
          if (data.pets && data.pets.length > 0) {
            setFeaturedPets(prev => ({ ...prev, [selected._id]: data.pets[0] }));
          } else {
            setFeaturedPets(prev => ({ ...prev, [selected._id]: "none" }));
          }
        })
        .catch(console.error);
    }
  }, [selectedIndex, sheltersList]);

  const shelter = sheltersList[selectedIndex];
  const featuredPet = shelter ? featuredPets[shelter._id] : null;

  return (
    <section className="py-24 md:py-32 relative overflow-hidden transition-colors duration-500" style={{ background: "var(--color-background)" }}>
      {/* Soft Background Blobs for depth */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse pointer-events-none" style={{ background: "var(--color-primary)" }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none" />

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16 flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-[2.5rem] md:text-5xl lg:text-6xl font-black leading-tight mb-3 tracking-tight" style={{ color: "var(--color-text)" }}>
            Supported Shelters
          </h2>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mt-2 shadow-sm" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <Heart className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <p className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--color-text)" }}>
              The Heroes Behind the Paws
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-col xl:flex-row gap-6 lg:h-[650px] items-stretch"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          
          {/* Left: Interactive Mini Cards */}
          <div className="w-full xl:w-[32%] flex flex-col gap-4 justify-between h-full relative z-20">
            {sheltersList.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`group relative p-4 md:p-5 rounded-[2rem] text-left transition-all duration-500 w-full flex-1 flex items-center gap-5 border-2
                  ${
                    selectedIndex === i
                      ? "shadow-2xl scale-[1.02] z-10"
                      : "opacity-75 hover:opacity-100 hover:shadow-lg border-transparent hover:-translate-y-1"
                  }
                `}
                style={{ 
                  background: selectedIndex === i ? "var(--color-surface)" : "var(--color-card)",
                  borderColor: selectedIndex === i ? "var(--color-primary)" : "transparent",
                  boxShadow: selectedIndex === i ? "0 20px 40px -10px rgba(0, 0, 0, 0.15)" : "none"
                }}
              >
                {/* Active Indicator Line */}
                {selectedIndex === i && (
                  <motion.div 
                    layoutId="activeCardIndicator"
                    className="absolute -left-1.5 top-8 bottom-8 w-3 rounded-full shadow-lg"
                    style={{ background: "var(--color-primary)" }}
                  />
                )}
                
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-black/5 relative">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-xl md:text-2xl font-black truncate tracking-tight mb-1" style={{ color: "var(--color-text)" }}>{s.name}</span>
                  <div className="flex items-center gap-1.5 opacity-80 text-sm mb-3" style={{ color: "var(--color-text-light)" }}>
                    <MapPin className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                    <span className="font-medium truncate">{s.location}</span>
                  </div>
                  <div className="text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 w-max shadow-sm" style={{ background: "var(--color-primary)", color: "white" }}>
                    <Heart className="w-3.5 h-3.5 fill-current" /> {s.petsAdopted} Lives Changed
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Main Emotional Shelter Card */}
          <div 
            className="w-full xl:w-[68%] rounded-[3rem] flex flex-col md:flex-row shadow-2xl overflow-hidden h-full z-10 border transition-all duration-500 group"
            style={{ 
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.02)"
            }}
          >
            {/* Left/Top Half: Image Hero */}
            <div className="w-full md:w-[45%] relative h-[350px] md:h-full overflow-hidden shrink-0">
              <motion.img
                key={`img-${shelter?.image}`}
                initial={{ scale: 1.1, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                src={shelter?.image}
                alt={shelter?.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              {/* Emotional Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 transition-opacity duration-300" />
              
              {/* Trust Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg text-green-700">
                  <Shield className="w-4 h-4" /> Verified Partner
                </motion.div>
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg text-rose-600">
                  <Heart className="w-4 h-4 fill-current" /> Compassionate Care
                </motion.div>
              </div>

              {/* Tagline */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="text-white/80 font-black tracking-widest uppercase text-xs mb-3">
                  Featured Sanctuary
                </div>
                <h4 className="text-white text-3xl md:text-4xl font-black leading-tight drop-shadow-2xl">
                  "A safe haven until forever."
                </h4>
              </div>
            </div>

            {/* Right/Bottom Half: Content */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-between relative" style={{ background: "var(--color-surface)" }}>
              <motion.div
                key={`content-${shelter?.name}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-none" style={{ color: "var(--color-text)" }}>
                  {shelter?.name}
                </h3>
                
                <p className="text-lg md:text-xl leading-relaxed opacity-90 mb-8" style={{ color: "var(--color-text-light)" }}>
                  {shelter?.story}
                </p>

                {/* Emotional Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-5 rounded-3xl" style={{ border: "1px solid var(--color-border)", background: "var(--color-background)" }}>
                     <div className="flex items-center gap-2 mb-2">
                       <Heart className="w-5 h-5 text-rose-500 fill-current" />
                       <span className="text-sm font-black uppercase tracking-widest text-gray-500">Lives Changed</span>
                     </div>
                     <span className="text-4xl md:text-5xl font-black" style={{ color: "var(--color-primary)" }}>{shelter?.petsAdopted}</span>
                  </div>
                  <div className="p-5 rounded-3xl" style={{ border: "1px solid var(--color-border)", background: "var(--color-background)" }}>
                     <div className="flex items-center gap-2 mb-2">
                       <PawPrint className="w-5 h-5 text-indigo-500 fill-current" />
                       <span className="text-sm font-black uppercase tracking-widest text-gray-500">Awaiting Love</span>
                     </div>
                     <span className="text-4xl md:text-5xl font-black" style={{ color: "var(--color-primary)" }}>{shelter?.totalPets}</span>
                  </div>
                </div>

                {/* Featured Pet Preview */}
                <div className="mb-8 min-h-[88px] relative">
                  {featuredPet === "none" ? (
                    <div className="h-full flex items-center justify-center p-4 rounded-xl border text-sm font-medium opacity-75" style={{ borderColor: "var(--color-border)", color: "var(--color-text)", background: "var(--color-background)" }}>
                      No pets yet
                    </div>
                  ) : featuredPet ? (
                    <motion.div 
                      key={featuredPet._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-[1.5rem] flex items-center gap-4 transition-colors hover:bg-black/5 cursor-pointer shadow-sm group/pet" 
                      style={{ border: "1px solid var(--color-border)", background: "var(--color-background)" }}
                      onClick={() => navigate(`/pet/${featuredPet._id || featuredPet.id}`)}
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-inner">
                        <img src={featuredPet.images[0]} alt={featuredPet.name} className="w-full h-full object-cover group-hover/pet:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "var(--color-primary)" }}>Meet {featuredPet.name}</div>
                        <p className="text-sm font-medium opacity-90" style={{ color: "var(--color-text)" }}>
                          {featuredPet.breed} • {formatAge(featuredPet.age)} • Looking for a family
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-4 rounded-xl border border-dashed text-sm opacity-50" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
                      Loading featured pet...
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Action Button using animated UI Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full text-2xl font-black py-7 rounded-[1.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 relative z-10"
                onClick={() => {
                   if(shelter?._id) navigate(`/shelter/${shelter._id}`);
                }}
              >
                Visit Shelter Profile
              </Button>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

export function AboutPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [
    "/about_hero_3.jpg",
    "/about_hero_2.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const values = [
    {
      icon: Heart,
      title: "Compassion First",
      description: "Every pet deserves love, care, and a safe home",
    },
    {
      icon: UsersIcon,
      title: "Community Driven",
      description: "Building a network of caring adopters and shelters",
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Verified shelters and transparent adoption processes",
    },
    {
      icon: Sparkles,
      title: "Innovation in Care",
      description: "Using modern technology to bridge the gap between pets and families",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-8 md:py-12" style={{ background: "var(--color-background)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] flex items-center overflow-hidden rounded-[2.5rem] shadow-2xl bg-black">
            {/* Background Slider */}
            <div className="absolute inset-0 z-0">
              {heroImages.map((src, index) => (
                <div key={src} className="absolute inset-0 w-full h-full">
                  <motion.img
                    src={src}
                    alt={`Hero image ${index + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: index === currentImageIndex ? 1 : 0,
                      scale: index === currentImageIndex ? 1 : 1.05
                    }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay for text readability */}
            </div>

            <div className="relative z-10 w-full px-8 md:px-16 text-left">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl"
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-sm border border-white/20"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    color: "white",
                    backdropFilter: "blur(8px)"
                  }}
                >
                  <PawPrint className="w-4 h-4 text-[var(--color-primary)]" />
                  Our Mission
                </div>
                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white mb-6 drop-shadow-lg"
                >
                  Every Pet <br /> Deserves a <span className="text-[var(--color-primary)] relative inline-block">
                    Home
                  </span>
                </h1>
                
                {/* Slider Dots */}
                <div className="flex gap-3 mt-12">
                  {heroImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentImageIndex ? "bg-[var(--color-primary)] w-8" : "bg-white/50 hover:bg-white w-2"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section with Image */}
      <section
        className="py-16"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-3xl opacity-20"
                  style={{ background: "var(--color-primary)" }}
                />
                <img
                  src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=500&fit=crop"
                  alt="Our story"
                  className="rounded-3xl shadow-2xl relative z-10"
                  style={{ boxShadow: "var(--shadow-lg)" }}
                />
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="absolute -bottom-6 -right-6 p-6 rounded-2xl z-20"
                  style={{
                    background: "var(--color-card)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles
                      className="w-8 h-8"
                      style={{ color: "var(--color-primary)" }}
                    />
                    <div>
                      <p
                        className="font-bold text-2xl"
                        style={{ color: "var(--color-text)" }}
                      >
                        2024
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        Founded
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-xl"
                  style={{ background: "var(--color-primary)" }}
                >
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-primary)" }}
                >
                  Our Journey
                </span>
              </div>
              <h2
                className="text-4xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Our Story
              </h2>
              <div
                className="space-y-4"
                style={{ color: "var(--color-text-light)" }}
              >
                <p className="text-lg leading-relaxed">
                  Founded in 2024, PetMate emerged from a simple observation:
                  countless loving pets were waiting in shelters while families
                  were searching for companions. We saw an opportunity to bridge
                  this gap through technology and compassion.
                </p>
                <p className="text-lg leading-relaxed">
                  What started as a small initiative has grown into a nationwide
                  platform, partnering with shelters to give every pet a voice
                  and every family a chance to find their perfect match.
                </p>
                <p className="text-lg leading-relaxed">
                  Today, we're proud to have facilitated hundreds of successful
                  adoptions, bringing joy to both pets and families. But our
                  work is far from over – every day, more pets need homes, and
                  we're here to make those connections happen.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How to Adopt - Zig-Zag Flow */}
      <section className="py-24 relative overflow-hidden" style={{ background: "var(--color-background)" }}>
        {/* Decorative Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 opacity-20 pointer-events-none"
        >
          <Leaf className="w-12 h-12" style={{ color: "var(--color-primary)" }} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 opacity-20 pointer-events-none"
        >
          <Sparkles className="w-10 h-10" style={{ color: "var(--color-primary)" }} />
        </motion.div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4" style={{ color: "var(--color-primary)" }}>
              How to Adopt
            </h2>
            <p className="text-xl opacity-80" style={{ color: "var(--color-primary)" }}>
              Simple steps to bring your new best friend home
            </p>
          </div>

          <div className="relative">
            {/* SVG Connectors (Desktop Only) */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none" preserveAspectRatio="none">
                <path
                  d="M500,20 C800,20 850,120 850,220 C850,320 250,320 150,420 C50,520 150,620 500,620 C850,620 950,720 950,820 C950,920 600,920 300,980"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="10 10"
                  className="opacity-40"
                  style={{ color: "var(--color-primary)" }}
                />
              </svg>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: "01",
                  title: "Choose a Pet",
                  desc: "Find the heart that speaks to yours in our gallery.",
                  icon: Search,
                  image: "/illustrations/step1.png",
                  align: "left",
                  blob: "M45,-60.2C58.3,-52.1,69.1,-39.1,73.1,-24.4C77.1,-9.7,74.3,6.8,67.8,21.5C61.3,36.2,51,49.1,38.1,57.1C25.2,65.1,9.6,68.2,-5.1,66.8C-19.8,65.4,-33.6,59.5,-45.5,50.4C-57.5,41.4,-67.6,29.1,-71.4,14.8C-75.1,0.5,-72.5,-15.8,-64,-28.9C-55.5,-42,-41.2,-51.9,-27.1,-59.5C-13,-67.1,0.8,-72.4,14,-71.4C27.2,-70.4,31.7,-68.3,45,-60.2Z"
                },
                {
                  id: "02",
                  title: "Check Availability",
                  desc: "A quick check to see if your future friend is ready for you.",
                  icon: Clock,
                  image: "/illustrations/step2.png",
                  align: "right",
                  blob: "M42.2,-57.4C55.7,-50.2,68.4,-39.8,72.7,-26.4C77,-13,73,-13.3,67.5,0.7C62.1,14.7,55.2,43,41.7,56.5C28.2,70,8.2,68.7,-10.8,64.8C-29.8,60.9,-47.8,54.4,-60.5,41.4C-73.2,28.4,-80.7,8.9,-78.3,-10.1C-75.9,-29.1,-63.6,-47.6,-47.4,-54.2C-31.2,-60.8,-11.1,-55.5,2.4,-58.8C15.9,-62.1,28.7,-74.6,42.2,-57.4Z"
                },
                {
                  id: "03",
                  title: "Learn Their Story",
                  desc: "Discover the journey that led them to this moment.",
                  icon: BookOpen,
                  image: "/illustrations/step3.png",
                  align: "left",
                  blob: "M48.1,-64.1C61.3,-55.8,70.1,-41.2,74.5,-25.9C78.9,-10.6,78.8,5.4,72.7,19.1C66.6,32.8,54.5,44.2,40.8,53.2C27.1,62.2,11.8,68.8,-3,71.5C-17.8,74.2,-31.9,73,-44.6,65.6C-57.3,58.2,-68.6,44.6,-73.4,29.3C-78.2,14.1,-76.5,-2.8,-70.6,-17.8C-64.7,-32.8,-54.6,-45.9,-42,-54.4C-29.4,-62.8,-14.7,-66.6,0.6,-67.4C15.9,-68.2,34.9,-72.5,48.1,-64.1Z"
                },
                {
                  id: "04",
                  title: "Visit the Shelter",
                  desc: "The magical first meeting where two lives begin to change.",
                  icon: MapPin,
                  image: "/illustrations/step4.png",
                  align: "right",
                  blob: "M37.5,-52.1C49,-46,59.1,-37.2,64.2,-25.9C69.3,-14.6,69.4,-0.8,65.9,12.5C62.4,25.8,55.3,38.6,45,49.1C34.7,59.6,21.2,67.8,6.8,68.4C-7.6,69,-22.9,62,-35.1,52.2C-47.3,42.4,-56.4,29.8,-61.8,15.6C-67.2,1.4,-68.9,-14.4,-62.4,-26.8C-55.9,-39.2,-41.2,-48.2,-28.1,-53.4C-15,-58.6,-3.5,-60,8.2,-58.6C19.9,-57.2,26,-58.2,37.5,-52.1Z"
                },
                {
                  id: "05",
                  title: "Apply to Adopt",
                  desc: "Take the first official step toward a lifetime of wagging tails.",
                  icon: FileEdit,
                  image: "/illustrations/step5.png",
                  align: "left",
                  blob: "M44.7,-76.4C58.1,-69.2,70.1,-59.1,79.5,-46.5C88.8,-33.9,95.5,-17,95.8,-0.1C96.1,16.7,90,33.4,79.9,46.8C69.7,60.2,55.5,70.3,40.4,77.9C25.3,85.5,9.4,90.6,-5.5,88.9C-20.4,87.3,-34.3,78.8,-47.9,69.5C-61.5,60.2,-74.8,50.1,-82.1,36.5C-89.4,22.9,-90.7,5.8,-87.3,-10.1C-83.9,-26.1,-75.7,-40.8,-64.5,-49.9C-53.2,-59,-38.8,-62.4,-25.1,-69.5C-11.4,-76.5,1.5,-87.2,16.6,-88.9C31.7,-90.6,44.7,-76.4,44.7,-76.4Z"
                },
                {
                  id: "06",
                  title: "Final Approval",
                  desc: "The moment you've waited for—welcome home, little one!",
                  icon: CheckCircle,
                  image: "/illustrations/step6.png",
                  align: "right",
                  blob: "M43.7,-64.2C56.3,-58.3,66,-45.5,72.1,-31.2C78.2,-16.9,80.7,-1.1,77.9,13.9C75.1,28.9,67,43.1,55.2,53.4C43.4,63.7,27.9,70,12.3,71.2C-3.3,72.4,-19,68.5,-32.8,61C-46.6,53.5,-58.5,42.4,-66.1,29.1C-73.7,15.8,-77,0.3,-73.4,-13.4C-69.8,-27.1,-59.3,-39.1,-47.4,-45.4C-35.5,-51.7,-22.2,-52.3,-9,-54.2C4.2,-56.1,17.4,-59.3,31.2,-70.1C45,-80.9,31.1,-70.1,43.7,-64.2Z"
                }
              ].map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: step.align === "left" ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col lg:flex-row items-center gap-12 ${step.align === "right" ? "lg:flex-row-reverse" : ""}`}
                >
                  {/* Step Bubble Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className={`relative inline-block p-10 group ${step.align === "right" ? "lg:text-right" : ""}`}>
                      {/* Blob Background */}
                      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 opacity-20" style={{ color: "var(--color-primary)" }}>
                        <svg viewBox="0 0 200 200" className="w-full h-full fill-current">
                          <path d={step.blob} transform="translate(100 100)" />
                        </svg>
                      </div>

                      {/* Custom Illustration */}
                      <div className="absolute inset-0 flex items-center justify-center p-6 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                        <img 
                          src={step.image} 
                          alt="" 
                          className="w-full h-full object-contain mix-blend-multiply" 
                        />
                      </div>
                      
                      <div className="relative z-10 space-y-3">
                        <div className={`flex items-center gap-4 ${step.align === "right" ? "lg:flex-row-reverse" : ""}`}>
                          <div className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform" style={{ background: "var(--color-primary)" }}>
                            <step.icon className="w-6 h-6" />
                          </div>
                          <span className="text-4xl font-black" style={{ color: "var(--color-primary)" }}>{step.id}</span>
                        </div>
                        <h4 className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>{step.title}</h4>
                        <p className="text-base opacity-90 max-w-sm" style={{ color: "var(--color-text)" }}>{step.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Spacer for zig-zag */}
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Final Emotional Hook */}
          <div className="mt-20 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="inline-block p-10 rounded-[3rem] shadow-2xl relative"
              style={{ background: "var(--color-card)" }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl" style={{ background: "var(--color-primary)" }}>
                <Heart className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-2xl font-black mb-4 mt-6" style={{ color: "var(--color-primary)" }}>Ready to start?</h4>
              <p className="text-lg opacity-80 mb-6" style={{ color: "var(--color-text)" }}>Your new best friend is waiting for their forever home.</p>
              <button className="px-10 py-4 rounded-full text-white font-black text-lg shadow-xl hover:scale-105 transition-transform" style={{ background: "var(--color-primary)" }}>
                Browse Pets
              </button>
              
              <PawPrint className="absolute -bottom-6 -right-6 w-12 h-12 opacity-10 rotate-12" style={{ color: "var(--color-primary)" }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}

      {/* Values */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 relative z-20">
            <h2
              className="text-4xl md:text-5xl font-black mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Our Values
            </h2>
            <p className="text-lg md:text-xl font-medium" style={{ color: "var(--color-text-light)" }}>
              The core principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-20">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col shadow-lg hover:shadow-2xl relative z-20 group"
                  style={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "2rem",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shrink-0 transition-transform group-hover:scale-110 duration-300 shadow-sm"
                    style={{ background: "var(--color-surface)" }}
                  >
                    <IconComponent className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ color: "var(--color-text)" }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: "var(--color-text-light)" }}>
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Shelters */}
      <ShelterSection />

      {/* Impact Stats */}
      <section
        className="py-20"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Our Impact
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "500+", label: "Successful Adoptions", icon: Heart },
              { number: "25+", label: "Partner Shelters", icon: Building2 },
              { number: "1000+", label: "Happy Families", icon: UsersIcon },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl"
                style={{
                  background: "var(--color-card)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                  style={{ background: "var(--color-primary)" }}
                  whileHover={{ scale: 1.1 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <div
                  className="text-5xl font-bold mb-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  {stat.number}
                </div>
                <div
                  className="text-lg"
                  style={{ color: "var(--color-text-light)" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}



