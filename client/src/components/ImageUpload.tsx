import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}
export function ImageUpload({
  images,
  onChange,
  maxImages = 5
}: ImageUploadProps) {
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
    // In a real app, handle file upload here
  };
  const addImage = () => {
    // Mock adding an image
    const mockImages = ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop'];
    const newImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    if (images.length < maxImages) {
      onChange([...images, newImage]);
    }
  };
  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };
  return <div className="space-y-4">
      {/* Upload Area */}
      <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={addImage} className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all" style={{
      borderColor: dragActive ? 'var(--color-primary)' : 'var(--color-border)',
      background: dragActive ? 'var(--color-surface)' : 'var(--color-card)'
    }}>
        <Upload className="w-12 h-12 mx-auto mb-4" style={{
        color: 'var(--color-text-light)'
      }} />
        <p className="font-medium mb-1" style={{
        color: 'var(--color-text)'
      }}>
          Click to upload or drag and drop
        </p>
        <p className="text-sm" style={{
        color: 'var(--color-text-light)'
      }}>
          PNG, JPG up to 10MB (Max {maxImages} images)
        </p>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {images.map((image, index) => <motion.div key={index} initial={{
          opacity: 0,
          scale: 0.8
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.8
        }} className="relative aspect-square rounded-xl overflow-hidden group" style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)'
        }}>
                <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                <button onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{
            background: 'rgba(0, 0, 0, 0.7)'
          }}>
                  <X className="w-4 h-4 text-white" />
                </button>
                {index === 0 && <div className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium" style={{
            background: 'var(--color-primary)',
            color: 'white'
          }}>
                    Primary
                  </div>}
              </motion.div>)}
          </AnimatePresence>
        </div>}
    </div>;
}