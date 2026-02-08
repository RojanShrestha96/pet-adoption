import { motion } from "framer-motion";
import { Calendar, MessageSquare, Eye } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
export interface Application {
  id: string;
  applicantName: string;
  petName: string;
  petImage: string;
  dateSubmitted: string;
  status: "submitted" | "under-review" | "approved" | "rejected" | "meet-greet";
}
export interface ApplicationCardProps {
  application: Application;
  onView: () => void;
  onMessage: () => void;
  index?: number;
}
export function ApplicationCard({
  application,
  onView,
  onMessage,
  index = 0,
}: ApplicationCardProps) {
  const statusConfig = {
    submitted: {
      variant: "info" as const,
      label: "Submitted",
    },
    "under-review": {
      variant: "warning" as const,
      label: "Under Review",
    },
    approved: {
      variant: "success" as const,
      label: "Approved",
    },
    rejected: {
      variant: "neutral" as const,
      label: "Rejected",
    },
    "meet-greet": {
      variant: "info" as const,
      label: "Meet & Greet",
    },
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
      }}
      className="p-6 rounded-2xl"
      style={{
        background: "var(--color-card)",
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div className="flex items-start gap-4">
        {/* Pet Image */}
        <img
          src={application.petImage}
          alt={application.petName}
          className="w-20 h-20 rounded-xl object-cover"
        />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3
                className="font-semibold text-lg mb-1"
                style={{
                  color: "var(--color-text)",
                }}
              >
                {application.applicantName}
              </h3>
              <p
                className="text-sm"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                Wants to adopt{" "}
                <span
                  style={{
                    color: "var(--color-primary)",
                  }}
                >
                  {application.petName}
                </span>
              </p>
            </div>
            <Badge variant={statusConfig[application.status].variant}>
              {statusConfig[application.status].label}
            </Badge>
          </div>

          <div
            className="flex items-center gap-4 mb-4 text-sm"
            style={{
              color: "var(--color-text-light)",
            }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{application.dateSubmitted}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              onClick={onView}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<MessageSquare className="w-4 h-4" />}
              onClick={onMessage}
            >
              Message
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
