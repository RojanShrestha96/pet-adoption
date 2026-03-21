
import { motion } from 'framer-motion';
import { Check, Clock, Calendar, Heart, XCircle } from 'lucide-react';

export type ApplicationStatus = 'submitted' | 'under-review' | 'approved' | 'meet-greet' | 'follow-up' | 'follow-up-completed' | 'adopted' | 'rejected' | 'closed';

export interface ApplicationTimelineProps {
  currentStatus: ApplicationStatus;
  isRejected?: boolean; // For rejected status styling
  hasFollowUp?: boolean; // NEW: indicates if follow-up was triggered
  meetingOutcome?: 'successful' | 'needs_followup' | 'not_a_match'; // NEW
  actualStatus?: string; // Backend status to infer which steps were completed
}
export function ApplicationTimeline({
  currentStatus,
  isRejected = false,
  hasFollowUp = false,
  meetingOutcome,
  actualStatus
}: ApplicationTimelineProps) {
  
  // Dynamic step builder - conditionally constructs timeline based on application journey
  const buildTimelineSteps = () => {
    // Rejected flow - show only steps that occurred, then rejection + closed
    if (isRejected) {
      const steps = [
        { key: 'submitted', label: 'Submitted', icon: Clock },
      ];

      // Infer which steps were completed based on actualStatus
      // Only add steps that logically occurred before rejection
      const statusOrder = ['pending', 'reviewing', 'approved', 'availability_submitted', 'meeting_scheduled', 'meeting_completed'];
      const rejectedAtIndex = actualStatus ? statusOrder.indexOf(actualStatus) : 0;

      // Add steps that occurred before rejection
      if (rejectedAtIndex >= 1 || actualStatus === 'reviewing') {
        steps.push({ key: 'under-review', label: 'Under Review', icon: Check });
      }
      if (rejectedAtIndex >= 2 || ['approved', 'availability_submitted', 'meeting_scheduled', 'meeting_completed'].includes(actualStatus || '')) {
        steps.push({ key: 'approved', label: 'Approved', icon: Calendar });
      }
      if (['availability_submitted', 'meeting_scheduled', 'meeting_completed'].includes(actualStatus || '')) {
        steps.push({ key: 'approved', label: 'Availability Requested', icon: Calendar });
      }
      if (['meeting_scheduled', 'meeting_completed'].includes(actualStatus || '')) {
        steps.push({ key: 'meet-greet', label: 'Meet & Greet', icon: Check });
      }

      // Add terminal steps
      steps.push(
        { key: 'rejected', label: 'Not Selected', icon: XCircle },
        { key: 'closed', label: 'Application Closed', icon: XCircle }
      );

      return steps;
    }

    // Base steps for all applications
    const baseSteps = [
      { key: 'submitted', label: 'Submitted', icon: Clock },
      { key: 'under-review', label: 'Under Review', icon: Check },
      { key: 'approved', label: 'Availability Requested', icon: Calendar },
      { key: 'meet-greet', label: 'Meet & Greet', icon: Check },
    ];

    // Conditionally add follow-up steps ONLY if follow-up was triggered
    if (hasFollowUp || meetingOutcome === 'needs_followup') {
      baseSteps.push(
        { key: 'follow-up', label: 'Follow-Up', icon: Clock },
        { key: 'follow-up-completed', label: 'Follow-Up Complete', icon: Check }
      );
    }

    // Add final step
    baseSteps.push({ key: 'adopted', label: 'Adopted', icon: Heart });

    return baseSteps;
  };

  const steps = buildTimelineSteps();
  
  const currentIndex = steps.findIndex(s => s.key === currentStatus);
  return <div className="relative">
      {/* Progress Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{
      background: 'var(--color-border)'
    }} />
      <motion.div className="absolute left-6 top-0 w-0.5" style={{
      background: isRejected && currentIndex === steps.length - 1 ? '#EF4444' : 'var(--color-primary)'
    }} initial={{
      height: 0
    }} animate={{
      height: `${currentIndex / (steps.length - 1) * 100}%`
    }} transition={{
      duration: 0.8,
      ease: 'easeOut'
    }} />

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isRejectedStep = isRejected && step.key === 'rejected';
        const Icon = step.icon;
        
        return <motion.div key={step.key} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.4,
          delay: index * 0.1
        }} className="relative flex items-center gap-4">
              {/* Icon */}
              <motion.div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center" style={{
            background: isRejectedStep 
              ? '#EF4444' 
              : isCompleted ? 'var(--color-primary)' : 'var(--color-surface)',
            color: isRejectedStep || isCompleted ? 'white' : 'var(--color-text-light)'
          }} animate={{
            scale: isCurrent ? [1, 1.1, 1] : 1
          }} transition={{
            duration: 0.5,
            repeat: isCurrent ? Infinity : 0,
            repeatDelay: 1
          }}>
                <Icon className="w-6 h-6" />
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <h4 className="font-semibold mb-1" style={{
              color: isRejectedStep ? '#DC2626' : isCompleted ? 'var(--color-text)' : 'var(--color-text-light)'
            }}>
                  {step.label}
                </h4>
                {isCurrent && !isRejectedStep && <p className="text-sm" style={{
              color: 'var(--color-primary)'
            }}>
                    Current step
                  </p>}
                {isRejectedStep && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded mt-1">
                    Application Closed
                  </span>
                )}
              </div>
            </motion.div>;
      })}
      </div>
    </div>;
}