import React from 'react';
export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}
export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  style,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  const hoverClass = hover ? 'hover:-translate-y-1 transition-all duration-200' : '';
  return <div className={`${paddingClasses[padding]} ${hoverClass} ${className}`} style={{
    background: 'var(--color-card)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
    ...style
  }} {...props}>
      {children}
    </div>;
}