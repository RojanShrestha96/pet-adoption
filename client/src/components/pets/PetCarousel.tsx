import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PetCard } from './PetCard';
import type { Pet } from '../../data/mockData';
export interface PetCarouselProps {
  pets: Pet[];
  autoPlay?: boolean;
  interval?: number;
}
export function PetCarousel({
  pets,
  autoPlay = true,
  interval = 5000
}: PetCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(pets.length / itemsPerPage);
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalPages);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, totalPages]);
  const next = () => setCurrentIndex((currentIndex + 1) % totalPages);
  const previous = () => setCurrentIndex((currentIndex - 1 + totalPages) % totalPages);
  const visiblePets = pets.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage);
  return <div className="relative">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{
          opacity: 0,
          x: 100
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -100
        }} transition={{
          duration: 0.5
        }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePets.map((pet, index) => <PetCard key={(pet as any)._id || pet.id} pet={pet} index={index} />)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {totalPages > 1 && <>
          <button onClick={previous} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-3 rounded-full transition-all hover:scale-110" style={{
        background: 'var(--color-card)',
        boxShadow: 'var(--shadow-lg)'
      }}>
            <ChevronLeft className="w-6 h-6" style={{
          color: 'var(--color-text)'
        }} />
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-3 rounded-full transition-all hover:scale-110" style={{
        background: 'var(--color-card)',
        boxShadow: 'var(--shadow-lg)'
      }}>
            <ChevronRight className="w-6 h-6" style={{
          color: 'var(--color-text)'
        }} />
          </button>
        </>}

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({
        length: totalPages
      }).map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className="w-2 h-2 rounded-full transition-all" style={{
        background: currentIndex === index ? 'var(--color-primary)' : 'var(--color-border)',
        width: currentIndex === index ? '24px' : '8px'
      }} />)}
      </div>
    </div>;
}