import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";

export interface DeleteConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConversationModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConversationModalProps) {
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
                    style={{ background: "#ef4444", opacity: 0.15 }}
                  >
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h2
                      className="text-xl font-bold mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      Delete Conversation
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      Are you sure you want to delete this conversation? This
                      action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg transition-colors hover:bg-black/5 flex-shrink-0"
                    style={{ background: "var(--color-surface)" }}
                  >
                    <X
                      className="w-5 h-5"
                      style={{ color: "var(--color-text)" }}
                    />
                  </button>
                </div>
              </div>

              {/* Warning Box */}
              <div
                className="mx-6 mb-6 p-4 rounded-xl border-2"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "#ef4444",
                  opacity: 0.9,
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  This will permanently delete:
                </p>
                <ul
                  className="mt-2 space-y-1 text-sm"
                  style={{ color: "var(--color-text-light)" }}
                >
                  <li>• All messages in this conversation</li>
                  <li>• Chat history with this user</li>
                  <li>• This action cannot be reversed</li>
                </ul>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-end gap-3 p-6 border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={onConfirm}
                  className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Delete Conversation
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
