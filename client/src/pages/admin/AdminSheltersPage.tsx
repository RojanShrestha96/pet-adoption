import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Eye, Building2, Mail, Phone, MapPin } from "lucide-react";
import { AdminSidebar } from "../../components/layout/AdminSidebar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
interface Shelter {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  registrationDate: string;
  status: "pending" | "approved" | "rejected";
  documents: string[];
}
export function AdminSheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([
    {
      id: "1",
      name: "Pokhara Animal Welfare",
      email: "info@pokharaanimal.org",
      phone: "+977 98-7654321",
      location: "Pokhara, Nepal",
      registrationDate: "Jan 20, 2024",
      status: "pending",
      documents: ["Registration_Certificate.pdf", "Tax_Document.pdf"],
    },
    {
      id: "2",
      name: "Chitwan Pet Sanctuary",
      email: "contact@chitwanpets.org",
      phone: "+977 98-1112233",
      location: "Chitwan, Nepal",
      registrationDate: "Jan 18, 2024",
      status: "pending",
      documents: ["License.pdf", "Proof_of_Address.pdf"],
    },
  ]);
  const handleApprove = (id: string) => {
    setShelters(
      shelters.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "approved" as const,
            }
          : s
      )
    );
    alert("Shelter approved successfully!");
  };
  const handleReject = (id: string) => {
    setShelters(
      shelters.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "rejected" as const,
            }
          : s
      )
    );
    alert("Shelter rejected.");
  };
  return (
    <div
      className="admin-layout flex min-h-screen"
      style={{
        background: "var(--color-background)",
      }}
    >
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              color: "var(--color-text)",
            }}
          >
            Verify Shelters
          </h1>
          <p
            style={{
              color: "var(--color-text-light)",
            }}
          >
            Review and approve shelter registrations
          </p>
        </div>

        <div className="space-y-6">
          {shelters.map((shelter, index) => (
            <motion.div
              key={shelter.id}
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
                delay: index * 0.1,
              }}
            >
              <Card padding="lg">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: "var(--color-secondary)",
                        opacity: 0.1,
                      }}
                    >
                      <Building2
                        className="w-8 h-8"
                        style={{
                          color: "var(--color-secondary)",
                        }}
                      />
                    </div>
                    <div>
                      <h3
                        className="text-2xl font-bold mb-2"
                        style={{
                          color: "var(--color-text)",
                        }}
                      >
                        {shelter.name}
                      </h3>
                      <div
                        className="space-y-1 text-sm"
                        style={{
                          color: "var(--color-text-light)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{shelter.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{shelter.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{shelter.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      shelter.status === "approved"
                        ? "success"
                        : shelter.status === "rejected"
                        ? "neutral"
                        : "warning"
                    }
                  >
                    {shelter.status}
                  </Badge>
                </div>

                <div className="mb-6">
                  <h4
                    className="font-semibold mb-3"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    Submitted Documents
                  </h4>
                  <div className="flex gap-3">
                    {shelter.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 rounded-lg text-sm"
                        style={{
                          background: "var(--color-surface)",
                          color: "var(--color-text)",
                        }}
                      >
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>

                {shelter.status === "pending" && (
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      icon={<Check className="w-4 h-4" />}
                      onClick={() => handleApprove(shelter.id)}
                    >
                      Approve Shelter
                    </Button>
                    <Button
                      variant="outline"
                      icon={<X className="w-4 h-4" />}
                      onClick={() => handleReject(shelter.id)}
                      style={{
                        borderColor: "var(--color-error)",
                        color: "var(--color-error)",
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      icon={<Eye className="w-4 h-4" />}
                    >
                      View Details
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}



