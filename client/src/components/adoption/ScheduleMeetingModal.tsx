import React, { useState } from "react";
import { X, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";

interface AvailabilitySlot {
  date: string;
  timeSlot: string;
  notes?: string;
}

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    _id: string;
    meetAndGreet?: {
      availabilitySlots?: AvailabilitySlot[];
    };
    pet: {
      name: string;
    };
    adopter: {
      name: string;
    };
  };
  defaultLocation?: string;
  onSchedule: (data: {
    selectedSlotIndex: number;
    specificTime?: string;
    location?: string;
    shelterNotes?: string;
  }) => void;
  isLoading?: boolean;
}

const TIME_SLOT_DISPLAY: Record<string, string> = {
  morning: '9:00 AM - 12:00 PM',
  afternoon: '12:00 PM - 3:00 PM',
  evening: '3:00 PM - 6:00 PM'
};

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  application,
  defaultLocation = '',
  onSchedule,
  isLoading = false
}: ScheduleMeetingModalProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [specificTime, setSpecificTime] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [shelterNotes, setShelterNotes] = useState('');
  const [error, setError] = useState('');

  // Update location when modal opens or defaultLocation changes
  React.useEffect(() => {
    if (isOpen) {
      setLocation(defaultLocation || '');
      setSelectedSlotIndex(null);
      setSpecificTime('');
      setShelterNotes('');
      setError('');
    }
  }, [isOpen, defaultLocation]);

  if (!isOpen) return null;

  const availabilitySlots = application.meetAndGreet?.availabilitySlots || [];

  const handleSubmit = () => {
    if (selectedSlotIndex === null) {
      setError('Please select a time slot');
      return;
    }

    onSchedule({
      selectedSlotIndex,
      specificTime: specificTime.trim() || undefined,
      location: location.trim() || undefined,
      shelterNotes: shelterNotes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule Meet & Greet</h2>
            <p className="text-sm text-gray-600 mt-1">
              {application.adopter.name} → {application.pet.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Adopter's Proposed Times */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Adopter's Proposed Availability *
            </label>
            {availabilitySlots.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                No availability slots submitted
              </div>
            ) : (
              <div className="space-y-2">
                {availabilitySlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedSlotIndex(index);
                      setError('');
                    }}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedSlotIndex === index
                        ? 'border-[var(--color-primary)] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedSlotIndex === index
                          ? 'border-[var(--color-primary)]'
                          : 'border-gray-300'
                      }`}>
                        {selectedSlotIndex === index && (
                          <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 text-gray-900 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(slot.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{TIME_SLOT_DISPLAY[slot.timeSlot] || slot.timeSlot}</span>
                          </div>
                        </div>
                        {slot.notes && (
                          <p className="text-sm text-gray-600 mt-1">{slot.notes}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specific Time (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Specific Time (Optional)
            </label>
            <input
              type="time"
              value={specificTime}
              onChange={(e) => setSpecificTime(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="e.g., 10:00 AM"
            />
            <p className="text-xs text-gray-500 mt-1">
              If not specified, the full time slot will be shown to the adopter
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Meeting Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="Enter meeting location"
              />
            </div>
          </div>

          {/* Shelter Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Internal Notes (Optional)
            </label>
            <textarea
              value={shelterNotes}
              onChange={(e) => setShelterNotes(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
              placeholder="Add any internal notes about this meeting..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || availabilitySlots.length === 0}
            className="flex-1"
          >
            {isLoading ? 'Scheduling...' : 'Confirm Schedule'}
          </Button>
        </div>
      </div>
    </div>
  );
}
