import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
export interface FavouriteButtonProps {
  petId: string;
  initialFavourited?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
export function FavouriteButton({
  petId,
  initialFavourited = false,
  size = 'md'
}: FavouriteButtonProps) {
  const [isFavourited, setIsFavourited] = useState(initialFavourited);
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavourited(!isFavourited);
    // Store in localStorage
    const favourites = JSON.parse(localStorage.getItem('petmate-favourites') || '[]');
    if (!isFavourited) {
      favourites.push(petId);
    } else {
      const index = favourites.indexOf(petId);
      if (index > -1) favourites.splice(index, 1);
    }
    localStorage.setItem('petmate-favourites', JSON.stringify(favourites));
  };
  return <motion.button onClick={handleClick} className={`${sizes[size]} rounded-full flex items-center justify-center transition-all`} style={{
    background: isFavourited ? 'var(--color-primary)' : 'white',
    boxShadow: 'var(--shadow-sm)'
  }} whileTap={{
    scale: 0.9
  }} whileHover={{
    scale: 1.1
  }}>
      <motion.div initial={false} animate={{
      scale: isFavourited ? [1, 1.3, 1] : 1
    }} transition={{
      duration: 0.3
    }}>
        <Heart className={iconSizes[size]} style={{
        color: isFavourited ? 'white' : 'var(--color-text-light)',
        fill: isFavourited ? 'white' : 'none'
      }} />
      </motion.div>
    </motion.button>;
}