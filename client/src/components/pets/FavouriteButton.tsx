import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

export interface FavouriteButtonProps {
  petId: string;
  initialFavourited?: boolean;
  size?: "sm" | "md" | "lg";
}

export function FavouriteButton({
  petId,
  initialFavourited = false,
  size = "md",
}: FavouriteButtonProps) {
  const { user, refreshUser } = useAuth();
  const [isFavourited, setIsFavourited] = useState(initialFavourited);
  const [loading, setLoading] = useState(false);

  // Sync state with user profile
  useEffect(() => {
    if (user && user.favoritePets) {
      // Check if petId is in user.favoritePets
      // Note: favoritePets might be an array of strings or objects depending on population
      const isFav = user.favoritePets.some((fav: any) => 
        (typeof fav === 'string' ? fav : fav._id) === petId
      );
      setIsFavourited(isFav);
    } else {
       // Fallback to localStorage for guests
       const favourites = JSON.parse(localStorage.getItem("petmate-favourites") || "[]");
       setIsFavourited(favourites.includes(petId));
    }
  }, [user, petId]);

  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;

    // If user is logged in, use API
    if (user) {
      try {
        setLoading(true);
        // Optimistic update
        const newState = !isFavourited;
        setIsFavourited(newState);

        await api.put(`/auth/profile/favorites/${petId}`);
        
        // Refresh profile to get updated favorites list in context
        if (refreshUser) {
            await refreshUser();
        }
        
        toast.success(newState ? "Added to favourites" : "Removed from favourites");
      } catch (error) {
        console.error("Error toggling favorite:", error);
        // Revert on error
        setIsFavourited(!isFavourited);
        toast.error("Failed to update favourite");
      } finally {
        setLoading(false);
      }
    } else {
      // Guest: localStorage logic
      const newState = !isFavourited;
      setIsFavourited(newState);
      
      const favourites = JSON.parse(localStorage.getItem("petmate-favourites") || "[]");
      if (newState) {
        if (!favourites.includes(petId)) favourites.push(petId);
      } else {
        const index = favourites.indexOf(petId);
        if (index > -1) favourites.splice(index, 1);
      }
      localStorage.setItem("petmate-favourites", JSON.stringify(favourites));
      
      if (newState) {
          toast.success("Saved to temporary favourites");
      }
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`${sizes[size]} rounded-full flex items-center justify-center transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
      style={{
        background: isFavourited ? "var(--color-primary)" : "white",
        boxShadow: "var(--shadow-sm)",
      }}
      whileTap={{
        scale: 0.9,
      }}
      whileHover={{
        scale: 1.1,
      }}
      disabled={loading}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isFavourited ? [1, 1.3, 1] : 1,
        }}
        transition={{
          duration: 0.3,
        }}
      >
        <Heart
          className={iconSizes[size]}
          style={{
            color: isFavourited ? "white" : "var(--color-text-light)",
            fill: isFavourited ? "white" : "none",
          }}
        />
      </motion.div>
    </motion.button>
  );
}