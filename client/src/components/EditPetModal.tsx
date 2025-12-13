import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { ToggleSwitch } from './ToggleSwitch';
import { ImageUpload } from './ImageUpload';
export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  weight: string;
  description: string;
  adoptionStatus: string;
  images: string[];
}
export interface EditPetModalProps {
  pet: Pet;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pet: Pet) => void;
}
export function EditPetModal({
  pet,
  isOpen,
  onClose,
  onSave
}: EditPetModalProps) {
  const [formData, setFormData] = useState(pet);
  const [images, setImages] = useState(pet.images);
  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  const handleSave = () => {
    onSave({
      ...formData,
      images
    });
    onClose();
  };
  return <AnimatePresence>
      {isOpen && <>
          {/* Backdrop with blur */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="fixed inset-0 z-50" style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }} />

          {/* Modal - FIXED POSITIONING */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }} transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30
        }} className="w-full max-w-4xl pointer-events-auto flex flex-col" style={{
          maxHeight: '85vh',
          background: 'var(--color-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }} onClick={e => e.stopPropagation()}>
              {/* Header - Fixed at top */}
              <div className="flex items-center justify-between p-6 border-b flex-shrink-0" style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)'
          }}>
                <h2 className="text-2xl font-bold" style={{
              color: 'var(--color-text)'
            }}>
                  Edit Pet Details
                </h2>
                <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-black/5" style={{
              background: 'var(--color-surface)'
            }}>
                  <X className="w-5 h-5" style={{
                color: 'var(--color-text)'
              }} />
                </button>
              </div>

              {/* Content - Scrollable area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Images */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{
                color: 'var(--color-text)'
              }}>
                    Pet Photos
                  </h3>
                  <ImageUpload images={images} onChange={setImages} maxImages={5} />
                </div>

                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{
                color: 'var(--color-text)'
              }}>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Pet Name" value={formData.name} onChange={e => setFormData({
                  ...formData,
                  name: e.target.value
                })} fullWidth />
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{
                    color: 'var(--color-text)'
                  }}>
                        Species
                      </label>
                      <select className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors" style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-card)',
                    color: 'var(--color-text)'
                  }} value={formData.species} onChange={e => setFormData({
                    ...formData,
                    species: e.target.value
                  })}>
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="bird">Bird</option>
                        <option value="rabbit">Rabbit</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Input label="Breed" value={formData.breed} onChange={e => setFormData({
                  ...formData,
                  breed: e.target.value
                })} fullWidth />
                    <Input label="Age" value={formData.age} onChange={e => setFormData({
                  ...formData,
                  age: e.target.value
                })} fullWidth />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{
                    color: 'var(--color-text)'
                  }}>
                        Gender
                      </label>
                      <select className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors" style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-card)',
                    color: 'var(--color-text)'
                  }} value={formData.gender} onChange={e => setFormData({
                    ...formData,
                    gender: e.target.value
                  })}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <Input label="Weight" value={formData.weight} onChange={e => setFormData({
                  ...formData,
                  weight: e.target.value
                })} fullWidth />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{
                color: 'var(--color-text)'
              }}>
                    Description
                  </label>
                  <textarea className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors" style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-card)',
                color: 'var(--color-text)'
              }} rows={4} value={formData.description} onChange={e => setFormData({
                ...formData,
                description: e.target.value
              })} />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{
                color: 'var(--color-text)'
              }}>
                    Adoption Status
                  </label>
                  <select className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors" style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-card)',
                color: 'var(--color-text)'
              }} value={formData.adoptionStatus} onChange={e => setFormData({
                ...formData,
                adoptionStatus: e.target.value
              })}>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="adopted">Adopted</option>
                  </select>
                </div>
              </div>

              {/* Footer - Sticky at bottom */}
              <div className="flex items-center justify-end gap-3 p-6 border-t flex-shrink-0" style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)'
          }}>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        </>}
    </AnimatePresence>;
}