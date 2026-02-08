import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { SearchBar } from "../../components/forms/SearchBar";
import { Button } from "../../components/ui/Button";
import { PetCarousel } from "../../components/pets/PetCarousel";
import { ShelterCard } from "../../components/shelters/ShelterCard";
import { Card } from "../../components/ui/Card";
import {
  PawPrint,
  Heart,
  Home,
  CheckCircle,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Users,
  Building2,
  TrendingUp,
  Quote,
  ArrowRight,
  Sparkles,
  Shield,
  MapPin,
  User,
} from "lucide-react";
import { mockPets } from "../../data/mockData";
import axios from "axios";
import { successStories } from "../../data/successStories";
import { useAuth } from "../../contexts/AuthContext";

// Animated counter component
function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredPets, setFeaturedPets] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [loadingShelters, setLoadingShelters] = useState(true);
  const [loadingPets, setLoadingPets] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPets(true);
        // Fetch pets
        const petsRes = await axios.get("http://localhost:5000/api/pets?limit=20");
        const allPets = petsRes.data.pets || [];
        
        // Randomize pets
        const shuffled = [...allPets].sort(() => 0.5 - Math.random());
        setFeaturedPets(shuffled.slice(0, 6));

        // Fetch shelters
        const sheltersRes = await axios.get("http://localhost:5000/api/shelter");
        setShelters(sheltersRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
        // Fallback to mock data if fetch fails
        setFeaturedPets(mockPets.filter((p) => p.adoptionStatus === "available").slice(0, 6));
      } finally {
        setLoadingShelters(false);
        setLoadingPets(false);
      }
    };
    fetchData();
  }, []);

  const featuredStories = successStories.slice(0, 3);

  const quickFilters = [
    { label: "Dogs", icon: Dog, species: "dog" },
    { label: "Cats", icon: Cat, species: "cat" },
    { label: "Birds", icon: Bird, species: "bird" },
    { label: "Rabbits", icon: Rabbit, species: "rabbit" },
  ];

  const stats = [
    { value: 2500, suffix: "+", label: "Pets Adopted", icon: Heart },
    { value: 150, suffix: "+", label: "Partner Shelters", icon: Building2 },
    { value: 98, suffix: "%", label: "Success Rate", icon: TrendingUp },
    { value: 5000, suffix: "+", label: "Happy Families", icon: Users },
  ];

  const whyAdopt = [
    {
      icon: Heart,
      title: "Save a Life",
      description:
        "Give a homeless pet a second chance at happiness and unconditional love",
    },
    {
      icon: Home,
      title: "Find Your Match",
      description:
        "Discover the perfect companion that fits your lifestyle and personality",
    },
    {
      icon: Shield,
      title: "Trusted Process",
      description:
        "All pets are health-checked, vaccinated, and ready for their new home",
    },
  ];

  // Floating icon config for hero background
  const floatingIcons = [
    { left: "5%", top: "15%", Icon: Dog },
    { left: "15%", top: "70%", Icon: Cat },
    { left: "30%", top: "25%", Icon: PawPrint },
    { left: "45%", top: "80%", Icon: Heart },
    { left: "60%", top: "10%", Icon: Bird },
    { left: "75%", top: "65%", Icon: Rabbit },
    { left: "85%", top: "35%", Icon: PawPrint },
    { left: "95%", top: "75%", Icon: Cat },
    { left: "10%", top: "45%", Icon: Dog },
    { left: "50%", top: "50%", Icon: Heart },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* Hero Section - Enhanced Split Layout */}
      <section
        className="relative py-16 md:py-20 overflow-hidden"
        style={{ background: "var(--color-surface)" }}
      >
        {/* Floating pet icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingIcons.map((item, i) => {
            const IconComponent = item.Icon;
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: item.left, top: item.top }}
                animate={{
                  y: [0, -25, 0],
                  rotate: [0, 20, -20, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 5 + (i % 4),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              >
                <IconComponent
                  strokeWidth={2.5}
                  style={{
                    width: `${45 + (i % 3) * 15}px`,
                    height: `${45 + (i % 3) * 15}px`,
                    color: "var(--color-primary)",
                    opacity: 0.18,
                    transform: `rotate(${i * 36}deg)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: "var(--color-card)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <PawPrint
                    className="w-5 h-5"
                    style={{ color: "var(--color-primary)" }}
                  />
                </motion.div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  #1 Pet Adoption Platform
                </span>
              </motion.div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                Give a Pet a{" "}
                <span style={{ color: "var(--color-primary)" }}>
                  Forever Home
                </span>
              </h1>

              <p
                className="text-lg md:text-xl mb-8"
                style={{ color: "var(--color-text-light)" }}
              >
                Connect with loving pets waiting for adoption. Start your
                journey to finding a loyal companion today.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div
                      className="font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      2,500+
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Pets Adopted
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div
                      className="font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      5,000+
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Happy Families
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div
                      className="font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      150+
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Shelters
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and filters */}
              <div className="space-y-5">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={() => navigate("/search")}
                />

                <div className="flex flex-wrap items-center gap-2">
                  {quickFilters.map((filter, index) => {
                    const IconComponent = filter.icon;
                    return (
                      <motion.button
                        key={filter.label}
                        onClick={() => navigate("/search")}
                        className="flex items-center gap-2 px-3 py-2 rounded-full"
                        style={{
                          background: "var(--color-card)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: "var(--color-primary)" }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--color-text)" }}
                        >
                          {filter.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-4"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate("/search")}
                    icon={<PawPrint className="w-5 h-5" />}
                  >
                    Browse Pets
                  </Button>
                  {isLoggedIn ? (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/profile")}
                      icon={<User className="w-5 h-5" />}
                    >
                      My Profile
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/signup")}
                    >
                      Sign Up
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Right side - Single Featured Pet Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <motion.div
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={
                    featuredPets[0]?.images[0] ||
                    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600"
                  }
                  alt="Featured pet"
                  className="w-full h-[450px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {featuredPets[0]?.name || "Buddy"}
                      </h3>
                      <p className="text-white/80">
                        {featuredPets[0]?.breed || "Waiting for a loving home"}
                      </p>
                    </div>
                    <motion.button
                      className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
                      style={{ background: "var(--color-primary)" }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/search")}
                    >
                      <Heart className="w-5 h-5 text-white" />
                      <span className="text-white">Adopt Me</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-4 -left-4 px-4 py-3 rounded-xl shadow-lg"
                style={{ background: "var(--color-card)" }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div
                      className="font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      98%
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Success Rate
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="py-8 border-y"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-2">
                    <div
                      className="p-2 rounded-xl"
                      style={{ background: "var(--color-surface)" }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: "var(--color-primary)" }}
                      />
                    </div>
                  </div>
                  <div
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Pets Carousel */}
      <section
        className="py-16"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-primary)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              Featured Pets
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Meet Our Adorable Friends
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--color-text-light)" }}
            >
              These loving pets are waiting for their forever homes. Could you
              be their perfect match?
            </p>
          </motion.div>

          {loadingPets ? (
             <div className="flex justify-center py-10">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
             </div>
          ) : (
            <PetCarousel pets={featuredPets} />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/search")}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              View All Pets
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Adopt Section */}
      <section className="py-16" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Why Adopt?
            </h2>
            <p className="text-lg" style={{ color: "var(--color-text-light)" }}>
              Make a difference in a pet's life today
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyAdopt.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl text-center transition-shadow"
                  style={{
                    background: "var(--color-card)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                    style={{ background: "var(--color-primary)" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: "var(--color-text)" }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ color: "var(--color-text-light)" }}>
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section
        className="py-16"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-primary)",
              }}
            >
              <Heart className="w-4 h-4" />
              Happy Tails
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Success Stories
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--color-text-light)" }}
            >
              Read heartwarming stories of pets who found their forever homes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -5 }}
              >
                <Card padding="none" hover className="overflow-hidden h-full">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={story.petImage}
                      alt={story.petName}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                      }}
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {story.petName}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {story.petBreed} • Adopted by {story.adopterName}
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <Quote
                        className="w-6 h-6 flex-shrink-0 mt-1"
                        style={{ color: "var(--color-primary)", opacity: 0.5 }}
                      />
                      <p
                        className="text-sm line-clamp-3"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        {story.story.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to="/success-stories">
              <Button
                variant="outline"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Read More Stories
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Nearby Shelters */}
      <section className="py-16" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4"
          >
            <div>
              <h2
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: "var(--color-text)" }}
              >
                Nearby Shelters
              </h2>
              <p
                className="text-lg"
                style={{ color: "var(--color-text-light)" }}
              >
                Visit trusted shelters in your area
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<MapPin className="w-4 h-4" />}
              onClick={() => {
                // Future: Implement location detection
                alert("Location feature coming soon!");
              }}
            >
              Set Location
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingShelters ? (
              <div className="col-span-full text-center py-10">
                Loading shelters...
              </div>
            ) : shelters.length > 0 ? (
              shelters.map((shelter, index) => (
                <motion.div
                  key={shelter._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ShelterCard
                    shelter={{
                      id: shelter._id, // Map _id to id for component compatibility
                      name: shelter.name,
                      location: shelter.address || "Location varies",
                      distance: "2.5 miles", // Mock distance for now
                      image: shelter.logo || "",
                      petsAvailable: shelter.totalPets || 0,
                    }}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-[var(--color-text-light)]">
                No shelters found nearby.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center"
            style={{
              background: "var(--color-primary)",
            }}
          >
            {/* Background paw prints */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
              {[...Array(6)].map((_, i) => (
                <PawPrint
                  key={i}
                  className="absolute text-white"
                  style={{
                    width: `${40 + i * 10}px`,
                    height: `${40 + i * 10}px`,
                    left: `${i * 20}%`,
                    top: `${(i * 30) % 100}%`,
                    transform: `rotate(${i * 60}deg)`,
                  }}
                />
              ))}
            </div>

            <div className="relative">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                style={{ background: "rgba(255,255,255,0.2)" }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Find Your New Best Friend?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Thousands of adorable pets are waiting for loving homes. Start
                your adoption journey today!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/search")}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{
                    background: "white",
                    color: "var(--color-primary)",
                  }}
                >
                  <PawPrint className="w-5 h-5 mr-2" />
                  Find Your Pet
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold transition-all hover:bg-white/20"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    border: "2px solid rgba(255,255,255,0.3)",
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}



