import { motion } from "framer-motion";
import { HeartIcon, CalendarIcon, PawPrintIcon, QuoteIcon } from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { successStories } from "../../data/successStories";
import { Link } from "react-router-dom";

export function SuccessStoriesPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const getPetTypeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case "dog":
        return "info";
      case "cat":
        return "secondary";
      case "rabbit":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] transition-colors duration-300">
      <Navbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          {/* Dynamic Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] opacity-10" />
          <div className="absolute top-10 left-10 w-32 h-32 bg-[var(--color-accent)] opacity-20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[var(--color-primary)] opacity-20 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm mb-6"
                style={{ background: "var(--color-surface)" }}
              >
                <HeartIcon className="w-5 h-5 text-[var(--color-primary)]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Happy Tails
                </span>
              </div>

              <h1
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Success Stories
              </h1>
              <p
                className="text-lg md:text-xl leading-relaxed"
                style={{ color: "var(--color-text-light)" }}
              >
                Every adoption creates a beautiful story. Read about the pets
                who found their forever homes and the families whose lives
                they've changed.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section
          className="py-8 border-y"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "2,500+", label: "Pets Adopted" },
                { value: "150+", label: "Partner Shelters" },
                { value: "98%", label: "Happy Families" },
                { value: "5 Years", label: "Making Matches" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div
                    className="text-2xl md:text-3xl font-bold mb-1"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {successStories.map((story, index) => (
                <motion.div key={story.id} variants={itemVariants}>
                  <Card
                    className={`overflow-hidden border border-[var(--color-border)] ${
                      index % 2 === 0 ? "" : "md:flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`flex flex-col ${
                        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                    >
                      {/* Image Section */}
                      <div className="md:w-2/5 relative h-64 md:h-auto">
                        <img
                          src={story.petImage}
                          alt={story.petName}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge
                            variant={getPetTypeVariant(story.petType) as any}
                          >
                            {story.petType.charAt(0).toUpperCase() +
                              story.petType.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div
                        className="md:w-3/5 p-6 md:p-8 flex flex-col"
                        style={{ background: "var(--color-card)" }}
                      >
                        {/* Header */}
                        <div className="mb-4">
                          <div
                            className="flex items-center gap-2 text-sm mb-2"
                            style={{ color: "var(--color-text-light)" }}
                          >
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              Adopted{" "}
                              {new Date(story.adoptionDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <h2
                            className="text-2xl font-bold mb-1"
                            style={{ color: "var(--color-text)" }}
                          >
                            {story.petName}'s Story
                          </h2>
                          <p style={{ color: "var(--color-text-light)" }}>
                            {story.petBreed} • {story.petAge} • From{" "}
                            {story.shelterName}
                          </p>
                        </div>

                        {/* Quote */}
                        <div className="flex-1 relative">
                          <QuoteIcon
                            className="w-8 h-8 absolute -top-2 -left-2 opacity-20"
                            style={{ color: "var(--color-primary)" }}
                          />
                          <p
                            className="leading-relaxed pl-6 italic"
                            style={{ color: "var(--color-text)" }}
                          >
                            "{story.story}"
                          </p>
                        </div>

                        {/* Footer */}
                        <div
                          className="mt-6 pt-4 border-t flex items-center justify-between"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                              }}
                            >
                              <PawPrintIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div
                                className="font-medium"
                                style={{ color: "var(--color-text)" }}
                              >
                                {story.adopterName}
                              </div>
                              <div
                                className="text-sm"
                                style={{ color: "var(--color-text-light)" }}
                              >
                                Proud Pet Parent
                              </div>
                            </div>
                          </div>
                          <HeartIcon
                            className="w-6 h-6"
                            style={{ color: "var(--color-accent)" }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="p-8 md:p-12 rounded-3xl text-white text-center shadow-xl relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-x-1/3 translate-y-1/3" />

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6 backdrop-blur-sm">
                    <HeartIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Ready to Write Your Own Story?
                  </h2>
                  <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                    Thousands of loving pets are waiting for their forever
                    homes. Start your adoption journey today and become part of
                    our success stories.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/search"
                      className="inline-flex items-center justify-center px-8 py-3 bg-white font-semibold rounded-xl hover:bg-opacity-90 transition-all shadow-lg"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Find Your Pet
                    </Link>
                    <Link
                      to="/about"
                      className="inline-flex items-center justify-center px-8 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}



