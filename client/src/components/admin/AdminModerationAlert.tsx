import { motion } from "framer-motion";
import { AlertTriangle, Building2, PawPrint, ArrowRight, CheckCircle2 } from "lucide-react";

interface AdminModerationAlertProps {
  pendingShelters: number;
  pendingPets: number;
  onViewShelters: () => void;
  onViewPets: () => void;
}

export function AdminModerationAlert({
  pendingShelters,
  pendingPets,
  onViewShelters,
  onViewPets,
}: AdminModerationAlertProps) {
  const hasAlerts = pendingShelters > 0 || pendingPets > 0;

  if (!hasAlerts) {
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-3 border"
        style={{
          background: "rgba(34, 197, 94, 0.1)",
          borderColor: "rgba(34, 197, 94, 0.25)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(34, 197, 94, 0.15)" }}
        >
          <CheckCircle2 className="w-5 h-5" style={{ color: "#22c55e" }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "#22c55e" }}>All Clear!</p>
          <p className="text-xs" style={{ color: "var(--color-text-light)" }}>
            No pending items require moderation right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border"
      style={{
        background: "var(--color-card)",
        borderColor: "rgba(245, 158, 11, 0.35)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 border-b"
        style={{
          background: "rgba(245, 158, 11, 0.1)",
          borderColor: "rgba(245, 158, 11, 0.2)",
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(245, 158, 11, 0.15)" }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: "#f59e0b" }} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>
            Moderation Required
          </h3>
          <p className="text-xs" style={{ color: "var(--color-text-light)" }}>
            {[
              pendingShelters > 0 && `${pendingShelters} shelter${pendingShelters !== 1 ? "s" : ""} awaiting verification`,
              pendingPets > 0 && `${pendingPets} pet${pendingPets !== 1 ? "s" : ""} pending review`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <span
          className="text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center"
          style={{ background: "#f59e0b" }}
        >
          {pendingShelters + pendingPets}
        </span>
      </div>

      {/* Alert Items */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {pendingShelters > 0 && (
          <button
            onClick={onViewShelters}
            className="flex items-center gap-3 p-3 rounded-xl text-left group transition-all"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(245, 158, 11, 0.15)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(245, 158, 11, 0.08)")}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(245, 158, 11, 0.15)" }}
            >
              <Building2 className="w-4 h-4" style={{ color: "#f59e0b" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                {pendingShelters} Shelter{pendingShelters !== 1 ? "s" : ""} Pending
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-light)" }}>
                Awaiting verification review
              </p>
            </div>
            <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "#f59e0b" }} />
          </button>
        )}

        {pendingPets > 0 && (
          <button
            onClick={onViewPets}
            className="flex items-center gap-3 p-3 rounded-xl text-left group transition-all"
            style={{
              background: "rgba(249, 115, 22, 0.08)",
              border: "1px solid rgba(249, 115, 22, 0.2)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(249, 115, 22, 0.15)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(249, 115, 22, 0.08)")}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(249, 115, 22, 0.15)" }}
            >
              <PawPrint className="w-4 h-4" style={{ color: "#f97316" }} />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                  {pendingPets} Pet{pendingPets !== 1 ? "s" : ""} Pending Review
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-light)" }}>
                  Awaiting approval to publish
                </p>
              </div>
              <span className="text-xs font-bold flex items-center gap-1 group-hover:underline transition-all" style={{ color: "#f97316" }}>
                Review Pets <ArrowRight className="w-3 h-3 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </button>
        )}
      </div>
    </motion.div>
  );
}
