import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, Info, Sunrise, Sun, Sunset } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  timeSlot: 'morning' | 'afternoon' | 'evening';
  notes?: string;
}

interface AvailabilitySubmissionProps {
  onSubmit: (slots: AvailabilitySlot[]) => void;
  onCancel?: () => void;
  initialSlots?: AvailabilitySlot[];
  isLoading?: boolean;
}

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning', time: '9:00 AM - 12:00 PM', icon: Sunrise },
  { value: 'afternoon', label: 'Afternoon', time: '12:00 PM - 3:00 PM', icon: Sun },
  { value: 'evening', label: 'Evening', time: '3:00 PM - 6:00 PM', icon: Sunset }
];

export function AvailabilitySubmission({
  onSubmit,
  onCancel,
  initialSlots = [],
  isLoading = false
}: AvailabilitySubmissionProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(
    initialSlots.length > 0 ? initialSlots : [
      { date: '', timeSlot: 'morning', notes: '' },
      { date: '', timeSlot: 'afternoon', notes: '' }
    ]
  );

  const [errors, setErrors] = useState<string[]>([]);

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSlotChange = (index: number, field: keyof AvailabilitySlot, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
    setErrors([]); // Clear errors on change
  };

  const addSlot = () => {
    if (slots.length < 3) {
      setSlots([...slots, { date: '', timeSlot: 'morning', notes: '' }]);
    }
  };

  const removeSlot = (index: number) => {
    if (slots.length > 2) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const validateSlots = (): boolean => {
    const newErrors: string[] = [];

    // Check minimum 2 slots
    if (slots.length < 2) {
      newErrors.push("Please provide at least 2 availability slots");
    }

    // Check all dates are filled
    const emptyDates = slots.filter(s => !s.date);
    if (emptyDates.length > 0) {
      newErrors.push("All slots must have a date selected");
    }

    // Check dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pastDates = slots.filter(s => {
      if (!s.date) return false;
      const slotDate = new Date(s.date);
      return slotDate < today;
    });

    if (pastDates.length > 0) {
      newErrors.push("All dates must be in the future");
    }

    // Check for duplicate date+time combinations
    const combinations = slots.map(s => `${s.date}-${s.timeSlot}`);
    const duplicates = combinations.filter((item, index) => combinations.indexOf(item) !== index);
    
    if (duplicates.length > 0) {
      newErrors.push("Cannot have duplicate date and time combinations");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateSlots()) {
      // Filter out any slots without dates (shouldn't happen after validation, but safety)
      const validSlots = slots.filter(s => s.date && s.timeSlot);
      onSubmit(validSlots);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="text-lg font-bold text-gray-900">
            Submit Your Availability
          </h3>
        </div>
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            Please provide 2-3 time slots when you're available to meet the pet. The shelter will confirm one of these times.
          </p>
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Availability Slots */}
      <div className="space-y-4 mb-6">
        {slots.map((slot, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-gray-200 rounded-xl hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Slot {index + 1}</h4>
              {slots.length > 2 && (
                <button
                  onClick={() => removeSlot(index)}
                  className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  disabled={isLoading}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Date Picker */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={slot.date}
                onChange={(e) => handleSlotChange(index, 'date', e.target.value)}
                min={getMinDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Time Slot Selection */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((timeSlot) => (
                  <button
                    key={timeSlot.value}
                    onClick={() => handleSlotChange(index, 'timeSlot', timeSlot.value as any)}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      slot.timeSlot === timeSlot.value
                        ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="mb-1 flex justify-center">
                      <timeSlot.icon className="w-6 h-6" />
                    </div>
                    <div className="font-semibold text-xs">{timeSlot.label}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{timeSlot.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={slot.notes || ''}
                onChange={(e) => handleSlotChange(index, 'notes', e.target.value)}
                placeholder="Any specific preferences or information for this time slot..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Slot Button */}
      {slots.length < 3 && (
        <button
          onClick={addSlot}
          disabled={isLoading}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors flex items-center justify-center gap-2 mb-6"
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="font-medium">Add Another Time Slot</span>
        </button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          icon={<Clock className="w-4 h-4" />}
          className="flex-1"
        >
          {isLoading ? 'Submitting...' : 'Submit Availability'}
        </Button>
      </div>
    </Card>
  );
}
