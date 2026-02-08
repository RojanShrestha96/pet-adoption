import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-[var(--color-primary)] opacity-80" />
      </div>
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--color-text-light)] max-w-md mb-8">{message}</p>
      {actionLabel && onAction && <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>}
    </motion.div>;
}