import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Shield,
  PawPrint,
  CheckCircle,
  Search,
  FileText,
  Home as HomeIcon,
  Sparkles,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Building2,
} from "lucide-react";
import { Card } from "../../components/ui/Card";

export function AboutPage() {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Browse & Search",
      description: "Find your perfect companion from our database",
    },
    {
      number: "02",
      icon: Heart,
      title: "Meet & Connect",
      description: "Visit the shelter and spend time with your chosen pet",
    },
    {
      number: "03",
      icon: FileText,
      title: "Application",
      description: "Complete the adoption application form",
    },
    {
      number: "04",
      icon: HomeIcon,
      title: "Home Visit",
      description: "Quick home check to ensure a safe environment",
    },
    {
      number: "05",
      icon: CheckCircle,
      title: "Adoption Complete",
      description: "Welcome your new family member home!",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion First",
      description: "Every pet deserves love, care, and a safe home",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Building a network of caring adopters and shelters",
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Verified shelters and transparent adoption processes",
    },
  ];

  // Floating icons for hero
  const floatingIcons = [
    { left: "5%", top: "20%", Icon: Dog },
    { left: "90%", top: "15%", Icon: Cat },
    { left: "15%", top: "75%", Icon: PawPrint },
    { left: "85%", top: "70%", Icon: Heart },
    { left: "50%", top: "10%", Icon: Bird },
    { left: "70%", top: "80%", Icon: Rabbit },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: "var(--color-surface)" }}
      >
        {/* Floating pet icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingIcons.map((item, i) => {
            const IconComponent = item.Icon;
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: item.left, top: item.top }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 5 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              >
                <IconComponent
                  strokeWidth={2}
                  style={{
                    width: `${40 + (i % 3) * 12}px`,
                    height: `${40 + (i % 3) * 12}px`,
                    color: "var(--color-primary)",
                    opacity: 0.15,
                    transform: `rotate(${i * 30}deg)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
              style={{ background: "var(--color-primary)" }}
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <PawPrint className="w-10 h-10 text-white" />
            </motion.div>
            <h1
              className="text-5xl font-bold mb-6"
              style={{ color: "var(--color-text)" }}
            >
              Our Mission: Every Pet Deserves a Home
            </h1>
            <p
              className="text-xl leading-relaxed"
              style={{ color: "var(--color-text-light)" }}
            >
              PetMate is dedicated to connecting loving families with pets in
              need. We believe every animal deserves a chance at happiness, and
              every home can be enriched by the unconditional love of a pet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section with Image */}
      <section
        className="py-16"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-3xl opacity-20"
                  style={{ background: "var(--color-primary)" }}
                />
                <img
                  src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=500&fit=crop"
                  alt="Our story"
                  className="rounded-3xl shadow-2xl relative z-10"
                  style={{ boxShadow: "var(--shadow-lg)" }}
                />
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="absolute -bottom-6 -right-6 p-6 rounded-2xl z-20"
                  style={{
                    background: "var(--color-card)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles
                      className="w-8 h-8"
                      style={{ color: "var(--color-primary)" }}
                    />
                    <div>
                      <p
                        className="font-bold text-2xl"
                        style={{ color: "var(--color-text)" }}
                      >
                        2024
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        Founded
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-xl"
                  style={{ background: "var(--color-primary)" }}
                >
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-primary)" }}
                >
                  Our Journey
                </span>
              </div>
              <h2
                className="text-4xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Our Story
              </h2>
              <div
                className="space-y-4"
                style={{ color: "var(--color-text-light)" }}
              >
                <p className="text-lg leading-relaxed">
                  Founded in 2024, PetMate emerged from a simple observation:
                  countless loving pets were waiting in shelters while families
                  were searching for companions. We saw an opportunity to bridge
                  this gap through technology and compassion.
                </p>
                <p className="text-lg leading-relaxed">
                  What started as a small initiative has grown into a nationwide
                  platform, partnering with shelters to give every pet a voice
                  and every family a chance to find their perfect match.
                </p>
                <p className="text-lg leading-relaxed">
                  Today, we're proud to have facilitated hundreds of successful
                  adoptions, bringing joy to both pets and families. But our
                  work is far from over – every day, more pets need homes, and
                  we're here to make those connections happen.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: "var(--color-card)" }}
            >
              <PawPrint
                className="w-5 h-5"
                style={{ color: "var(--color-primary)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Simple Process
              </span>
            </div>
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              How It Works
            </h2>
            <p className="text-lg" style={{ color: "var(--color-text-light)" }}>
              Five simple steps to finding your perfect companion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card padding="lg" className="text-center h-full">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div
                    className="text-4xl font-bold mb-2"
                    style={{ color: "var(--color-primary)", opacity: 0.3 }}
                  >
                    {step.number}
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        className="py-16"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: "var(--color-surface)" }}
            >
              <Sparkles
                className="w-5 h-5"
                style={{ color: "var(--color-primary)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                What We Stand For
              </span>
            </div>
            <h2
              className="text-4xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="text-center p-8 rounded-2xl"
                  style={{
                    background: "var(--color-card)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
                    style={{ background: "var(--color-primary)" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <IconComponent className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3
                    className="text-2xl font-semibold mb-3"
                    style={{ color: "var(--color-text)" }}
                  >
                    {value.title}
                  </h3>
                  <p style={{ color: "var(--color-text-light)" }}>
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Shelters */}
      <section className="py-16" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: "var(--color-card)" }}
            >
              <Building2
                className="w-5 h-5"
                style={{ color: "var(--color-primary)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Our Partners
              </span>
            </div>
            <h2
              className="text-4xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Supported Shelters
            </h2>
          </div>
          <Card padding="lg">
            <p
              className="text-center mb-8"
              style={{ color: "var(--color-text-light)" }}
            >
              We're proud to partner with these amazing shelters
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Kathmandu Animal Shelter",
                "Patan Pet Rescue",
                "Bhaktapur Animal Care",
                "Valley Pet Haven",
                "Pokhara Animal Welfare",
                "Chitwan Pet Sanctuary",
              ].map((shelter, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {shelter}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Impact Stats */}
      <section
        className="py-16"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Our Impact
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "500+", label: "Successful Adoptions", icon: Heart },
              { number: "25+", label: "Partner Shelters", icon: Building2 },
              { number: "1000+", label: "Happy Families", icon: Users },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl"
                style={{
                  background: "var(--color-card)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                  style={{ background: "var(--color-primary)" }}
                  whileHover={{ scale: 1.1 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <div
                  className="text-5xl font-bold mb-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  {stat.number}
                </div>
                <div
                  className="text-lg"
                  style={{ color: "var(--color-text-light)" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}



