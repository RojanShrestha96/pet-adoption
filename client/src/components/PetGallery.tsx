import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export interface PetGalleryProps {
  images: string[];
  petName: string;
}
export function PetGallery({
  images,
  petName
}: PetGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const next = () => setCurrentIndex((currentIndex + 1) % images.length);
  const previous = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  return <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{
      borderRadius: 'var(--radius-lg)'
    }}>
        <AnimatePresence mode="wait">
          <motion.img key={currentIndex} src={images[currentIndex]} alt={`${petName} - Image ${currentIndex + 1}`} className="w-full h-full object-cover" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.3
        }} />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && <>
            <button onClick={previous} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all" style={{
          background: 'rgba(255, 255, 255, 0.9)',
          boxShadow: 'var(--shadow-md)'
        }}>
              <ChevronLeft className="w-6 h-6" style={{
            color: 'var(--color-text)'
          }} />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all" style={{
          background: 'rgba(255, 255, 255, 0.9)',
          boxShadow: 'var(--shadow-md)'
        }}>
              <ChevronRight className="w-6 h-6" style={{
            color: 'var(--color-text)'
          }} />
            </button>
          </>}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium" style={{
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white'
      }}>
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => <button key={index} onClick={() => setCurrentIndex(index)} className="aspect-square overflow-hidden transition-all" style={{
        borderRadius: 'var(--radius-md)',
        border: currentIndex === index ? '3px solid var(--color-primary)' : '3px solid transparent',
        opacity: currentIndex === index ? 1 : 0.6
      }}>
              <img src={image} alt={`${petName} thumbnail ${index + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform" />
            </button>)}
        </div>}
    </div>;
}