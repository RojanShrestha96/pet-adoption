import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

export interface FileUploadProps {
  label: string;
  accept?: string;
  files: string[];
  onChange: (files: string[]) => void;
  maxFiles?: number;
}

export function FileUpload({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  files,
  onChange,
  maxFiles = 3
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const uploadFiles = async (fileList: FileList | File[]) => {
    if (files.length >= maxFiles) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      Array.from(fileList).forEach(file => {
        formData.append('documents', file);
      });

      const response = await api.post('/upload/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newUrls = response.data.urls;
      onChange([...files, ...newUrls].slice(0, maxFiles));
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
    }
    // Reset input so same file can be selected again if needed
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || url;
  };

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium"
        style={{
          color: 'var(--color-text)',
        }}
      >
        {label}
      </label>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept={accept}
        onChange={handleFileSelect}
      />

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all relative overflow-hidden"
        style={{
          borderColor: dragActive ? 'var(--color-primary)' : 'var(--color-border)',
          background: dragActive ? 'var(--color-surface)' : 'transparent',
        }}
      >
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-2">
                <Loader2 className="w-8 h-8 animate-spin mb-2" style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Uploading...</p>
            </div>
        ) : (
            <>
                <Upload
                className="w-8 h-8 mx-auto mb-2"
                style={{
                    color: 'var(--color-text-light)',
                }}
                />
                <p
                className="text-sm font-medium mb-1"
                style={{
                    color: 'var(--color-text)',
                }}
                >
                Click to upload or drag and drop
                </p>
                <p
                className="text-xs"
                style={{
                    color: 'var(--color-text-light)',
                }}
                >
                {accept.toUpperCase().replace(/\./g, ' ')} (Max {maxFiles} files)
                </p>
            </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  background: 'var(--color-surface)',
                }}
              >
                <File
                  className="w-5 h-5"
                  style={{
                    color: 'var(--color-primary)',
                  }}
                />
                <span
                  className="flex-1 text-sm truncate"
                  style={{
                    color: 'var(--color-text)',
                  }}
                  title={getFileName(file)}
                >
                  {getFileName(file)}
                </span>
                <CheckCircle
                  className="w-5 h-5 flex-shrink-0"
                  style={{
                    color: 'var(--color-success)',
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  <X
                    className="w-4 h-4"
                    style={{
                      color: 'var(--color-error)',
                    }}
                  />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}