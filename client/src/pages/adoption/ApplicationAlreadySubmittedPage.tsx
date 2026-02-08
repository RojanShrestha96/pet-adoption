import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileCheck,
  ArrowRight,
  HelpCircle,
  Search,
  ChevronDown,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { mockPets } from "../../data/mockData";
export function ApplicationAlreadySubmittedPage() {
  const navigate = useNavigate();
  const { petId } = useParams();
  const pet = mockPets.find((p) => p.id === petId) || mockPets[0];
  const faqs = [
    {
      question: "Can I edit my application?",
      answer:
        "Once submitted, applications cannot be edited. If you need to make changes, please contact the shelter directly.",
    },
    {
      question: "How long does review take?",
      answer:
        "Most applications are reviewed within 3-5 business days. You'll receive email updates on your status.",
    },
    {
      question: "Can I apply for multiple pets?",
      answer:
        "Yes! You can submit applications for different pets. Each application is reviewed separately.",
    },
  ];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: "var(--color-background)",
      }}
    >
      <div className="max-w-2xl mx-auto">
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
            duration: 0.5,
          }}
          className="text-center mb-8"
        >
          {/* Success Icon */}
          <motion.div
            initial={{
              scale: 0,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              delay: 0.2,
            }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
            style={{
              background: "var(--color-secondary)",
              opacity: 0.15,
            }}
          >
            <FileCheck
              className="w-12 h-12"
              style={{
                color: "var(--color-secondary)",
              }}
            />
          </motion.div>

          <h1
            className="text-3xl font-bold mb-3"
            style={{
              color: "var(--color-text)",
            }}
          >
            Application Already Submitted! 🎉
          </h1>
          <p
            className="text-lg"
            style={{
              color: "var(--color-text-light)",
            }}
          >
            You've already submitted an application for this pet.
          </p>
        </motion.div>

        {/* Pet Card */}
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
            delay: 0.3,
          }}
        >
          <Card padding="lg" className="mb-6">
            <div className="flex items-center gap-4">
              <img
                src={pet.images[0]}
                alt={pet.name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <h3
                  className="text-xl font-bold mb-1"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  {pet.name}
                </h3>
                <p
                  className="text-sm mb-2"
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  {pet.breed} • {pet.age} • {pet.location}
                </p>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: "var(--color-accent)",
                    color: "white",
                    opacity: 0.9,
                  }}
                >
                  <span>Application Under Review</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
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
            delay: 0.4,
          }}
          className="flex flex-col gap-3 mb-8"
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight className="w-5 h-5" />}
            onClick={() => navigate("/application-tracking/1")}
          >
            View Application Status
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon={<Search className="w-5 h-5" />}
            onClick={() => navigate("/search")}
          >
            Browse Other Pets
          </Button>
        </motion.div>

        {/* FAQ Section */}
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
            delay: 0.5,
          }}
        >
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: "var(--color-primary)",
                  opacity: 0.1,
                }}
              >
                <HelpCircle
                  className="w-5 h-5"
                  style={{
                    color: "var(--color-primary)",
                  }}
                />
              </div>
              <h3
                className="text-lg font-bold"
                style={{
                  color: "var(--color-text)",
                }}
              >
                Frequently Asked Questions
              </h3>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "var(--color-surface)",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span
                      className="font-medium"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{
                        rotate: openFaq === index ? 180 : 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <ChevronDown
                        className="w-5 h-5"
                        style={{
                          color: "var(--color-text-light)",
                        }}
                      />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === index ? "auto" : 0,
                      opacity: openFaq === index ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="overflow-hidden"
                  >
                    <p
                      className="px-4 pb-4 text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.6,
          }}
          className="text-center mt-8"
        >
          <p className="text-6xl mb-4" role="img" aria-label="Celebration">
            🐾✨
          </p>
          <p
            className="text-sm"
            style={{
              color: "var(--color-text-light)",
            }}
          >
            Thank you for choosing adoption! We'll be in touch soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
}



