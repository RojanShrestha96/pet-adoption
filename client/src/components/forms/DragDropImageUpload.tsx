import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../common/LoadingSpinner";
interface DragDropImageUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
}
export function DragDropImageUpload({
  onUpload,
  maxFiles = 5,
  accept = "image/*",
  className = "",
}: DragDropImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const validateFiles = (newFiles: File[]): File[] => {
    setError(null);
    const validFiles: File[] = [];
    if (files.length + newFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} images`);
      return [];
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    for (const file of newFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG, GIF, and WebP images are allowed");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setError("File size must be less than 5MB");
        continue;
      }
      validFiles.push(file);
    }
    return validFiles;
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onUpload(updatedFiles);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length > 0) {
        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        onUpload(updatedFiles);
      }
    }
  };
  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onUpload(updatedFiles);
  };
  return (
    <div className={`space-y-4 ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
            : "border-gray-300 hover:border-[var(--color-primary)] hover:bg-gray-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept={accept}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`p-4 rounded-full ${
              isDragging ? "bg-[var(--color-primary)]/10" : "bg-gray-100"
            }`}
          >
            <Upload
              className={`w-8 h-8 ${
                isDragging ? "text-[var(--color-primary)]" : "text-gray-400"
              }`}
            />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports JPG, PNG, WebP (max 5MB each)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                }}
                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2">
                  <div className="bg-green-500 rounded-full p-1 shadow-sm">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
