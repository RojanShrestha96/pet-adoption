import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PetCard } from "../../components/pets/PetCard";
import { Button } from "../../components/ui/Button";
import { mockPets } from "../../data/mockData";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

export function FavouritesPage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const [favouritePets, setFavouritePets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendedPets, setRecommendedPets] = useState<any[]>([]);

  useEffect(() => {
    const fetchFavourites = async () => {
      setLoading(true);
      
      if (user) {
        // Logged in: use user's favoritePets
        // Ensure refreshUser has run recently to get latest favorites
        // But assuming user context is relatively fresh or we trust it.
        // If user.favoritePets are populated objects:
        setFavouritePets(user.favoritePets || []);
        setLoading(false);
      } else {
        // Guest: use localStorage
        const favouriteIds = JSON.parse(
          localStorage.getItem("petmate-favourites") || "[]"
        );
        // In a real app, we'd fetch these specific IDs from the server.
        // For now, filtering mockPets is the existing behavior for guests.
        const pets = mockPets.filter((pet) => favouriteIds.includes(pet.id));
        setFavouritePets(pets);
        setLoading(false);
      }
    };

    if (!authLoading) {
        fetchFavourites();
    }
  }, [user, authLoading]);

  // Fetch recommended pets (pets that are available and not already in favourites)
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get("/pets?limit=20");
        const petsList = response.data.pets || response.data || [];
        const favIds = new Set(favouritePets.map(p => (p._id || p.id || "").toString()));
        const filtered = petsList.filter((p: any) => {
          const id = (p._id || p.id || "").toString();
          return !favIds.has(id) && p.adoptionStatus === "available";
        });
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRecommendedPets(shuffled.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch recommended pets:", err);
        // Fallback to mockPets
        const favIds = new Set(favouritePets.map(p => (p._id || p.id || "").toString()));
        const filteredMock = mockPets.filter((p: any) => {
          const id = (p._id || p.id || "").toString();
          return !favIds.has(id) && p.adoptionStatus === "available";
        });
        const shuffledMock = filteredMock.sort(() => 0.5 - Math.random());
        setRecommendedPets(shuffledMock.slice(0, 3));
      }
    };

    if (!loading) {
      fetchRecommendations();
    }
  }, [favouritePets, loading]);

  const handleRemoveAll = async () => {
    if (window.confirm("Remove all favourites?")) {
      if (user) {
        // For logged in user, we'd need to loop and remove or have a clear endpoint
        // Since we don't have a batch clear endpoint, we'll just clear local state for now
        // and ideally call API for each. But to avoid spamming, maybe we just hint availability.
        // Better yet, just iterate and call toggle.
        try {
             // Optional: Implementation for batch removal using Promise.all if needed
             // For now, let's keep it simple and just clear local storage if guest, 
             // but strictly warn/block for user if no API support.
             // Actually, simplest is to iterate remove.
             const promises = favouritePets.map(pet => 
                 api.put(`/auth/profile/favorites/${pet._id || pet.id}`)
             );
             await Promise.all(promises);
             if (refreshUser) await refreshUser();
             toast.success("Favourites cleared");
        } catch (error) {
            console.error(error);
            toast.error("Failed to clear some favourites");
        }
      } else {
        localStorage.setItem("petmate-favourites", "[]");
        setFavouritePets([]);
        toast.success("Favourites cleared");
      }
    }
  };

  if (loading || authLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div
      className="min-h-screen py-12"
      style={{
        background: "var(--color-background)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                }}
              >
                <Heart className="w-6 h-6" fill="currentColor" />
              </div>
              <div>
                <h1
                  className="text-4xl font-bold"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  My Favourites
                </h1>
                <p
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  {favouritePets.length}{" "}
                  {favouritePets.length === 1 ? "pet" : "pets"} saved
                </p>
              </div>
            </div>

            {favouritePets.length > 0 && (
              <Button
                variant="outline"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleRemoveAll}
              >
                Clear All
              </Button>
            )}
          </div>

          {favouritePets.length === 0 ? (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.5,
              }}
              className="text-center py-20"
            >
              <div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
                style={{
                  background: "var(--color-surface)",
                }}
              >
                <Heart
                  className="w-12 h-12"
                  style={{
                    color: "var(--color-text-light)",
                  }}
                />
              </div>
              <h2
                className="text-2xl font-bold mb-3"
                style={{
                  color: "var(--color-text)",
                }}
              >
                No favourites yet
              </h2>
              <p
                className="mb-8"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                Start browsing pets and save your favourites here
              </p>
              <Link to="/search">
                <Button variant="primary" size="lg">
                  Browse Pets
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favouritePets.map((pet, index) => (
                <PetCard key={pet._id || pet.id} pet={pet} index={index} />
              ))}
            </div>
          )}

          {/* Recommended Pets Section */}
          {recommendedPets.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Pets You Might Want to Adopt</h2>
                <p className="text-sm text-gray-500">Available pets selected just for you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedPets.map((pet, index) => (
                  <PetCard key={pet._id || pet.id} pet={pet} index={index} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}



