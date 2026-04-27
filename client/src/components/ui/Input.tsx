import React from 'react';
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date' | 'time';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  icon,
  rightElement,
  error,
  fullWidth = false,
  required = false,
  disabled = false,
  readOnly = false,
  className = '',
  onKeyDown
}: InputProps) {
  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}{' '}
          {required && <span className="text-[var(--color-primary)]">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]">
            {icon}
          </div>
        )}
        <input 
            type={type} 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange} 
            required={required} 
            disabled={disabled} 
            readOnly={readOnly}
            onKeyDown={onKeyDown}
            className={`w-full px-4 py-3 ${icon ? 'pl-12' : ''} ${rightElement ? 'pr-12' : ''} border-2 border-[var(--color-border)] rounded-xl 
            focus:outline-none focus:border-[var(--color-primary)] transition-colors
            placeholder:text-[var(--color-text-light)] text-[var(--color-text)]
            ${error ? 'border-red-400' : ''}
            ${disabled || readOnly ? 'bg-[var(--color-surface)] cursor-not-allowed opacity-70' : 'bg-[var(--color-card)]'}`} 
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}