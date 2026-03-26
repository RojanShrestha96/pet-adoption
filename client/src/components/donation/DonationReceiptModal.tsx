import { useEffect, useRef } from "react";
import { X, Printer } from "lucide-react";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export interface DonationReceipt {
  transactionUuid: string;
  petName: string | null;
  shelterName: string | null;
  shelterAddress: string | null;
  amount: number;
  createdAt: string;
  donorName: string;
}

interface DonationReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: DonationReceipt | null;
}

// UX IMPROVEMENT: Donor receipt modal
export function DonationReceiptModal({ isOpen, onClose, receipt }: DonationReceiptModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!receipt) return null;

  const formattedDate = new Date(receipt.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 print:bg-transparent print:backdrop-blur-none"
          onClick={handleBackdropClick}
        >
          {/* Print Styles */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #receipt-modal, #receipt-modal * {
                visibility: visible;
              }
              #receipt-modal {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
                box-shadow: none !important;
                border: none !important;
              }
              .print-hide {
                display: none !important;
              }
            }
          `}</style>

          <motion.div
            id="receipt-modal"
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">PetMate</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold tracking-wide text-gray-400 uppercase">
                  Donation Receipt
                </span>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors print-hide"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Donated to</p>
                  <p className="text-base text-gray-900 font-medium">
                    {receipt.petName ? `${receipt.petName} at ` : "General Fund "} 
                    {receipt.shelterName && <span className="text-gray-600">{receipt.shelterName}</span>}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date</p>
                  <p className="text-base text-gray-900 font-medium">{formattedDate}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Donor</p>
                  <p className="text-base text-gray-900 font-medium">{receipt.donorName || "Anonymous"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Shelter Location</p>
                  <p className="text-base text-gray-900 font-medium">{receipt.shelterAddress || "N/A"}</p>
                </div>

              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Transaction ID</p>
                    <p className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                      {receipt.transactionUuid}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Amount</p>
                    <p className="text-3xl font-black text-[var(--color-primary)]">
                      Rs {receipt.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 border-t border-gray-100 text-sm text-gray-500 text-center">
              <p className="mb-2 font-medium text-gray-700">
                Thank you for helping {receipt.petName ? receipt.petName : "pets"} find a forever home.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                This receipt confirms your donation was successfully processed via eSewa.
              </p>
              
              <div className="print-hide text-center">
                <Button 
                  variant="outline" 
                  onClick={handlePrint}
                  icon={<Printer className="w-4 h-4" />}
                >
                  Download / Print
                </Button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
