import React, { useState } from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** SVG paw print icon used for the hover effect */
const PawIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    style={style}
    aria-hidden="true"
  >
    {/* Main pad */}
    <ellipse cx="32" cy="46" rx="14" ry="11" fill="currentColor" />
    {/* Four toe beans */}
    <ellipse cx="14" cy="34" rx="6" ry="8" fill="currentColor" />
    <ellipse cx="26" cy="26" rx="6" ry="8" fill="currentColor" />
    <ellipse cx="38" cy="26" rx="6" ry="8" fill="currentColor" />
    <ellipse cx="50" cy="34" rx="6" ry="8" fill="currentColor" />
  </svg>
);

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  icon,
  className = '',
  style = {},
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]';

  const variants = {
    primary:   'text-white focus:ring-[var(--color-primary)] hover:shadow-lg hover:brightness-110',
    secondary: 'text-white focus:ring-[var(--color-secondary)] hover:shadow-lg hover:brightness-110',
    outline:   'border-2 focus:ring-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:shadow-md',
    ghost:     'focus:ring-gray-300 hover:bg-[var(--color-surface)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background:   'var(--color-primary)',
      borderRadius: 'var(--radius-md)',
      boxShadow:    'var(--shadow-sm)',
    },
    secondary: {
      background:   'var(--color-secondary)',
      borderRadius: 'var(--radius-md)',
      boxShadow:    'var(--shadow-sm)',
    },
    outline: {
      borderColor:  'var(--color-primary)',
      color:        'var(--color-primary)',
      borderRadius: 'var(--radius-md)',
      background:   'transparent',
    },
    ghost: {
      color:        'var(--color-text)',
      borderRadius: 'var(--radius-md)',
      background:   'transparent',
    },
  };

  // Paw colour adapts to variant so it's always visible
  const pawColor =
    variant === 'outline' || variant === 'ghost'
      ? 'var(--color-primary)'
      : 'rgba(255,255,255,0.55)';

  // Three paws with different positions + animation delays
  const paws: Array<{ bottom: string; left: string; delay: string; rotate: string }> = [
    { bottom: '100%', left: '15%',  delay: '0s',    rotate: '-15deg' },
    { bottom: '95%',  left: '50%',  delay: '0.08s', rotate: '5deg'   },
    { bottom: '100%', left: '75%',  delay: '0.16s', rotate: '20deg'  },
  ];

  const widthClass    = fullWidth ? 'w-full' : '';
  const disabledClass = disabled  ? 'opacity-50 cursor-not-allowed' : '';
  const mergedStyle   = { ...variantStyles[variant], position: 'relative' as const, overflow: 'visible' as const, ...style };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
      style={mergedStyle}
    >
      {/* Floating paw prints on hover */}
      {hovered && paws.map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position:    'absolute',
            bottom:      p.bottom,
            left:        p.left,
            width:       size === 'lg' ? '18px' : size === 'sm' ? '12px' : '15px',
            height:      size === 'lg' ? '18px' : size === 'sm' ? '12px' : '15px',
            color:       pawColor,
            pointerEvents: 'none',
            animation:   `petPawFloat 0.7s ease-out ${p.delay} both`,
            transform:   `rotate(${p.rotate})`,
            zIndex:      10,
          }}
        >
          <PawIcon />
        </span>
      ))}

      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}