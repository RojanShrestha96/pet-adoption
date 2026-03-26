import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart, Quote, PawPrint } from 'lucide-react';
import { SuccessStory } from '../../data/successStories';

interface Props {
  stories: SuccessStory[];
}

// Clamp helper
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function SuccessStoriesCarousel({ stories }: Props) {
  const [active, setActive] = useState(0);

  const go = useCallback(
    (delta: number) => {
      setActive((prev) => mod(prev + delta, stories.length));
    },
    [stories.length]
  );

  // Auto-advance every 6s
  useEffect(() => {
    const t = setTimeout(() => go(1), 6000);
    return () => clearTimeout(t);
  }, [active, go]);

  // Visible indices: previous, active, next
  const prev = mod(active - 1, stories.length);
  const next = mod(active + 1, stories.length);

  const getCardState = (idx: number): 'left' | 'center' | 'right' | 'hidden' => {
    if (idx === active) return 'center';
    if (idx === prev)   return 'left';
    if (idx === next)   return 'right';
    return 'hidden';
  };

  return (
    <div className="relative w-full">
      {/* ─── Side Navigation Paws ─── */}
      <div className="absolute top-1/2 -translate-y-20 left-0 right-0 z-50 pointer-events-none flex justify-between px-2 md:-mx-16">
        <motion.button
          whileHover={{ scale: 1.1, x: -5, rotate: -15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => go(-1)}
          aria-label="Previous story"
          className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl border border-black/5 text-[#1A1A1A] hover:text-[var(--color-primary)] transition-colors group"
        >
          <PawPrint className="w-8 h-8 group-hover:scale-110 transition-transform -rotate-90" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1, x: 5, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => go(1)}
          aria-label="Next story"
          className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl border border-black/5 text-[#1A1A1A] hover:text-[var(--color-primary)] transition-colors group"
        >
          <PawPrint className="w-8 h-8 group-hover:scale-110 transition-transform rotate-90" />
        </motion.button>
      </div>

      {/* Cards viewport */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 520, perspective: 1200 }}
      >
        {stories.map((story, idx) => {
          const state = getCardState(idx);
          if (state === 'hidden') return null;

          const isCenter = state === 'center';
          const isLeft   = state === 'left';

          return (
            <motion.div
              key={story.id}
              onClick={() => {
                if (isLeft)  go(-1);
                if (state === 'right') go(1);
              }}
              style={{
                position:  'absolute',
                width:     isCenter ? 420 : 320,
                zIndex:    isCenter ? 10 : 4,
                cursor:    isCenter ? 'default' : 'pointer',
              }}
              animate={{
                x:       isCenter ? 0 : isLeft ? -370 : 370,
                scale:   isCenter ? 1 : 0.82,
                opacity: isCenter ? 1 : 0.55,
                rotateY: isCenter ? 0 : isLeft ? 6 : -6,
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              whileHover={!isCenter ? { opacity: 0.75, scale: 0.85 } : {}}
            >
              <StoryCard story={story} isCenter={isCenter} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Individual story card ─── */
function StoryCard({ story, isCenter }: { story: SuccessStory; isCenter: boolean }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      whileHover={isCenter ? { y: -6 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        borderRadius:    24,
        overflow:        'hidden',
        background:      'var(--color-card)',
        boxShadow:       isCenter
          ? '0 20px 48px rgba(212,116,92,0.18), 0 4px 16px rgba(0,0,0,0.07)'
          : '0 4px 16px rgba(0,0,0,0.06)',
        border:          isCenter ? '1.5px solid rgba(212,116,92,0.18)' : '1px solid var(--color-border)',
      }}
    >
      {/* Pet image — full bleed */}
      <div
        style={{
          position: 'relative',
          height:   isCenter ? 240 : 190,
          overflow: 'hidden',
        }}
      >
        {!imgLoaded && (
          <div
            style={{
              position:   'absolute',
              inset:      0,
              background: 'var(--color-surface)',
              animation:  'pulse 1.5s ease-in-out infinite',
            }}
          />
        )}
        <img
          src={story.petImage}
          alt={story.petName}
          onLoad={() => setImgLoaded(true)}
          style={{
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            transition: 'transform 0.5s ease',
            display:    'block',
          }}
        />
        {/* Warm gradient overlay */}
        <div
          style={{
            position:   'absolute',
            inset:      0,
            background: 'linear-gradient(to top, rgba(30,15,5,0.62) 0%, transparent 55%)',
          }}
        />

        {/* Pet name badge + optional heart */}
        <div
          style={{
            position: 'absolute',
            bottom:   16,
            left:     16,
            right:    16,
            display:  'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: isCenter ? 20 : 16, lineHeight: 1.2 }}>
              {story.petName}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 }}>
              {story.petBreed}
            </p>
          </div>
          {isCenter && (
            <div
              style={{
                width:      34,
                height:     34,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(6px)',
                display:    'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Heart className="w-4 h-4" style={{ color: '#ff8c7a' }} />
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: isCenter ? '20px 22px 22px' : '16px 16px 18px' }}>
        {/* Quote mark + text */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <Quote
            style={{
              width:     18,
              height:    18,
              color:     'var(--color-primary)',
              opacity:   0.55,
              flexShrink: 0,
              marginTop: 2,
            }}
          />
          <p
            style={{
              color:      'var(--color-text)',
              fontSize:   isCenter ? 14.5 : 13,
              lineHeight: 1.65,
              fontStyle:  'italic',
              fontWeight: 450,
            }}
          >
            {story.quote}
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            height:     1,
            background: 'var(--color-border)',
            margin:     '0 0 14px',
          }}
        />

        {/* Owner row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={story.ownerImage}
              alt={story.adopterName}
              style={{
                width:        isCenter ? 36 : 30,
                height:       isCenter ? 36 : 30,
                borderRadius: '50%',
                objectFit:    'cover',
                border:       '2px solid var(--color-border)',
                flexShrink:   0,
              }}
            />
            <div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize:   isCenter ? 13 : 11.5,
                  color:      'var(--color-text)',
                  lineHeight: 1.3,
                }}
              >
                {story.adopterName}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-light)', lineHeight: 1.3 }}>
                Adopted {story.petName}
              </p>
            </div>
          </div>

          {isCenter && (
            <div
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        4,
                color:      'var(--color-text-light)',
                fontSize:   11,
              }}
            >
              <MapPin style={{ width: 11, height: 11 }} />
              <span>{story.location}</span>
            </div>
          )}
        </div>

        {/* Adoption date chip — center only */}
        {isCenter && (
          <div
            style={{
              marginTop:   12,
              display:     'inline-flex',
              alignItems:  'center',
              gap:         5,
              padding:     '3px 10px',
              borderRadius: 20,
              background:  'var(--color-surface)',
              fontSize:    11,
              color:       'var(--color-text-light)',
            }}
          >
            <span>🐾</span>
            <span>Adopted {story.adoptionDate}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
