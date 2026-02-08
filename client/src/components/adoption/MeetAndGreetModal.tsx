import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, FileText, Check } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
interface MeetAndGreetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: MeetAndGreetData) => void;
  onComplete?: () => void;
  applicantName: string;
  petName: string;
  initialData?: Partial<MeetAndGreetData>;
}
export interface MeetAndGreetData {
  date: string;
  time: string;
  location: string;
  notes: string;
}
const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];
export function MeetAndGreetModal({
  isOpen,
  onClose,
  onConfirm,
  onComplete,
  applicantName,
  petName,
  initialData,
}: MeetAndGreetModalProps) {
  const [formData, setFormData] = useState<MeetAndGreetData>({
    date: initialData?.date || "",
    time: initialData?.time || "",
    location: initialData?.location || "",
    notes: initialData?.notes || "",
  });
  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  const handleConfirm = () => {
    onConfirm(formData);
    onClose();
  };
  const isValid = formData.date && formData.time && formData.location;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal - FIXED POSITIONING */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="w-full max-w-lg pointer-events-auto flex flex-col"
              style={{
                maxHeight: "85vh",
                background: "var(--color-card)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed at top */}
              <div
                className="flex items-center justify-between p-6 border-b flex-shrink-0"
                style={{
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: "var(--color-primary)",
                    }}
                  >
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Schedule Meet & Greet
                    </h2>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      {applicantName} wants to meet {petName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-black/5"
                  style={{
                    background: "var(--color-surface)",
                  }}
                >
                  <X
                    className="w-5 h-5"
                    style={{
                      color: "var(--color-text)",
                    }}
                  />
                </button>
              </div>

              {/* Content - Scrollable area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Date Picker */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-3"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    <Calendar
                      className="w-4 h-4"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    />
                    Select Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-card)",
                      color: "var(--color-text)",
                    }}
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-3"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    <Clock
                      className="w-4 h-4"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    />
                    Select Time *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            time: slot,
                          })
                        }
                        className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background:
                            formData.time === slot
                              ? "var(--color-primary)"
                              : "var(--color-surface)",
                          color:
                            formData.time === slot
                              ? "white"
                              : "var(--color-text)",
                          border: "2px solid",
                          borderColor:
                            formData.time === slot
                              ? "var(--color-primary)"
                              : "transparent",
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-3"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    <MapPin
                      className="w-4 h-4"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    />
                    Location *
                  </label>
                  <Input
                    placeholder="Enter meeting location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-3"
                    style={{
                      color: "var(--color-text)",
                    }}
                  >
                    <FileText
                      className="w-4 h-4"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    />
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Any special instructions or notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-card)",
                      color: "var(--color-text)",
                    }}
                  />
                </div>

                {/* Summary */}
                {isValid && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="p-4 rounded-xl"
                    style={{
                      background: "var(--color-surface)",
                    }}
                  >
                    <p
                      className="text-sm font-medium mb-2"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      📅 Scheduled for:
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      {new Date(formData.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      at {formData.time}
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      📍 {formData.location}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Footer - Sticky at bottom */}
              <div
                className="flex items-center justify-end gap-3 p-6 border-t flex-shrink-0"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-card)",
                }}
              >
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {onComplete && (
                  <Button
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700 border-green-600"
                    onClick={onComplete}
                    icon={<Check className="w-4 h-4" />}
                  >
                    Complete Meeting
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={!isValid}
                  icon={<Calendar className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
