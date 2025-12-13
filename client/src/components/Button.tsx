import React from 'react';
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
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  icon,
  className = ''
}: ButtonProps & {
  className?: string;
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'text-white focus:ring-[var(--color-primary)] active:scale-[0.98]',
    secondary: 'text-white focus:ring-[var(--color-secondary)] active:scale-[0.98]',
    outline: 'border-2 focus:ring-[var(--color-primary)] active:scale-[0.98]',
    ghost: 'focus:ring-gray-300'
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const variantStyles = {
    primary: {
      background: 'var(--color-primary)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)'
    },
    secondary: {
      background: 'var(--color-secondary)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)'
    },
    outline: {
      borderColor: 'var(--color-primary)',
      color: 'var(--color-primary)',
      borderRadius: 'var(--radius-md)',
      background: 'transparent'
    },
    ghost: {
      color: 'var(--color-text)',
      borderRadius: 'var(--radius-md)',
      background: 'transparent'
    }
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`} style={variantStyles[variant]}>
      {icon && <span>{icon}</span>}
      {children}
    </button>;
}