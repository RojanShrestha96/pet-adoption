import React from 'react';
import { Search } from 'lucide-react';
export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: () => void;
}
export function SearchBar({
  placeholder = 'Search by breed, age, size...',
  value = '',
  onChange,
  onSearch
}: SearchBarProps) {
  return <div className="relative w-full max-w-2xl">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] w-5 h-5" />
      <input type="text" placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)} onKeyPress={e => e.key === 'Enter' && onSearch?.()} className="w-full pl-14 pr-6 py-4 text-lg border-2 border-[var(--color-border)] rounded-2xl 
          focus:outline-none focus:border-[var(--color-primary)] transition-colors
          placeholder:text-[var(--color-text-light)] shadow-sm" />
    </div>;
}