import React from "react";
import { motion } from "framer-motion";
export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}
export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <div className={`flex items-center justify-between ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex-1">
        {label && (
          <p
            className="font-medium mb-1"
            style={{
              color: "var(--color-text)",
            }}
          >
            {label}
          </p>
        )}
        {description && (
          <p
            className="text-sm"
            style={{
              color: "var(--color-text-light)",
            }}
          >
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        className="relative w-12 h-6 rounded-full transition-colors"
        style={{
          background: checked ? "var(--color-primary)" : "var(--color-border)",
        }}
        disabled={disabled}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white"
          animate={{
            left: checked ? "28px" : "4px",
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    </div>
  );
}
