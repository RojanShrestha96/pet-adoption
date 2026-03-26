import React from "react";
import { formatAddress } from "../../utils/formatters";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { FavouriteButton } from "./FavouriteButton";
import type { Pet } from "../../data/mockData";
export interface PetCardProps {
  pet: Pet;
  index?: number;
  variant?: "default" | "compact";
  showLocation?: boolean;
}
export function PetCard({ 
  pet, 
  index = 0, 
  variant = "default",
  showLocation = true 
}: PetCardProps) {
  const healthVariant = {
    healthy: "success" as const,
    "special-needs": "warning" as const,
    vaccinated: "info" as const,
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
        delay: index * 0.1,
      }}
    >
      <Link to={`/pet/${(pet as any)._id || pet.id}`}>
        <Card
          padding="none"
          hover
          className="overflow-hidden cursor-pointer group"
        >
          <div className="relative overflow-hidden">
            <img
              src={pet.images[0]}
              alt={pet.name}
              className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                variant === "compact" ? "h-48" : "h-64"
              }`}
            />
            <div className="absolute top-4 right-4">
              <FavouriteButton petId={(pet as any)._id || pet.id} />
            </div>
            {pet.adoptionStatus === "pending" && (
              <div className="absolute top-4 left-4">
                <Badge variant="warning">Pending</Badge>
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3
                  className="text-xl font-semibold mb-1"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  {pet.name}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  {pet.breed}
                </p>
              </div>
              <Badge variant={healthVariant[pet.healthStatus]}>
                {pet.healthStatus === "special-needs"
                  ? "Special Needs"
                  : pet.healthStatus}
              </Badge>
            </div>

            <div
              className="flex items-center gap-4 text-sm mb-4"
              style={{
                color: "var(--color-text-light)",
              }}
            >
              <span>{pet.age}</span>
              <span>•</span>
              <span className="capitalize">{pet.size}</span>
              <span>•</span>
              <span className="capitalize">{pet.gender}</span>
            </div>

            {showLocation && (
              <div
                className="flex items-center gap-2 text-sm mb-4"
                style={{
                  color: "var(--color-text-light)",
                }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {pet.distanceKm !== undefined 
                    ? (pet.distanceKm < 0.1 
                        ? `Nearby • ${pet.shelter?.name || 'Shelter'}` 
                        : pet.distanceKm < 1 
                          ? `< 1 km away • ${pet.shelter?.name || 'Shelter'}`
                          : `${pet.distanceKm} km away • ${pet.shelter?.name || 'Shelter'}`)
                    : formatAddress(pet.location)
                  }
                </span>
              </div>
            )}

            <Button variant="primary" fullWidth size="sm">
              View Details
            </Button>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
