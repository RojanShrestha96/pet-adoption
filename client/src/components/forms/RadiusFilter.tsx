import React from 'react';

interface RadiusFilterProps {
  radius: number | null; // null = Anywhere
  setRadius: (km: number | null) => void;
  disabled?: boolean;
}

const RADIUS_OPTIONS = [
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: 'Anywhere', value: null },
];

const RadiusFilter: React.FC<RadiusFilterProps> = ({ radius, setRadius, disabled = false }) => {
  return (
    <div className={`flex flex-wrap gap-2 items-center ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <span className="text-sm font-semibold mb-1 w-full md:w-auto md:mb-0" style={{ color: "var(--color-text-light)" }}>
        Distance:
      </span>
      <div className="flex flex-wrap gap-2">
        {RADIUS_OPTIONS.map((opt) => {
          const isSelected = radius === opt.value;
          return (
            <button
              key={opt.label}
              onClick={() => setRadius(opt.value)}
              disabled={disabled}
              className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all border-2"
              style={{
                background: isSelected ? "var(--color-primary)" : "var(--color-card)",
                color: isSelected ? "#ffffff" : "var(--color-text)",
                borderColor: isSelected ? "var(--color-primary)" : "var(--color-border)",
                boxShadow: isSelected ? "0 4px 12px rgba(99, 102, 241, 0.2)" : "none",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RadiusFilter;
