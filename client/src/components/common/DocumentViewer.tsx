import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Download, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "../ui/Button";
interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    url: string;
    type: string;
    name: string;
  } | null;
  onVerify?: () => void;
  isVerified?: boolean;
}
export function DocumentViewer({
  isOpen,
  onClose,
  document,
  onVerify,
  isVerified = false,
}: DocumentViewerProps) {
  if (!document) return null;
  const isImage = document.type.startsWith("image/");
  const isPDF = document.type === "application/pdf";
  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{document.name}</h3>
                    <p className="text-xs text-gray-500 uppercase">
                      {document.type.split("/")[1]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={document.url}
                    download
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-gray-50 overflow-auto flex items-center justify-center p-4">
                {isImage ? (
                  <img
                    src={document.url}
                    alt={document.name}
                    className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                  />
                ) : isPDF ? (
                  <iframe
                    src={document.url}
                    className="w-full h-full rounded-lg shadow-lg bg-white"
                    title={document.name}
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Preview not available for this file type
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.open(document.url, "_blank")}
                      icon={<ExternalLink className="w-4 h-4" />}
                    >
                      Open in New Tab
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              {onVerify && (
                <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                  <Button variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                  {isVerified ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Verified
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={onVerify}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Verify Document
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
