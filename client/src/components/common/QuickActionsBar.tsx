import { Link } from "react-router-dom";
import { Plus, ClipboardList, Calendar, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  {
    to: "/shelter/add-pet",
    icon: Plus,
    label: "Add Pet",
    description: "Register a new pet",
    color: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/15",
    border: "border-[var(--color-primary)]/20",
  },
  {
    to: "/shelter/applications",
    icon: ClipboardList,
    label: "Review Applications",
    description: "Manage pending apps",
    color: "text-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-100",
  },
  {
    to: "/shelter/meet-greet",
    icon: Calendar,
    label: "Meet & Greet",
    description: "Schedule meetings",
    color: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100",
    border: "border-amber-100",
  },
  {
    to: "/shelter/manage-pets",
    icon: BarChart2,
    label: "Manage Pets",
    description: "View & edit listings",
    color: "text-violet-600",
    bg: "bg-violet-50 hover:bg-violet-100",
    border: "border-violet-100",
  },
];

export function QuickActionsBar() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
        >
          <Link
            to={action.to}
            className={`flex items-center gap-3 p-3.5 rounded-xl border ${action.bg} ${action.border} transition-all hover:shadow-md hover:-translate-y-0.5 group`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${action.bg} border ${action.border}`}
            >
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${action.color} truncate`}>{action.label}</p>
              <p className="text-xs text-gray-500 truncate hidden sm:block">{action.description}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
