import React, { useState } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Mock file upload
    addFile();
  };
  const addFile = () => {
    if (files.length < maxFiles) {
      onChange([...files, `document-${files.length + 1}.pdf`]);
    }
  };
  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };
  return <div className="space-y-3">
      <label className="block text-sm font-medium" style={{
      color: 'var(--color-text)'
    }}>
        {label}
      </label>

      {/* Upload Area */}
      <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={addFile} className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all" style={{
      borderColor: dragActive ? 'var(--color-primary)' : 'var(--color-border)',
      background: dragActive ? 'var(--color-surface)' : 'transparent'
    }}>
        <Upload className="w-8 h-8 mx-auto mb-2" style={{
        color: 'var(--color-text-light)'
      }} />
        <p className="text-sm font-medium mb-1" style={{
        color: 'var(--color-text)'
      }}>
          Click to upload or drag and drop
        </p>
        <p className="text-xs" style={{
        color: 'var(--color-text-light)'
      }}>
          {accept.toUpperCase()} (Max {maxFiles} files)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && <div className="space-y-2">
          <AnimatePresence>
            {files.map((file, index) => <motion.div key={index} initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} className="flex items-center gap-3 p-3 rounded-lg" style={{
          background: 'var(--color-surface)'
        }}>
                <File className="w-5 h-5" style={{
            color: 'var(--color-primary)'
          }} />
                <span className="flex-1 text-sm" style={{
            color: 'var(--color-text)'
          }}>
                  {file}
                </span>
                <CheckCircle className="w-5 h-5" style={{
            color: 'var(--color-success)'
          }} />
                <button onClick={e => {
            e.stopPropagation();
            removeFile(index);
          }} className="p-1 rounded-lg hover:bg-red-50 transition-colors">
                  <X className="w-4 h-4" style={{
              color: 'var(--color-error)'
            }} />
                </button>
              </motion.div>)}
          </AnimatePresence>
        </div>}
    </div>;
}