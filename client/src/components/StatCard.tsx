import React from 'react';
import { motion } from 'framer-motion';
import { BoxIcon } from 'lucide-react';
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: BoxIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: string;
  index?: number;
}
export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'var(--color-primary)',
  index = 0
}: StatCardProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4,
    delay: index * 0.1
  }} className="p-6 rounded-2xl" style={{
    background: 'var(--color-card)',
    boxShadow: 'var(--shadow-md)',
    borderRadius: 'var(--radius-lg)'
  }}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl" style={{
        background: color,
        opacity: 0.1
      }}>
          <Icon className="w-6 h-6" style={{
          color
        }} />
        </div>
        {trend && <div className="px-2 py-1 rounded-lg text-xs font-medium" style={{
        background: trend.isPositive ? 'var(--color-success)' : 'var(--color-error)',
        color: 'white',
        opacity: 0.9
      }}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </div>}
      </div>
      <h3 className="text-3xl font-bold mb-1" style={{
      color: 'var(--color-text)'
    }}>
        {value}
      </h3>
      <p className="text-sm" style={{
      color: 'var(--color-text-light)'
    }}>
        {title}
      </p>
    </motion.div>;
}