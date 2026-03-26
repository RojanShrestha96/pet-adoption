import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, Heart } from 'lucide-react';

// Features content for the slider
const features = [
  {
    image: "/save_a_life_candid_1773736158356.png",
    title: "You’re saving more than a life",
    description: "Give a homeless companion the warmth of a home and the security of your love."
  },
  {
    image: "/find_match_candid_1773736183153.png",
    title: "The one that just fits you",
    description: "Our smart matching helps you find the soul that understands your silence and your joy."
  },
  {
    image: "/trusted_process_candid_1773736203204.png",
    title: "Adoption you can trust",
    description: "Every friend is health-checked, supported, and ready for their new forever chapter."
  }
];

const StackedSlider: React.FC = () => {
  const [index, setIndex] = useState(0);

  // Auto-rotate slides
  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % features.length);
    }, 6000); // Slightly slower for better readability
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setIndex((prev) => (prev + 1) % features.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + features.length) % features.length);

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[650px] mt-12 flex items-center justify-center">
      {/* ─── Side Navigation Paws ─── */}
      <div className="absolute top-1/2 -translate-y-20 left-0 right-0 z-50 pointer-events-none flex justify-between px-2 md:-mx-16">
        <motion.button
          whileHover={{ scale: 1.1, x: -5, rotate: -15 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevSlide}
          aria-label="Previous slide"
          className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl border border-black/5 text-[#1A1A1A] hover:text-[var(--color-primary)] transition-colors group"
        >
          <PawPrint className="w-8 h-8 group-hover:scale-110 transition-transform -rotate-90" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1, x: 5, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextSlide}
          aria-label="Next slide"
          className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl border border-black/5 text-[#1A1A1A] hover:text-[var(--color-primary)] transition-colors group"
        >
          <PawPrint className="w-8 h-8 group-hover:scale-110 transition-transform rotate-90" />
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {[...features].map((item, i) => {
          // Calculate relative position (0 is active, 1, 2 are behind)
          const relativeIndex = (i - index + features.length) % features.length;
          const isActive = relativeIndex === 0;
          
          if (relativeIndex > 2) return null; // Only show up to 3 cards in the stack

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: 200, scale: 0.8 }}
              animate={{
                opacity: 1 - relativeIndex * 0.25,
                x: relativeIndex * 60,
                y: relativeIndex * -30,
                scale: 1 - relativeIndex * 0.08,
                zIndex: features.length - relativeIndex,
              }}
              exit={{ opacity: 0, x: -300, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className={`absolute w-full max-w-[650px] bg-white rounded-[3rem] overflow-hidden shadow-2xl p-8 md:p-10 cursor-pointer border border-white/50 ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
              onClick={isActive ? nextSlide : undefined}
            >
              {/* Image Area (Larger per User Request) */}
              <div className="w-full aspect-[16/11] rounded-[2.5rem] overflow-hidden mb-10 relative group">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#d4745c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Text Content */}
              <div className="text-left px-4">
                <h3 className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] mb-5 tracking-tight leading-tight">
                  {item.title}
                </h3>
                <p className="text-[#4A4A4A] text-lg md:text-2xl font-medium leading-relaxed opacity-95 max-w-2xl">
                  {item.description}
                </p>
              </div>

              {/* Progress Indicators (Only if active) */}
              {isActive && (
                <div className="absolute bottom-10 right-12 flex gap-3">
                  {features.map((_, dotIndex) => (
                    <div 
                      key={dotIndex}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        dotIndex === index ? 'w-10 bg-[var(--color-primary)]' : 'w-2.5 bg-black/5'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};


export const PawAdoptSection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#F5F8F2' }}>
      {/* Background Decoratives */}
      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-white opacity-20 blur-[130px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-black/[0.03] blur-[110px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 px-6 lg:px-8">
        {/* Standardized Header Area */}
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
            A Journey of Love
          </motion.div>
          
          <motion.h2
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
            }}
            className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight leading-tight"
            style={{ color: "#1A1A1A" }}
          >
            A Chapter of a <span className="text-[var(--color-primary)] relative inline-block">
              New Story
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
            className="text-lg md:text-xl font-medium italic leading-relaxed opacity-90 max-w-3xl mx-auto"
            style={{ color: "#4A4A4A" }}
          >
            "You aren't just getting a pet; you're writing a chapter of a story that starts with a second chance."
          </motion.p>
        </motion.div>

        {/* Stacked Slider Component */}
        <StackedSlider />
      </div>
    </section>
  );
};
