import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card } from "../../components/ui/Card";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "How does the adoption process work?",
      answer: "First, browse through our list of available pets. Once you find a pet you are interested in, click 'Adopt' to submit an application. The shelter will review your application, contact you for a meet-and-greet, and guide you through the final adoption steps.",
    },
    {
      question: "Is there an adoption fee?",
      answer: "Yes, most shelters charge a small adoption fee. This fee helps cover the costs of vaccinations, spaying/neutering, microchipping, and the general care of the animal while they were at the shelter.",
    },
    {
      question: "Can I adopt if I live in an apartment?",
      answer: "Absolutely! Many dogs and cats thrive in apartments. We recommend filtering for pets that are suitable for apartment living, or speaking with shelter staff to find a low-energy pet that fits your home environment.",
    },
    {
      question: "How do I contact the shelter directly?",
      answer: "You can easily message a shelter from any pet's detail page. Once logged in, click the message option on the pet profile to open a chat conversation directly with the shelter staff.",
    },
    {
      question: "What should I prepare before bringing my pet home?",
      answer: "Check out our Adoption Guide page! We have compiled an interactive checklist covering essential gear (collars, leashes), food/water bowls, beds, toys, and grooming supplies to help you prepare your home.",
    },
    {
      question: "What if the adoption doesn't work out?",
      answer: "Shelters want the transition to be successful. If you run into issues, reach out to the shelter first—many offer post-adoption behavioral support. If it's simply not a match, the shelter will work with you to return the pet safely.",
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen py-16" style={{ background: "var(--color-background)" }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex p-3 rounded-full mb-4"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-[var(--color-text)] mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-[var(--color-text-light)] max-w-lg mx-auto">
            Got questions about adopting a pet? We have got answers to the most common queries.
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Card key={index} padding="none" className="overflow-hidden">
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50/50"
                >
                  <span className="font-bold text-base text-[var(--color-text)]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div className="p-5 bg-white text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
