import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Info, TrendingUp, Shield, Activity, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface ScoreFactor {
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  explanation: string;
}

interface CompatibilityData {
  petId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: { label: string; emoji: string; color: "success" | "warning" | "error" };
  recommendation: string;
  factors: ScoreFactor[];
  isProfileComplete: boolean;
  disclaimer: string;
}

interface CompatibilityScorePanelProps {
  petId: string;
  petName: string;
}

const COLOR_MAP = {
  success: "var(--color-success, #22c55e)",
  warning: "var(--color-accent, #f4a261)",
  error: "var(--color-error, #ef4444)",
};

const FACTOR_ICONS: Record<string, React.ElementType> = {
  "Home Type Match": Shield,
  "Children Compatibility": Star,
  "Existing Pet Compatibility": Star,
  "Experience Level": TrendingUp,
  "Lifestyle Match": Activity,
  "Commitment & Responsibility": Shield,
};

function ScoreBar({
  percentage,
  color,
  animated = true,
}: {
  percentage: number;
  color: string;
  animated?: boolean;
}) {
  return (
    <div
      className="w-full h-2 rounded-full overflow-hidden"
      style={{ background: "var(--color-border)" }}
    >
      <motion.div
        className="h-2 rounded-full"
        style={{ background: color }}
        initial={animated ? { width: 0 } : { width: `${percentage}%` }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

function CircleGauge({
  percentage,
  color,
}: {
  percentage: number;
  color: string;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          {percentage}
        </span>
        <span
          className="text-xs"
          style={{ color: "var(--color-text-light)" }}
        >
          /100
        </span>
      </div>
    </div>
  );
}

export function CompatibilityScorePanel({ petId, petName }: CompatibilityScorePanelProps) {
  const [data, setData] = useState<CompatibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchScore() {
      try {
        const api = (await import("../../utils/api")).default;
        const res = await api.get(`/applications/compatibility/${petId}`);
        if (!cancelled) {
          setData(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch compatibility score:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchScore();
    return () => { cancelled = true; };
  }, [petId]);

  if (loading) {
    return (
      <div
        className="rounded-xl p-5 text-center"
        style={{ background: "var(--color-surface)" }}
      >
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin mx-auto"
          style={{
            borderColor: "var(--color-border)",
            borderTopColor: "var(--color-primary)",
          }}
        />
        <p className="text-sm mt-2" style={{ color: "var(--color-text-light)" }}>
          Calculating compatibility…
        </p>
      </div>
    );
  }

  if (!data) return null;

  const gradeColor = COLOR_MAP[data.grade.color] ?? COLOR_MAP.warning;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl overflow-hidden"
      style={{
        border: `2px solid var(--color-border)`,
        background: "var(--color-card)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ background: "var(--color-surface)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--color-primary)", opacity: 0.12 }}
        />
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 absolute"
          style={{ background: "transparent" }}
        >
          <TrendingUp
            className="w-4 h-4"
            style={{ color: "var(--color-primary)" }}
          />
        </div>
        <div className="ml-8">
          <h4
            className="font-semibold text-sm"
            style={{ color: "var(--color-text)" }}
          >
            Compatibility Score
          </h4>
          <p className="text-xs" style={{ color: "var(--color-text-light)" }}>
            Your profile vs {petName}'s needs
          </p>
        </div>
      </div>

      {/* Score summary */}
      <div className="px-5 py-5 flex items-center gap-6">
        <CircleGauge percentage={data.percentage} color={gradeColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{data.grade.emoji}</span>
            <span
              className="font-bold text-base"
              style={{ color: gradeColor }}
            >
              {data.grade.label}
            </span>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-light)" }}
          >
            {data.recommendation}
          </p>
        </div>
      </div>

      {/* Factor breakdown */}
      <div
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="px-5 py-3">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: "var(--color-text-light)" }}
          >
            Factor Breakdown
          </p>
          <div className="space-y-2">
            {data.factors.map((factor, idx) => {
              const Icon = FACTOR_ICONS[factor.label] ?? Info;
              const isExpanded = expandedFactor === idx;
              const factorColor =
                factor.percentage >= 75
                  ? COLOR_MAP.success
                  : factor.percentage >= 40
                  ? COLOR_MAP.warning
                  : COLOR_MAP.error;

              return (
                <div key={idx}>
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() =>
                      setExpandedFactor(isExpanded ? null : idx)
                    }
                  >
                    <div className="flex items-center gap-3 py-2">
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--color-text-light)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-xs font-medium truncate"
                            style={{ color: "var(--color-text)" }}
                          >
                            {factor.label}
                          </span>
                          <span
                            className="text-xs font-semibold ml-2 flex-shrink-0"
                            style={{ color: factorColor }}
                          >
                            {factor.score}/{factor.maxScore}
                          </span>
                        </div>
                        <ScoreBar percentage={factor.percentage} color={factorColor} />
                      </div>
                      <ChevronRight
                        className="w-3 h-3 flex-shrink-0 transition-transform"
                        style={{
                          color: "var(--color-text-light)",
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                        }}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p
                          className="text-xs leading-relaxed pb-3 pl-7 pr-6"
                          style={{ color: "var(--color-text-light)" }}
                        >
                          {factor.explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="px-5 py-3 border-t flex items-start gap-2"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <Info
          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
          style={{ color: "var(--color-text-light)" }}
        />
        <p className="text-xs" style={{ color: "var(--color-text-light)" }}>
          {data.disclaimer}
        </p>
      </div>
    </motion.div>
  );
}
