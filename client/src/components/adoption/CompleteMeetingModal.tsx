import { useState } from "react";
import { X, CheckCircle, AlertCircle, PartyPopper, CalendarClock, XCircle } from "lucide-react";
import { Button } from "../ui/Button";

interface CompleteMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    _id: string;
    pet: {
      name: string;
    };
    adopter: {
      name: string;
    };
  };
  onComplete: (data: { outcome: string; notes?: string }) => void;
  isLoading?: boolean;
}

const OUTCOMES = [
  {
    value: 'successful',
    label: 'Successful Match',
    description: 'The meeting went great and the adopter is a good fit',
    icon: PartyPopper,
    color: 'green'
  },
  {
    value: 'needs_followup',
    label: 'Needs Follow-up',
    description: 'Further discussion or meetings needed',
    icon: CalendarClock,
    color: 'blue'
  },
  {
    value: 'not_a_match',
    label: 'Not a Match',
    description: 'The pet and adopter are not compatible',
    icon: XCircle,
    color: 'gray'
  }
];

export function CompleteMeetingModal({
  isOpen,
  onClose,
  application,
  onComplete,
  isLoading = false
}: CompleteMeetingModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedOutcome) {
      setError('Please select an outcome');
      return;
    }

    onComplete({
      outcome: selectedOutcome,
      notes: notes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div 
          className="p-6 rounded-t-2xl text-white"
          style={{ background: "var(--color-primary)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Complete Meet & Greet</h2>
              <p className="text-white/90 mt-1">
                {application.adopter.name} met {application.pet.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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

          {/* Outcome Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Meeting Outcome *
            </label>
            <div className="space-y-3">
              {OUTCOMES.map((outcome) => (
                <button
                  key={outcome.value}
                  onClick={() => {
                    setSelectedOutcome(outcome.value);
                    setError('');
                  }}
                  disabled={isLoading}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedOutcome === outcome.value
                      ? `border-${outcome.color}-500 bg-${outcome.color}-50`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Radio Button */}
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedOutcome === outcome.value
                        ? `border-${outcome.color}-500`
                        : 'border-gray-300'
                    }`}>
                      {selectedOutcome === outcome.value && (
                        <div className={`w-3 h-3 rounded-full bg-${outcome.color}-500`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <outcome.icon className={`w-6 h-6 text-${outcome.color}-600`} />
                        <h4 className="font-bold text-gray-900">{outcome.label}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{outcome.description}</p>
                    </div>

                    {/* Check Icon */}
                    {selectedOutcome === outcome.value && (
                      <CheckCircle className={`w-6 h-6 text-${outcome.color}-600 flex-shrink-0`} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
              placeholder="Add any observations, follow-up actions, or important details from the meeting..."
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> The adopter will be notified of the meeting outcome automatically.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3 rounded-b-2xl">
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
            disabled={isLoading || !selectedOutcome}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Complete Meeting'}
          </Button>
        </div>
      </div>
    </div>
  );
}
