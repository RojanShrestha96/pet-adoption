import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  Search,
  MapPin,
  PawPrint,
  Sparkles,
  ArrowUpDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { SearchBar } from "../../components/forms/SearchBar";
import { FilterPanel, FilterOptions } from "../../components/forms/FilterPanel";
import { PetCard } from "../../components/pets/PetCard";
import LocationSearchBar from "../../components/forms/LocationSearchBar";
import RadiusFilter from "../../components/forms/RadiusFilter";
import type { Pet } from "../../data/mockData";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import axios from "axios";
import { ageToMonths } from "../../utils/ageUtils";

// Pet interface (matching backend model) is now imported from mockData.ts

// Default empty filters
const defaultFilters: FilterOptions = {
  species: [],
  gender: [],
  size: [],
  age: [],
  healthStatus: [],
  shelter: [],
};

export function SearchPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [sortBy, setSortBy] = useState("newest");
  const [isSearching, setIsSearching] = useState(false);

  // Geolocation states
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, label: string} | null>(null);
  const [searchRadius, setSearchRadius] = useState<number | null>(25);

  // Fetch pets from API whenever location or radius changes
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (userLocation) {
          // Always use proximity endpoint when user location is set.
          // When "Anywhere" is selected (null), pass 'null' string so backend defaults to 5000 km.
          const radiusParam = searchRadius ?? 'null';
          const url = `http://localhost:5000/api/pets/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radiusParam}&limit=50`;
          console.log('[SearchPage] Fetching nearby:', url);
          response = await axios.get(url);
        } else {
          // No location set: standard search, no distance info
          response = await axios.get("http://localhost:5000/api/pets");
        }
        
        // Transform data to match expected format
        const transformedPets = response.data.pets.map((pet: any) => ({
          ...pet,
          id: pet._id,
          location: pet.shelter?.location?.formattedAddress || "Location not set by shelter",
          healthStatus: (pet.medical?.healthStatus || "healthy").toLowerCase(),
          ageInMonths: 0, // Default value for compatibility
          // Transform compatibility for backwards compatibility
          compatibility: {
            kids: pet.compatibility?.goodWithKids || false,
            pets: pet.compatibility?.goodWithPets || false,
            apartment: pet.compatibility?.apartmentFriendly || false,
          },
          personality: pet.temperament || [],
          medical: {
            vaccinated: pet.medical?.isVaccinated || false,
            dewormed: pet.medical?.isDewormed || false,
            sterilized: pet.medical?.isNeutered || pet.medical?.isSterilized || false,
            lastCheckup: pet.medical?.lastCheckup || new Date().toISOString(),
            notes: pet.medical?.notes || pet.medical?.healthStatus || "",
          },
          shelter: {
            name: pet.shelter?.name || "Unknown Shelter",
            contact: pet.shelter?.contact || "",
            email: pet.shelter?.email || "",
          },
          adoptionStatus: (pet.adoptionStatus as any) || "available",
          // Map distanceKm from nearby search
          distanceKm: pet.distanceKm,
        })) as Pet[];
        
        setPets(transformedPets);
      } catch (err: any) {
        console.error("Error fetching pets:", err);
        setError(err.response?.data?.message || "Failed to load pets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [userLocation, searchRadius]); // Re-fetch when location/radius changes

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and sort pets
  const filteredPets = useMemo(() => {
    let result = [...pets];

    // Search filter
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      result = result.filter(
        (pet) =>
          pet.name.toLowerCase().includes(query) ||
          pet.breed.toLowerCase().includes(query) ||
          (pet.location && pet.location.toLowerCase().includes(query)) ||
          pet.species.toLowerCase().includes(query)
      );
    }

    // Species filter
    if (filters.species.length > 0) {
      result = result.filter((pet) =>
        filters.species.some(
          (s) => s.toLowerCase() === pet.species.toLowerCase()
        )
      );
    }

    // Gender filter
    if (filters.gender.length > 0) {
      result = result.filter((pet) =>
        filters.gender.some((g) => g.toLowerCase() === pet.gender.toLowerCase())
      );
    }

    // Size filter
    if (filters.size.length > 0) {
      result = result.filter((pet) =>
        filters.size.some((s) => s.toLowerCase() === pet.size?.toLowerCase())
      );
    }

    // Age filter
    if (filters.age.length > 0) {
      result = result.filter((pet) => {
        const totalMonths = ageToMonths(pet.age);
        
        return filters.age.some((ageRange) => {
          if (ageRange === "Puppy/Kitten") return totalMonths < 12;
          if (ageRange === "Young") return totalMonths >= 12 && totalMonths < 36;
          if (ageRange === "Adult") return totalMonths >= 36 && totalMonths < 84;
          if (ageRange === "Senior") return totalMonths >= 84;
          return false;
        });
      });
    }

    // Health status filter
    if (filters.healthStatus.length > 0) {
      result = result.filter((pet) =>
        filters.healthStatus.includes(pet.healthStatus)
      );
    }



    // Shelter filter
    if (filters.shelter.length > 0) {
      result = result.filter((pet) =>
        filters.shelter.includes(pet.shelter.name)
      );
    }

    // Sorting
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "age":
        result.sort((a, b) => ageToMonths(a.age) - ageToMonths(b.age));
        break;
      case "oldest":
        result.reverse();
        break;
      case "nearest":
        // Only works if distanceKm exists (which it does when userLocation is set)
        result.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        break;
      // 'newest' is default order
    }

    return result;
  }, [pets, debouncedQuery, filters, sortBy]);

  const handleFilterChange = (
    category: keyof FilterOptions,
    values: string[]
  ) => {
    setFilters((prev) => ({ ...prev, [category]: values }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery("");
  };

  const removeFilter = (category: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((v) => v !== value),
    }));
  };

  // Get all active filters as chips
  const activeFilters = Object.entries(filters).flatMap(([category, values]) =>
    values.map((value: string) => ({
      category: category as keyof FilterOptions,
      value,
    }))
  );

  // Extract unique shelters
  const availableShelters = useMemo(() => {
    const shelters = pets.map(pet => pet.shelter.name);
    return Array.from(new Set(shelters)).sort();
  }, [pets]);

  const hasActiveFilters = activeFilters.length > 0 || searchQuery;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* Hero Search Header */}
      <div
        className="relative overflow-hidden py-12 md:py-16"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark, var(--color-primary)) 100%)",
        }}
      >
        {/* Decorative floating paw prints */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => {
            // Distribute paw prints across the area
            const positions = [
              { left: "5%", top: "10%" },
              { left: "25%", top: "60%" },
              { left: "45%", top: "20%" },
              { left: "65%", top: "70%" },
              { left: "85%", top: "30%" },
              { left: "15%", top: "80%" },
              { left: "35%", top: "40%" },
              { left: "55%", top: "85%" },
              { left: "75%", top: "15%" },
              { left: "90%", top: "55%" },
              { left: "10%", top: "45%" },
              { left: "70%", top: "50%" },
            ];
            const pos = positions[i];

            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: pos.left, top: pos.top }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              >
                <PawPrint
                  className="text-white opacity-15"
                  style={{
                    width: `${25 + (i % 4) * 12}px`,
                    height: `${25 + (i % 4) * 12}px`,
                    transform: `rotate(${i * 30}deg)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Find Your Perfect Companion
            </h1>
            <p className="text-white/80 text-lg">
              Discover loving pets waiting for their forever home
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, breed, or location..."
              className="relative w-full"
              inputClassName="w-full pl-14 pr-12 py-4 text-lg rounded-2xl border-0 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              style={{ background: "var(--color-card)" }}
              onClear={() => setSearchQuery("")}
            />
            {isSearching && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/60 text-sm mt-2 ml-2"
              >
                Searching...
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mb-4" />
            <p className="text-lg" style={{ color: "var(--color-text)" }}>
              Loading pets...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl"
            style={{
              background: "var(--color-card)",
              border: "2px solid var(--color-error)",
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: "var(--color-error)" }} />
              <div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "var(--color-text)" }}>
                  Failed to Load Pets
                </h3>
                <p style={{ color: "var(--color-text-light)" }} className="mb-4">
                  {error}
                </p>
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Location Proximity Search */}
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Find Pets Near You</h3>
          </div>

          <div className="mb-10 p-8 rounded-[2rem] border-2 shadow-sm transition-all hover:shadow-md" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              <div className="flex-1 w-full">
                <LocationSearchBar location={userLocation} setLocation={setUserLocation} />
              </div>
              <div className="flex-shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
                <RadiusFilter 
                  radius={searchRadius} 
                  setRadius={setSearchRadius} 
                  disabled={!userLocation} 
                />
              </div>
            </div>
            
            {!userLocation && (
              <div className="mt-4 text-xs italic text-gray-500 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                Select a location to enable distance filtering
              </div>
            )}
          </div>

        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <motion.p
              key={filteredPets.length}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-lg"
              style={{ color: "var(--color-text)" }}
            >
              <span
                className="font-bold"
                style={{ color: "var(--color-primary)" }}
              >
                {filteredPets.length}
              </span>{" "}
              {filteredPets.length === 1 ? "pet" : "pets"} found
            </motion.p>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                icon={<X className="w-4 h-4" />}
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              className="lg:hidden"
              icon={<SlidersHorizontal className="w-5 h-5" />}
              onClick={() => setShowMobileFilters(true)}
            >
              Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
            </Button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[var(--color-text-light)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 rounded-xl text-sm font-medium focus:outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-card)",
                  color: "var(--color-text)",
                }}
              >
                {userLocation && <option value="nearest">Nearest First</option>}
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="age">Age (Youngest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {activeFilters.map(({ category, value }) => (
                <motion.div
                  key={`${category}-${value}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <Badge
                    variant="info"
                    className="pl-3 pr-1 py-1.5 flex items-center gap-2"
                  >
                    <PawPrint className="w-3 h-3" />
                    {value}
                    <button
                      onClick={() => removeFilter(category, value)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              availableShelters={availableShelters}
            />
          </aside>

          {/* Results */}
          <div className="flex-1">
            {filteredPets.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredPets.map((pet, index) => (
                    <motion.div
                      key={pet.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <PetCard pet={pet} index={0} variant="compact" showLocation={true} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div
                  className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ background: "var(--color-surface)" }}
                >
                  <PawPrint className="w-12 h-12 text-[var(--color-text-light)]" />
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: "var(--color-text)" }}
                >
                  No pets found
                </h3>
                <p
                  className="text-base mb-6"
                  style={{ color: "var(--color-text-light)" }}
                >
                  Try adjusting your filters or search query
                </p>
                <Button
                  variant="primary"
                  onClick={handleResetFilters}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Reset Filters
                </Button>
              </motion.div>
            )}

            {/* Load More */}
            {filteredPets.length > 0 && filteredPets.length >= 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-12"
              >
                <Button
                  variant="outline"
                  size="lg"
                  icon={<PawPrint className="w-5 h-5" />}
                >
                  Load More Pets
                </Button>
              </motion.div>
            )}
          </div>
       </div>
        </div>
      )}
     {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 max-w-full z-50 overflow-y-auto lg:hidden"
              style={{ background: "var(--color-background)" }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
                  >
                    <X
                      className="w-6 h-6"
                      style={{ color: "var(--color-text)" }}
                    />
                  </button>
                </div>

                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  availableShelters={availableShelters}
                />

                <div className="mt-6">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setShowMobileFilters(false)}
                  >
                    Show {filteredPets.length} Results
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}



