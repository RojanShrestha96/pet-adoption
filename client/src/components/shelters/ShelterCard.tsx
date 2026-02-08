import React from "react";
import { motion } from "framer-motion";
import { MapPin, PawPrint, ArrowRight } from "lucide-react";
import { Card } from "../ui/Card";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import type { Shelter } from "../data/mockData";

export interface ShelterCardProps {
  shelter: Shelter;
}

export function ShelterCard({ shelter }: ShelterCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card
        padding="none"
        hover
        className="overflow-hidden h-full flex flex-col"
      >
        {/* Image with overlay */}
        <div className="relative overflow-hidden">
          {shelter.image ? (
            <img
              src={shelter.image}
              alt={shelter.name}
              className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-40 flex items-center justify-center transition-transform duration-300 hover:scale-105"
              style={{
                background: "var(--color-primary)",
                opacity: 0.9,
              }}
            >
              <span className="text-4xl font-bold text-white tracking-wider">
                {shelter.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)",
            }}
          />
          {/* Pets available badge */}
          <div className="absolute bottom-3 left-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "var(--color-primary)",
                color: "white",
              }}
            >
              <PawPrint className="w-3.5 h-3.5" />
              {shelter.petsAvailable} pets
            </div>
          </div>
          {/* Distance badge */}
          <div className="absolute top-3 right-3">
            <div
              className="px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
              style={{
                background: "rgba(255,255,255,0.9)",
                color: "var(--color-text)",
              }}
            >
              {shelter.distance}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3
            className="text-lg font-semibold mb-1 line-clamp-1"
            style={{ color: "var(--color-text)" }}
          >
            {shelter.name}
          </h3>

          <div
            className="flex items-center gap-1.5 text-sm mb-4"
            style={{ color: "var(--color-text-light)" }}
          >
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{shelter.location}</span>
          </div>

          {/* View Profile Button */}
          <div className="mt-auto">
            <Link to={`/shelter/${shelter.id}`}>
              <Button
                variant="outline"
                fullWidth
                size="sm"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
