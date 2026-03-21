import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Eye,
  BellRing,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

interface AlertItem {
  id: string;
  type: "overdue_pending" | "overdue_reviewing" | "upcoming_meet_greet";
  priority: "critical" | "warning" | "info";
  petName: string;
  applicantName: string;
  createdAt?: string;
  scheduledDate?: string;
  daysElapsed?: number;
}

interface PriorityAlerts {
  critical: AlertItem[];
  warning: AlertItem[];
  info: AlertItem[];
  totalCount: number;
}

interface PriorityAlertsPanelProps {
  alerts: PriorityAlerts;
}

const priorityConfig = {
  critical: {
    label: "Critical",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: "text-red-500",
    dot: "bg-red-500",
    ring: "ring-red-200",
  },
  warning: {
    label: "Needs Attention",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    icon: "text-amber-500",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  info: {
    label: "Upcoming",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "text-blue-500",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
  },
};

const typeLabels: Record<string, string> = {
  overdue_pending: "Pending review > 3 days",
  overdue_reviewing: "Under review > 2 days",
  upcoming_meet_greet: "Meet & Greet in < 24h",
};

function AlertCard({ alert }: { alert: AlertItem }) {
  const config = priorityConfig[alert.priority];

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${config.bg} ${config.border} group`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot} animate-pulse`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm truncate">{alert.petName}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${config.badge}`}
          >
            {typeLabels[alert.type]}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-500 truncate">{alert.applicantName}</span>
          {alert.daysElapsed !== undefined && alert.daysElapsed > 0 && (
            <span className="text-xs flex items-center gap-0.5 text-gray-400">
              <Clock className="w-3 h-3" />
              {alert.daysElapsed}d elapsed
            </span>
          )}
          {alert.scheduledDate && (
            <span className="text-xs flex items-center gap-0.5 text-blue-500">
              <Calendar className="w-3 h-3" />
              {new Date(alert.scheduledDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
      <Link
        to={`/shelter/applications/${alert.id}`}
        className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] bg-white hover:bg-gray-50 border border-gray-200 hover:border-[var(--color-primary)] px-2.5 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
      >
        <Eye className="w-3 h-3" />
        Review
      </Link>
    </div>
  );
}

export function PriorityAlertsPanel({ alerts }: PriorityAlertsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (alerts.totalCount === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-green-800 text-sm">All Clear!</p>
          <p className="text-xs text-green-600">No urgent items require attention right now.</p>
        </div>
      </div>
    );
  }

  const allAlerts = [
    ...alerts.critical.map((a) => ({ ...a, priority: "critical" as const })),
    ...alerts.warning.map((a) => ({ ...a, priority: "warning" as const })),
    ...alerts.info.map((a) => ({ ...a, priority: "info" as const })),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
            <BellRing className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 text-sm">Priority Alerts</h3>
            <p className="text-xs text-gray-500">
              {alerts.critical.length > 0 && (
                <span className="text-red-600 font-medium">{alerts.critical.length} critical</span>
              )}
              {alerts.critical.length > 0 && alerts.warning.length > 0 && " · "}
              {alerts.warning.length > 0 && (
                <span className="text-amber-600 font-medium">{alerts.warning.length} warning</span>
              )}
              {(alerts.critical.length > 0 || alerts.warning.length > 0) &&
                alerts.info.length > 0 &&
                " · "}
              {alerts.info.length > 0 && (
                <span className="text-blue-600 font-medium">{alerts.info.length} upcoming</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {alerts.totalCount}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Alert Items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
              {allAlerts.map((alert) => (
                <AlertCard key={`${alert.id}-${alert.type}`} alert={alert} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
