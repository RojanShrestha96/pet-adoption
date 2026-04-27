import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  className?: string;
  inputClassName?: string;
  style?: React.CSSProperties;
}

export function SearchBar({
  placeholder = 'Search by breed, age, size...',
  value = '',
  onChange,
  onSearch,
  onClear,
  className = "relative w-full max-w-2xl",
  inputClassName = "w-full pl-14 pr-12 py-4 text-lg border-2 border-[var(--color-border)] rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-[var(--color-text-light)] shadow-sm",
  style
}: SearchBarProps) {
  return (
    <div className={className}>
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] w-5 h-5" />
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value} 
        onChange={e => onChange?.(e.target.value)} 
        onKeyPress={e => e.key === 'Enter' && onSearch?.()} 
        className={inputClassName}
        style={style}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[var(--color-text-light)]" />
        </button>
      )}
    </div>
  );
}