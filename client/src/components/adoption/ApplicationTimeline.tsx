
import { motion } from 'framer-motion';
import { Check, Clock, Calendar, Heart, XCircle, FileSignature } from 'lucide-react';

export type ApplicationStatus = 'submitted' | 'under-review' | 'approved' | 'meet-greet' | 'follow-up' | 'follow-up-completed' | 'finalize' | 'finalized' | 'adopted' | 'rejected' | 'closed';

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
         // Avoid duplicate 'approved' label
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

    // Add Finalize step
    baseSteps.push({ key: 'finalize', label: 'Finalization', icon: FileSignature });

    // Add Finalized step (Contract Signed)
    baseSteps.push({ key: 'finalized', label: 'Finalized', icon: Check });

    // Add final step
    baseSteps.push({ key: 'adopted', label: 'Adopted', icon: Heart });

    return baseSteps;
  };

  const steps = buildTimelineSteps();
  
  const currentIndex = steps.findIndex(s => s.key === currentStatus);

  return (
    <div className="relative w-full pb-4">
      <div className="relative px-2 sm:px-4">
        {/* Progress Line Background */}
        <div 
          className="absolute top-6 left-10 right-10 h-1 rounded-full" 
          style={{ background: 'var(--color-border)' }} 
        />
        {/* Progress Line Fill */}
        <motion.div 
          className="absolute top-6 left-10 h-1 rounded-full origin-left" 
          style={{ background: isRejected ? '#EF4444' : 'var(--color-primary)' }} 
          initial={{ width: 0 }} 
          animate={{ width: `${(currentIndex / Math.max(1, steps.length - 1)) * 100}%` }} 
          transition={{ duration: 0.8, ease: 'easeOut' }} 
        />

        {/* Steps */}
        <div className="flex justify-between relative z-10 w-full">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isRejectedStep = isRejected && (step.key === 'rejected' || step.key === 'closed');
            const Icon = step.icon;
            // Highlight current step distinctively
            const ringClass = isCurrent && !isRejectedStep ? 'ring-4 ring-[var(--color-primary)]/20 ring-offset-2' : '';
            const upcomingStyle = !isCompleted && !isRejectedStep;

            return (
              <motion.div 
                key={step.key} 
                className={`flex flex-col items-center text-center flex-1 min-w-0 ${upcomingStyle ? 'opacity-60' : 'opacity-100'}`}
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: upcomingStyle ? 0.6 : 1, y: 0 }} 
                transition={{ duration: 0.4, delay: index * 0.1 }} 
              >
                {/* Icon */}
                <motion.div 
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative bg-white transition-shadow shrink-0 ${ringClass}`} 
                  style={{
                    background: isRejectedStep && isCompleted
                      ? '#EF4444' 
                      : isCompleted ? 'var(--color-primary)' : 'white',
                    color: (isRejectedStep && isCompleted) || isCompleted ? 'white' : 'var(--color-text-light)',
                    border: upcomingStyle ? '2px dashed var(--color-border)' : 'none'
                  }} 
                  animate={isCurrent ? { scale: [1, 1.05, 1] } : { scale: 1 }} 
                  transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 1 }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>

                {/* Content */}
                <div className="mt-2 sm:mt-3 px-1">
                  <h4 
                    className="text-[10px] sm:text-xs font-bold leading-tight" 
                    style={{ color: isRejectedStep && isCompleted ? '#DC2626' : isCurrent ? 'var(--color-primary)' : isCompleted ? 'var(--color-text)' : 'var(--color-text-light)' }}
                  >
                    {step.label}
                  </h4>
                  {isCurrent && !isRejectedStep && (
                    <p className="hidden sm:block text-[9px] sm:text-[10px] uppercase tracking-wider font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                      In Progress
                    </p>
                  )}
                  {isRejectedStep && isCompleted && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase bg-red-100 text-red-700 rounded mt-1">
                      Closed
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>

  );
}