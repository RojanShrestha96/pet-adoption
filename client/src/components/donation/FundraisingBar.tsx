import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface FundraisingBarProps {
  totalRaised: number;
  goalAmount: number;
}

// UX IMPROVEMENT: Fundraising Progress Bar
export function FundraisingBar({ totalRaised, goalAmount }: FundraisingBarProps) {
  const [fillPercentage, setFillPercentage] = useState(0);

  useEffect(() => {
    // Calculate percentage and cap at 100%
    const calculatedPercentage = goalAmount > 0 ? (totalRaised / goalAmount) * 100 : 0;
    const cappedPercentage = Math.min(Math.max(calculatedPercentage, 0), 100);
    
    // Slight delay to allow mount before animating
    const timeoutId = setTimeout(() => setFillPercentage(cappedPercentage), 100);
    return () => clearTimeout(timeoutId);
  }, [totalRaised, goalAmount]);

  const formatNPR = (amount: number) => {
    return amount.toLocaleString("en-IN"); 
  };

  return (
    <div className="w-full flex justify-center mb-8">
      <div className="w-full max-w-xl">
        {/* Progress Bar Container */}
        <div className="h-3 w-full bg-orange-100 rounded-full overflow-hidden mb-2 shadow-inner">
          {/* Animated Fill */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${fillPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: "var(--color-primary)" }}
          />
        </div>
        
        {/* Labels below the bar */}
        <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
          <span className="text-[var(--color-primary)] font-bold tracking-wide">
            Rs {formatNPR(totalRaised)} raised
          </span>
          <span>
            Rs {formatNPR(goalAmount)} goal
          </span>
        </div>
      </div>
    </div>
  );
}
