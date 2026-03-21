import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  PawPrint,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import api from "../../utils/api";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "info" | "neutral" | "error" }> = {
  pending: { label: "Pending", variant: "warning" },
  reviewing: { label: "In Review", variant: "info" },
  approved: { label: "Approved", variant: "success" },
  availability_submitted: { label: "Availability Submitted", variant: "info" },
  meeting_scheduled: { label: "Meeting Scheduled", variant: "info" },
  meeting_completed: { label: "Meeting Complete", variant: "success" },
  follow_up_required: { label: "Follow-Up Required", variant: "warning" },
  follow_up_scheduled: { label: "Follow-Up Scheduled", variant: "info" },
  rejected: { label: "Not Selected", variant: "error" },
  completed: { label: "Adopted", variant: "success" },
};

interface Application {
  _id: string;
  pet: {
    _id: string;
    name: string;
    images: string[];
    species: string;
    breed: string;
  };
  status: string;
  createdAt: string;
}

export function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applications/adopter/my-applications");
      setApplications(res.data.applications || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Applications
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchApplications}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Applications
        </h1>
        <p className="text-gray-500">
          Track the status of your adoption requests
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title="No applications yet"
          message="You haven't submitted any adoption applications yet."
          actionLabel="Browse Pets"
          onAction={() => navigate("/search")}
        />
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => {
            const status = statusConfig[app.status] || {
              label: app.status,
              variant: "neutral",
            };
            
            return (
              <Card
                key={app._id}
                className="p-6 transition-all hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Image */}
                  <img
                    src={app.pet?.images?.[0] || "/placeholder-pet.png"}
                    alt={app.pet?.name}
                    className="w-24 h-24 rounded-xl object-cover bg-gray-100"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {app.pet?.name || "Unknown Pet"}
                      </h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <PawPrint className="w-4 h-4" />
                        {app.pet?.breed || "Unknown Breed"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Submitted {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <Link to={`/application-tracking/${app._id}`}>
                    <Button variant="outline" className="group">
                      View Status
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
