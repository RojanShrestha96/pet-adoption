import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
export interface MapViewProps {
  location: string;
  className?: string;
}
export function MapView({
  location,
  className = ''
}: MapViewProps) {
  return <div className={`relative overflow-hidden ${className}`} style={{
    background: 'linear-gradient(135deg, #e8f4e8 0%, #d4e4d4 100%)',
    borderRadius: 'var(--radius-lg)'
  }}>
      {/* Map grid pattern */}
      <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: `
            linear-gradient(var(--color-secondary) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-secondary) 1px, transparent 1px)
          `,
      backgroundSize: '40px 40px'
    }} />

      {/* Roads pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 150">
        <path d="M0 75 Q50 60 100 75 T200 75" fill="none" stroke="var(--color-text-light)" strokeWidth="8" />
        <path d="M100 0 Q85 50 100 75 T100 150" fill="none" stroke="var(--color-text-light)" strokeWidth="6" />
        <path d="M0 30 L200 120" fill="none" stroke="var(--color-text-light)" strokeWidth="4" />
      </svg>

      {/* Center marker */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full animate-ping" style={{
          background: 'var(--color-primary)',
          opacity: 0.3,
          width: '60px',
          height: '60px',
          marginLeft: '-10px',
          marginTop: '-10px'
        }} />
          {/* Pin */}
          <div className="relative z-10 p-3 rounded-full shadow-lg" style={{
          background: 'var(--color-primary)'
        }}>
            <MapPin className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Location label */}
      <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl flex items-center gap-3" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: 'var(--shadow-md)'
    }}>
        <div className="p-2 rounded-lg" style={{
        background: 'var(--color-surface)'
      }}>
          <Navigation className="w-4 h-4" style={{
          color: 'var(--color-primary)'
        }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{
          color: 'var(--color-text)'
        }}>
            {location}
          </p>
          <p className="text-xs" style={{
          color: 'var(--color-text-light)'
        }}>
            Click to open in maps
          </p>
        </div>
      </div>
    </div>;
}