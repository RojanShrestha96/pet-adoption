import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint,
  Heart,
  Info,
  ShieldAlert,
  ListChecks,
  Clock,
  Sparkles,
  BookOpen,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Smile,
  Activity,
  Award,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

interface ChecklistItem {
  id: string;
  text: string;
  category: string;
}

export function AdoptionGuidePage() {
  const [activeTab, setActiveTab] = useState<"dog" | "general">("dog");
  const [expandedSection, setExpandedSection] = useState<string | null>("prep");

  // Interactive Checklists State
  const [checkedDogs, setCheckedDogs] = useState<Record<string, boolean>>({
    dog_1: false,
    dog_2: false,
    dog_3: false,
    dog_4: false,
    dog_5: false,
    dog_6: false,
  });

  const [checkedCats, setCheckedCats] = useState<Record<string, boolean>>({
    cat_1: false,
    cat_2: false,
    cat_3: false,
    cat_4: false,
    cat_5: false,
    cat_6: false,
  });

  const dogChecklist: ChecklistItem[] = [
    { id: "dog_1", text: "Sturdy collar, ID tag, and non-retractable leash", category: "Gear" },
    { id: "dog_2", text: "High-quality dog food (age-appropriate)", category: "Diet" },
    { id: "dog_3", text: "Food and water bowls (stainless steel or ceramic)", category: "Supplies" },
    { id: "dog_4", text: "Dog crate and comfortable bedding", category: "Comfort" },
    { id: "dog_5", text: "Safe chew toys (Kongs, rope toys, etc.)", category: "Play" },
    { id: "dog_6", text: "Grooming supplies (brush, dog shampoo, nail clippers)", category: "Care" },
  ];

  const catChecklist: ChecklistItem[] = [
    { id: "cat_1", text: "Litter box, scoop, and premium litter", category: "Hygiene" },
    { id: "cat_2", text: "High-quality cat food (wet and dry options)", category: "Diet" },
    { id: "cat_3", text: "Scratching post or cardboard scratchers", category: "Play" },
    { id: "cat_4", text: "Secure pet carrier for transport", category: "Gear" },
    { id: "cat_5", text: "Breakaway collar with bell and ID tag", category: "Safety" },
    { id: "cat_6", text: "Food and water bowls (placed away from litter box)", category: "Supplies" },
  ];

  // Helper calculation for checklist progress
  const getProgress = (items: ChecklistItem[], checkedState: Record<string, boolean>) => {
    const completed = items.filter(item => checkedState[item.id]).length;
    const total = items.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const dogProgress = getProgress(dogChecklist, checkedDogs);
  const catProgress = getProgress(catChecklist, checkedCats);

  const toggleDogCheck = (id: string) => {
    setCheckedDogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCatCheck = (id: string) => {
    setCheckedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  // Dog Guides data
  const dogGuides = [
    {
      id: "prep",
      title: "1. The 3-3-3 Rule",
      icon: <Clock className="w-5 h-5 text-indigo-500" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
          <p>
            The <strong>3-3-3 rule</strong> is a general guideline for the adjustment period of a newly adopted dog:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="font-bold text-indigo-700 block mb-1 text-base">First 3 Days</span>
              <p className="text-xs">
                Your dog may feel overwhelmed, scared, or shut down. They might not want to eat or play, and may hide under furniture.
              </p>
            </div>
            <div className="p-4 bg-violet-50/50 rounded-xl border border-violet-100">
              <span className="font-bold text-violet-700 block mb-1 text-base">First 3 Weeks</span>
              <p className="text-xs">
                They are starting to settle in, feeling more comfortable, and figuring out the new routine. Their true personality may begin to show.
              </p>
            </div>
            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
              <span className="font-bold text-purple-700 block mb-1 text-base">First 3 Months</span>
              <p className="text-xs">
                They feel completely secure, have built trust with you, and realize they are home. Routine is now fully established.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "diet",
      title: "2. Nutrition & Feeding Guide",
      icon: <Smile className="w-5 h-5 text-amber-500" />,
      content: (
        <div className="space-y-3 text-gray-600 text-sm">
          <p>
            A healthy diet is crucial for your dog's longevity and energy. Keep these guidelines in mind:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Feeding Schedule:</strong> Feed adult dogs twice a day (morning and evening). Puppies require 3-4 small meals.</li>
            <li><strong>Portion Control:</strong> Follow the package guide based on target weight, or consult your vet. Avoid overfeeding.</li>
            <li><strong>Water:</strong> Ensure fresh, clean water is always available in a clean bowl.</li>
          </ul>
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 mt-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-800 text-xs block">Toxic Foods Warning</strong>
              <p className="text-rose-700 text-xs">
                Never feed your dog chocolate, grapes, raisins, onions, garlic, avocado, macadamia nuts, or anything containing Xylitol.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "health",
      title: "3. Health & Preventive Care",
      icon: <Activity className="w-5 h-5 text-emerald-500" />,
      content: (
        <div className="space-y-2 text-gray-600 text-sm">
          <p>Keeping up with veterinary preventive care saves money and prevents serious illness.</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <strong>Vaccinations:</strong>
              <span className="text-gray-500">Core vaccines (Rabies, DHPP) need annual or triennial boosters.</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <strong>Parasites:</strong>
              <span className="text-gray-500">Monthly heartworm, flea, and tick preventatives are essential.</span>
            </div>
            <div className="flex justify-between pb-1">
              <strong>Exercise:</strong>
              <span className="text-gray-500">Daily walks and mental stimulation keep joints healthy and prevent destructive behavior.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "training",
      title: "4. Training & Socialization",
      icon: <Award className="w-5 h-5 text-blue-500" />,
      content: (
        <div className="space-y-2 text-gray-600 text-sm">
          <p>
            Positive reinforcement is the most effective and humane way to build a strong bond and train your dog.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Reward-Based:</strong> Use high-value treats, praise, and play to reward good behaviors instantly.</li>
            <li><strong>Consistency:</strong> Use clear, consistent command words (e.g., "sit", "stay", "come") and make sure everyone in the household uses the same.</li>
            <li><strong>Socialization:</strong> Gradually expose your dog to different people, sights, and sounds to prevent anxiety.</li>
          </ul>
        </div>
      ),
    },
  ];

  // Cat/Other Pets Guides data
  const catGuides = [
    {
      id: "cat_prep",
      title: "1. The Safe Room Decompression",
      icon: <Clock className="w-5 h-5 text-indigo-500" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
          <p>
            Cats are highly territorial and sensitive to environmental changes. Preparing a "safe room" is essential:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Start Small:</strong> Keep the cat in one quiet room (e.g., a guest bedroom or bathroom) with their supplies for the first few days to a week.</li>
            <li><strong>Hiding Spots:</strong> Provide cardboard boxes or a covered bed so they feel secure while adjusting.</li>
            <li><strong>Slow Exploration:</strong> Open up the rest of the house gradually only after they display confident behavior (eating, grooming, exploring the safe room).</li>
          </ul>
        </div>
      ),
    },
    {
      id: "cat_diet",
      title: "2. Cat Nutrition & Hydration",
      icon: <Smile className="w-5 h-5 text-amber-500" />,
      content: (
        <div className="space-y-3 text-gray-600 text-sm">
          <p>
            Cats are obligate carnivores and require specific nutrients that can only be found in animal products:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Wet vs. Dry:</strong> A combination is recommended. Wet food provides critical hydration, which helps prevent urinary tract disease.</li>
            <li><strong>Water Placement:</strong> Many cats prefer their water source placed away from their food bowl and litter box. Consider a cat water fountain.</li>
            <li><strong>Frequency:</strong> Adult cats generally do well with 2-3 structured feedings per day.</li>
          </ul>
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 mt-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-800 text-xs block">Toxic Houseplants</strong>
              <p className="text-rose-700 text-xs">
                Lilies, philodendrons, pothos, and sago palms are highly toxic to cats. Ensure your indoor environment has only pet-safe plants.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "cat_env",
      title: "3. Environmental Enrichment",
      icon: <Activity className="w-5 h-5 text-emerald-500" />,
      content: (
        <div className="space-y-2 text-gray-600 text-sm">
          <p>Boredom in indoor cats can lead to behavioral issues. Provide opportunities for natural instincts:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Vertical Space:</strong> Cats love height. Cat trees, window perches, and shelves make them feel safe and expand their territory.</li>
            <li><strong>Scratching Needs:</strong> Provide both vertical and horizontal scratching posts to satisfy claws and stretch muscles.</li>
            <li><strong>Interactive Play:</strong> Use wand toys daily to mimic hunting behaviors. Follow play with a meal.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "cat_health",
      title: "4. Litter Box & Health Care",
      icon: <Award className="w-5 h-5 text-blue-500" />,
      content: (
        <div className="space-y-2 text-gray-600 text-sm">
          <p>
            Maintain a clean litter box environment to prevent aversion behaviors and monitor health.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>The Golden Rule:</strong> Have one litter box per cat, plus one extra (e.g., 2 boxes for 1 cat), placed in quiet, low-traffic areas.</li>
            <li><strong>Cleaning Routine:</strong> Scoop the box daily and replace the litter fully every 2-4 weeks.</li>
            <li><strong>Spay/Neuter:</strong> Ensures prevention of unwanted spraying behaviors and eliminates risks of reproductive cancers.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--color-background)" }}>
      {/* Hero Header Section */}
      <div className="relative py-24 sm:py-32 overflow-hidden text-center bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeTab}
            src={
              activeTab === "dog"
                ? "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200"
                : "https://images.unsplash.com/photo-1513360309081-36f5e878fc9e?auto=format&fit=crop&q=80&w=1200"
            }
            alt="Adoption background"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        <div className="relative max-w-4xl mx-auto px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold mb-6 backdrop-blur-md"
          >
            <BookOpen className="w-4 h-4" />
            <span>PetMate Essential Guides</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight"
          >
            Pet Adoption Guide
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-white/95 max-w-2xl mx-auto font-medium"
          >
            Welcoming a pet is a life-changing experience. Our guide offers step-by-step instructions to ease the transition for both you and your new family member.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        {/* Tab Selection */}
        <div className="flex justify-center mb-10">
          <div
            className="inline-flex p-1 rounded-2xl border"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <button
              onClick={() => {
                setActiveTab("dog");
                setExpandedSection("prep");
              }}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === "dog"
                  ? "bg-[var(--color-primary)] text-white shadow-md"
                  : "text-[var(--color-text-light)] hover:text-[var(--color-text)]"
              }`}
            >
              <PawPrint className="w-4 h-4" />
              Dog & Puppy Guide
            </button>
            <button
              onClick={() => {
                setActiveTab("general");
                setExpandedSection("cat_prep");
              }}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === "general"
                  ? "bg-[var(--color-primary)] text-white shadow-md"
                  : "text-[var(--color-text-light)] hover:text-[var(--color-text)]"
              }`}
            >
              <Heart className="w-4 h-4" />
              Cat & General Pet Guide
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Interactive Preparation Checklist */}
          <div className="lg:col-span-1">
            <Card padding="lg" className="sticky top-24">
              <div className="flex items-center gap-2.5 mb-4">
                <ListChecks className="w-6 h-6 text-[var(--color-primary)]" />
                <h3 className="text-xl font-extrabold text-[var(--color-text)]">
                  Prep Checklist
                </h3>
              </div>
              <p className="text-sm text-[var(--color-text-light)] mb-6">
                Check off items as you gather supplies to prepare your home!
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-[var(--color-text)] mb-2">
                  <span>Progress</span>
                  <span>
                    {activeTab === "dog"
                      ? `${dogProgress.completed}/${dogProgress.total} Items`
                      : `${catProgress.completed}/${catProgress.total} Items`}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="bg-[var(--color-primary)] h-full"
                    animate={{
                      width: `${
                        activeTab === "dog" ? dogProgress.percentage : catProgress.percentage
                      }%`,
                    }}
                    transition={{ type: "spring", stiffness: 80 }}
                  />
                </div>
                <div className="text-right text-[10px] text-[var(--color-text-light)] mt-1">
                  {activeTab === "dog" ? dogProgress.percentage : catProgress.percentage}% Ready
                </div>
              </div>

              {/* Interactive checklist list */}
              <div className="space-y-3">
                {(activeTab === "dog" ? dogChecklist : catChecklist).map(item => {
                  const isChecked =
                    activeTab === "dog" ? checkedDogs[item.id] : checkedCats[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => (activeTab === "dog" ? toggleDogCheck(item.id) : toggleCatCheck(item.id))}
                      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all hover:bg-gray-50/50"
                      style={{
                        borderColor: isChecked ? "var(--color-primary)" : "var(--color-border)",
                        background: isChecked ? "color-mix(in srgb, var(--color-primary) 3%, transparent)" : "var(--color-card)",
                      }}
                    >
                      <div className="flex-shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] fill-[var(--color-primary)]/10" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium transition-all ${
                            isChecked ? "text-gray-400 line-through" : "text-[var(--color-text)]"
                          }`}
                        >
                          {item.text}
                        </p>
                        <span className="text-[10px] text-gray-400 capitalize bg-gray-100 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion Message */}
              <AnimatePresence>
                {((activeTab === "dog" && dogProgress.percentage === 100) ||
                  (activeTab === "general" && catProgress.percentage === 100)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center"
                  >
                    <Sparkles className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-emerald-800">You are 100% Prepared!</h4>
                    <p className="text-[10px] text-emerald-700 mt-1">
                      Your home is ready to welcome your new companion safely. Keep up the great work!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Right Column: Detailed Guides & Accordions */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-black text-[var(--color-text)] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[var(--color-primary)]" />
              Essential Topics & Tips
            </h3>

            <div className="space-y-4">
              {(activeTab === "dog" ? dogGuides : catGuides).map(guide => {
                const isOpen = expandedSection === guide.id;
                return (
                  <Card key={guide.id} padding="none" className="overflow-hidden">
                    <button
                      onClick={() => toggleSection(guide.id)}
                      className="w-full flex items-center justify-between p-5 text-left transition-all hover:bg-gray-50/50"
                    >
                      <div className="flex items-center gap-3">
                        {guide.icon}
                        <span className="font-bold text-base text-[var(--color-text)]">
                          {guide.title}
                        </span>
                      </div>
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
                          transition={{ duration: 0.3 }}
                          className="border-t"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <div className="p-5 bg-white">{guide.content}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>

            {/* General Advice Banner */}
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
              <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-blue-800">Support your Local Shelter</h4>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  Every pet has a unique history and personality. Shelters offer valuable insights into their behavioral patterns, veterinary logs, and social quirks. Don't hesitate to ask their staff for direct advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
