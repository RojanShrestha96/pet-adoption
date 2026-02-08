import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
interface PasswordStrengthIndicatorProps {
  password: string;
}
export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const checks = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number",
      valid: /[0-9]/.test(password),
    },
  ];
  const passedChecks = checks.filter((c) => c.valid).length;
  const getStrength = () => {
    if (passedChecks <= 1)
      return {
        label: "Weak",
        color: "#EF4444",
        width: "25%",
      };
    if (passedChecks <= 2)
      return {
        label: "Fair",
        color: "#F59E0B",
        width: "50%",
      };
    if (passedChecks <= 3)
      return {
        label: "Good",
        color: "#3B82F6",
        width: "75%",
      };
    return {
      label: "Strong",
      color: "#10B981",
      width: "100%",
    };
  };
  const strength = getStrength();
  if (!password) return null;
  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-light)]">
          Password strength
        </span>
        <span
          className="font-medium"
          style={{
            color: strength.color,
          }}
        >
          {strength.label}
        </span>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: strength.color,
          }}
          initial={{
            width: 0,
          }}
          animate={{
            width: strength.width,
          }}
          transition={{
            duration: 0.3,
          }}
        />
      </div>

      <div className="space-y-1">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {check.valid ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-gray-400" />
            )}
            <span className={check.valid ? "text-green-600" : "text-gray-400"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
