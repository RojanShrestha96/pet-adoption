import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "../ui/Button";
export interface DeleteConfirmModalProps {
  isOpen: boolean;
  petName: string;
  onClose: () => void;
  onConfirm: () => void;
}
export function DeleteConfirmModal({
  isOpen,
  petName,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
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
              className="w-full max-w-md pointer-events-auto"
              style={{
                background: "var(--color-card)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-full flex-shrink-0"
                    style={{
                      background: "var(--color-error)",
                      opacity: 0.1,
                    }}
                  >
                    <AlertTriangle
                      className="w-6 h-6"
                      style={{
                        color: "var(--color-error)",
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h2
                      className="text-xl font-bold mb-2"
                      style={{
                        color: "var(--color-text)",
                      }}
                    >
                      Delete Pet Listing
                    </h2>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--color-text-light)",
                      }}
                    >
                      Are you sure you want to delete <strong>{petName}</strong>
                      ? This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg transition-colors hover:bg-black/5 flex-shrink-0"
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
              </div>

              {/* Warning Box */}
              <div
                className="mx-6 mb-6 p-4 rounded-xl border-2"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-error)",
                  opacity: 0.9,
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  This will permanently delete:
                </p>
                <ul
                  className="mt-2 space-y-1 text-sm"
                  style={{
                    color: "var(--color-text-light)",
                  }}
                >
                  <li>• Pet profile and photos</li>
                  <li>• All adoption applications</li>
                  <li>• Message history</li>
                  <li>• View statistics</li>
                </ul>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-end gap-3 p-6 border-t"
                style={{
                  borderColor: "var(--color-border)",
                }}
              >
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={onConfirm}
                  style={{
                    borderColor: "var(--color-error)",
                    color: "var(--color-error)",
                  }}
                >
                  Delete Pet
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
