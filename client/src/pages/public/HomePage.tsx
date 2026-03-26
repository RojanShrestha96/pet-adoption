import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { SearchBar } from "../../components/forms/SearchBar";
import { Button } from "../../components/ui/Button";
import { SuccessStoriesCarousel } from "../../components/stories/SuccessStoriesCarousel";
import { ShelterCard } from "../../components/shelters/ShelterCard";
import {
  PawPrint,
  Heart,
  Dog,
  Cat,
  Bird,
  Rabbit,
  ArrowRight,
  Sparkles,
  MapPin,
  User,
} from "lucide-react";
import { PawAdoptSection } from "../../components/layout/PawAdoptSection";
import { mockPets } from "../../data/mockData";
import axios from "axios";
import { successStories } from "../../data/successStories";
import { useAuth } from "../../contexts/AuthContext";



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



  const quickFilters = [
    { label: "Dogs", icon: Dog, species: "dog" },
    { label: "Cats", icon: Cat, species: "cat" },
    { label: "Birds", icon: Bird, species: "bird" },
    { label: "Rabbits", icon: Rabbit, species: "rabbit" },
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
                journey to finding a loyal pets.
              </p>


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
                    Find a Pet
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

                  </div>
                </div>
              </motion.div>


            </motion.div>
          </div>
        </div>
      </section>



      {/* Featured Pets Carousel */}
      <section
        className="pt-16 pb-8"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6"
          >
            <div className="text-left max-w-2xl">
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200 } }
                }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-6 shadow-sm ring-1 ring-black/5"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-primary)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Featured Pets
              </motion.div>
              
              <motion.h2
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
                }}
                className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                Meet Our <span className="text-[var(--color-primary)] relative inline-block">
                  Adorable Friends
                  <motion.span 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                    className="absolute -bottom-1 left-0 h-2 bg-[var(--color-primary)] opacity-20 rounded-full"
                  />
                </span>
              </motion.h2>
              
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                }}
                className="text-lg md:text-xl font-medium leading-relaxed opacity-90"
                style={{ color: "var(--color-text-light)" }}
              >
                These loving pets are waiting for their forever homes. Could you
                be their perfect match?
              </motion.p>
            </div>

            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
              }}
              className="shrink-0 mb-2 md:mb-0"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/search")}
                icon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                className="hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition-all shadow-sm group"
              >
                View All Pets
              </Button>
            </motion.div>
          </motion.div>

          {loadingPets ? (
             <div className="flex justify-center py-10">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[650px]">
              {/* Left Side - Big Card */}
              {featuredPets.length > 0 && (
                <div className="h-[450px] lg:h-full relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer border border-[var(--color-border)]">
                  <Link to={`/pet/${featuredPets[0]._id || featuredPets[0].id}`} className="block w-full h-full relative">
                    <img
                      src={
                        featuredPets[0].images?.[0] ||
                        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600"
                      }
                      alt={featuredPets[0].name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 z-10" />
                    
                    <div className="relative z-20 h-full flex flex-col justify-end p-8">
                       <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4 w-full">
                         <div className="flex-1">
                           <h3 className="text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-md">
                             {featuredPets[0].name}
                           </h3>
                           <p className="text-white/90 text-xl font-medium mb-3 drop-shadow-sm">
                             {featuredPets[0].breed} • <span className="capitalize">{featuredPets[0].gender}</span>
                           </p>
                         </div>
                         <div className="flex flex-row sm:flex-col items-end gap-3 shrink-0">
                           <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium text-sm border border-white/20 shadow-sm">
                             {featuredPets[0].age}
                           </div>
                           <div className="bg-green-500/80 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium text-sm border border-green-400/30 shadow-sm">
                             Vaccinated
                           </div>
                         </div>
                       </div>
                       
                       <div className="w-full">
                         <Button 
                           variant="primary" 
                           fullWidth 
                           size="lg"
                         >
                           Meet {featuredPets[0].name} <PawPrint className="w-5 h-5 ml-2 inline-block object-contain" />
                         </Button>
                       </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Right Side - Two Small Cards Stacked */}
              {featuredPets.length > 1 && (
                <div className="grid grid-cols-1 gap-6 h-full auto-rows-fr">
                  {featuredPets.slice(1, 3).map((pet) => (
                    <div key={pet._id || pet.id} className="relative rounded-3xl overflow-hidden shadow-2xl h-full group cursor-pointer border border-[var(--color-border)]">
                      <Link to={`/pet/${pet._id || pet.id}`} className="block w-full h-full relative min-h-[250px]">
                        <img
                          src={
                            pet.images?.[0] ||
                            "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600"
                          }
                          alt={pet.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 z-10" />
                        
                        <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-8">
                            <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
                              {pet.name}
                            </h3>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-white/90 text-lg font-medium drop-shadow-sm">
                                {pet.breed}
                              </p>
                              <div className="bg-white/30 backdrop-blur-md p-2.5 rounded-full text-white border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                                <ArrowRight className="w-5 h-5" />
                              </div>
                            </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <PawAdoptSection />

      {/* Success Stories Section — Premium Carousel */}
      <section
        className="pt-8 pb-20 overflow-hidden"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="text-center mb-14"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200 } }
              }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-6 shadow-sm ring-1 ring-black/5"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-primary)",
              }}
            >
              <Heart className="w-4 h-4" />
              Happy Tails
            </motion.div>
            
            <motion.h2
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
              }}
              className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight leading-tight"
              style={{ color: "var(--color-text)" }}
            >
              Real Stories, <span className="text-[var(--color-primary)] relative inline-block">
                Real Homes
                <motion.span 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                  className="absolute -bottom-1 left-0 h-2 bg-[var(--color-primary)] opacity-20 rounded-full"
                />
              </span>
            </motion.h2>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              className="text-lg md:text-xl font-medium leading-relaxed opacity-90 max-w-2xl mx-auto"
              style={{ color: "var(--color-text-light)" }}
            >
              Heartwarming tales of second chances and the beautiful bonds that transformed lives forever.
            </motion.p>
          </motion.div>

          <SuccessStoriesCarousel stories={successStories} />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
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
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8"
          >
            <div className="max-w-2xl">
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200 } }
                }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-6 shadow-sm ring-1 ring-black/5"
                style={{
                  background: "var(--color-background)",
                  color: "var(--color-primary)",
                }}
              >
                <MapPin className="w-4 h-4" />
                Find Shelters
              </motion.div>

              <motion.h2
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
                }}
                className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                Nearby <span className="text-[var(--color-primary)] relative inline-block">
                  Trusted Shelters
                  <motion.span 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                    className="absolute -bottom-1 left-0 h-2 bg-[var(--color-primary)] opacity-20 rounded-full"
                  />
                </span>
              </motion.h2>
              
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                }}
                className="text-lg md:text-xl font-medium leading-relaxed opacity-95"
                style={{ color: "var(--color-text-light)" }}
              >
                Visit local champions of animal welfare and find your next family member.
              </motion.p>
            </div>

            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
              }}
            >
              <Button
                variant="outline"
                size="lg"
                icon={<MapPin className="w-5 h-5" />}
                onClick={() => {
                  alert("Location feature coming soon!");
                }}
              >
                Set Location
              </Button>
            </motion.div>
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
        className="pt-16 pb-8"
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



