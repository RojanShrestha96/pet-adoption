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
    meetAndGreet?: {
      followUpCount?: number;
    };
  };
  onComplete: (data: { 
    outcome: string; 
    rejectionReason?: string;
    customReason?: string;
    followUpDate?: string;
    followUpNotes?: string;
    internalNotes?: string;
  }) => void;
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

const REJECTION_REASONS = [
  { value: 'home_not_suitable', label: 'Home environment not suitable' },
  { value: 'energy_mismatch', label: 'Energy level mismatch' },
  { value: 'behavioral_concerns', label: 'Behavioral concerns during interaction' },
  { value: 'expectations_mismatch', label: 'Adopter expectations mismatch' },
  { value: 'compatibility_issue', label: 'Family or pet compatibility issue' },
  { value: 'adopter_withdrew', label: 'Adopter withdrew interest' },
  { value: 'other', label: 'Other (please specify)' }
];

export function CompleteMeetingModal({
  isOpen,
  onClose,
  application,
  onComplete,
  isLoading = false
}: CompleteMeetingModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [error, setError] = useState('');

  const followUpCount = application.meetAndGreet?.followUpCount || 0;
  const maxFollowUpsReached = followUpCount >= 2;

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedOutcome) {
      setError('Please select an outcome');
      return;
    }

    // Validate rejection reason
    if (selectedOutcome === 'not_a_match') {
      if (!rejectionReason) {
        setError('Please select a rejection reason');
        return;
      }
      if (rejectionReason === 'other' && !customReason.trim()) {
        setError('Please specify the reason');
        return;
      }
    }

    // Validate follow-up date
    if (selectedOutcome === 'needs_followup' && !followUpDate) {
      setError('Please select a follow-up date');
      return;
    }

    onComplete({
      outcome: selectedOutcome,
      rejectionReason: selectedOutcome === 'not_a_match' ? rejectionReason : undefined,
      customReason: selectedOutcome === 'not_a_match' && rejectionReason === 'other' ? customReason : undefined,
      followUpDate: selectedOutcome === 'needs_followup' ? followUpDate : undefined,
      followUpNotes: selectedOutcome === 'needs_followup' ? followUpNotes : undefined,
      internalNotes: internalNotes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Max Follow-ups Warning */}
          {maxFollowUpsReached && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Maximum Follow-ups Reached</p>
                <p className="text-sm text-amber-700 mt-1">
                  This application has already had 2 follow-ups. You must select "Successful Match" or "Not a Match".
                </p>
              </div>
            </div>
          )}

          {/* Outcome Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Meeting Outcome *
            </label>
            <div className="space-y-3">
              {OUTCOMES.map((outcome) => {
                const isDisabled = maxFollowUpsReached && outcome.value === 'needs_followup';
                return (
                <button
                  key={outcome.value}
                  onClick={() => {
                    if (!isDisabled) {
                      setSelectedOutcome(outcome.value);
                      setError('');
                    }
                  }}
                  disabled={isLoading || isDisabled}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isDisabled
                      ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                      : selectedOutcome === outcome.value
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
                );
              })}
            </div>
          </div>

          {/* Rejection Reason (conditional) */}
          {selectedOutcome === 'not_a_match' && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Rejection Reason * <span className="text-xs font-normal text-gray-500">(Internal only)</span>
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  <option value="">Select a reason...</option>
                  {REJECTION_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Reason (if "Other" selected) */}
              {rejectionReason === 'other' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Please Specify *
                  </label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value);
                      setError('');
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="Describe the specific reason..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Follow-up Date (conditional) */}
          {selectedOutcome === 'needs_followup' && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Follow-up Required By *
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => {
                    setFollowUpDate(e.target.value);
                    setError('');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Follow-up Notes (Optional)
                </label>
                <textarea
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                  placeholder="What needs to be discussed or verified?"
                />
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Internal Notes <span className="text-xs font-normal text-gray-500">(Never shown to adopter)</span>
            </label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
              placeholder="Add internal observations, staff notes, or sensitive information..."
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> The adopter will receive a professional notification. Internal notes and rejection reasons are never shared.
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
