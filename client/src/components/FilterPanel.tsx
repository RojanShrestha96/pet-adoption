import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PawPrint, 
  ChevronDown, 
  RotateCcw, 
  Dog, 
  Cat, 
  Rabbit, 
  Bird,
  Check,
  Heart,
  Sparkles,
  Clock,
  Crown
} from 'lucide-react';

export interface FilterOptions {
  species: string[];
  gender: string[];
  size: string[];
  age: string[];
  healthStatus: string[];
  adoptionStatus: string[];
}

export interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (category: keyof FilterOptions, values: string[]) => void;
  onReset: () => void;
}

// Filter category configuration
const filterConfig = [
  {
    key: 'species' as const,
    label: 'Species',
    icon: PawPrint,
    options: [
      { value: 'Dog', label: 'Dogs', icon: Dog },
      { value: 'Cat', label: 'Cats', icon: Cat },
      { value: 'Rabbit', label: 'Rabbits', icon: Rabbit },
      { value: 'Bird', label: 'Birds', icon: Bird },
    ]
  },
  {
    key: 'age' as const,
    label: 'Age',
    icon: Clock,
    options: [
      { value: 'Puppy/Kitten', label: 'Puppy/Kitten', icon: Sparkles },
      { value: 'Young', label: 'Young (1-3 yrs)', icon: Heart },
      { value: 'Adult', label: 'Adult (3-7 yrs)', icon: PawPrint },
      { value: 'Senior', label: 'Senior (7+ yrs)', icon: Crown },
    ]
  },
  {
    key: 'gender' as const,
    label: 'Gender',
    icon: Heart,
    options: [
      { value: 'Male', label: 'Male', icon: null },
      { value: 'Female', label: 'Female', icon: null },
    ]
  },
  {
    key: 'size' as const,
    label: 'Size',
    icon: Dog,
    options: [
      { value: 'Small', label: 'Small', icon: null },
      { value: 'Medium', label: 'Medium', icon: null },
      { value: 'Large', label: 'Large', icon: null },
    ]
  },
  {
    key: 'healthStatus' as const,
    label: 'Health',
    icon: Sparkles,
    options: [
      { value: 'healthy', label: 'Healthy', icon: null },
      { value: 'vaccinated', label: 'Vaccinated', icon: null },
      { value: 'special-needs', label: 'Special Needs', icon: null },
    ]
  },
  {
    key: 'adoptionStatus' as const,
    label: 'Status',
    icon: Check,
    options: [
      { value: 'available', label: 'Available', icon: null },
      { value: 'pending', label: 'Pending', icon: null },
    ]
  },
];

interface FilterSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, icon: Icon, isOpen, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 group"
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--color-surface)' }}
          >
            <Icon className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <span className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-[var(--color-text-light)]" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PawCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  icon?: React.ComponentType<{ className?: string }> | null;
}

function PawCheckbox({ checked, onChange, label, icon: OptionIcon }: PawCheckboxProps) {
  return (
    <motion.label
      className="flex items-center gap-3 cursor-pointer group py-2 px-3 rounded-xl transition-colors hover:bg-[var(--color-surface)]"
      whileTap={{ scale: 0.98 }}
    >
      {/* Custom Paw Checkbox */}
      <motion.div
        className="relative w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors"
        style={{
          borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
          background: checked ? 'var(--color-primary)' : 'transparent',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <PawPrint className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      
      {OptionIcon && (
        <OptionIcon 
          className="w-4 h-4 transition-colors"
          style={{ color: checked ? 'var(--color-primary)' : 'var(--color-text-light)' }}
        />
      )}
      
      <span 
        className="text-sm transition-colors"
        style={{ 
          color: checked ? 'var(--color-primary)' : 'var(--color-text)',
          fontWeight: checked ? 600 : 400
        }}
      >
        {label}
      </span>
      
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto"
        >
          <Check className="w-4 h-4 text-[var(--color-primary)]" />
        </motion.div>
      )}
    </motion.label>
  );
}

export function FilterPanel({ filters, onFilterChange, onReset }: FilterPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    species: true,
    age: true,
    gender: false,
    size: false,
    healthStatus: false,
    adoptionStatus: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOptionToggle = (category: keyof FilterOptions, value: string) => {
    const currentValues = filters[category] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(category, newValues);
  };

  const activeFilterCount = Object.values(filters).reduce(
    (acc, arr) => acc + (arr?.length || 0), 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden sticky top-24"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {/* Header */}
      <div 
        className="p-5 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-xl"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs"
                style={{ color: 'var(--color-primary)' }}
              >
                {activeFilterCount} active
              </motion.p>
            )}
          </div>
        </div>
        
        <motion.button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-surface)]"
          style={{ color: 'var(--color-text-light)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </motion.button>
      </div>

      {/* Filter Sections */}
      <div className="p-4">
        {filterConfig.map((category) => (
          <FilterSection
            key={category.key}
            title={category.label}
            icon={category.icon}
            isOpen={openSections[category.key]}
            onToggle={() => toggleSection(category.key)}
          >
            {category.options.map((option) => (
              <PawCheckbox
                key={option.value}
                checked={(filters[category.key] || []).includes(option.value)}
                onChange={() => handleOptionToggle(category.key, option.value)}
                label={option.label}
                icon={option.icon}
              />
            ))}
          </FilterSection>
        ))}
      </div>
    </motion.div>
  );
}