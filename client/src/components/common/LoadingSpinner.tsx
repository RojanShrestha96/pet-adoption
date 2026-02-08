import React from 'react';
import { motion } from 'framer-motion';
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  label?: string;
  className?: string;
}
export function LoadingSpinner({
  size = 'md',
  color = 'var(--color-primary)',
  label,
  className = ''
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  };
  return <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <motion.div className={`rounded-full border-t-transparent ${sizes[size]}`} style={{
      borderColor: color,
      borderTopColor: 'transparent'
    }} animate={{
      rotate: 360
    }} transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }} />
      {label && <p className="text-sm font-medium text-[var(--color-text-light)]">
          {label}
        </p>}
    </div>;
}