
import { motion } from 'framer-motion';
import { Check, Clock, Calendar, Heart } from 'lucide-react';
export type ApplicationStatus = 'submitted' | 'under-review' | 'approved' | 'meet-greet' | 'adopted';
export interface ApplicationTimelineProps {
  currentStatus: ApplicationStatus;
}
export function ApplicationTimeline({
  currentStatus
}: ApplicationTimelineProps) {
  const steps = [{
    key: 'submitted',
    label: 'Submitted',
    icon: Clock
  }, {
    key: 'under-review',
    label: 'Under Review',
    icon: Check
  }, {
    key: 'approved',
    label: 'Approved',
    icon: Check
  }, {
    key: 'meet-greet',
    label: 'Meet & Greet',
    icon: Calendar
  }, {
    key: 'adopted',
    label: 'Adopted',
    icon: Heart
  }];
  const currentIndex = steps.findIndex(s => s.key === currentStatus);
  return <div className="relative">
      {/* Progress Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{
      background: 'var(--color-border)'
    }} />
      <motion.div className="absolute left-6 top-0 w-0.5" style={{
      background: 'var(--color-primary)'
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
            background: isCompleted ? 'var(--color-primary)' : 'var(--color-surface)',
            color: isCompleted ? 'white' : 'var(--color-text-light)'
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
              color: isCompleted ? 'var(--color-text)' : 'var(--color-text-light)'
            }}>
                  {step.label}
                </h4>
                {isCurrent && <p className="text-sm" style={{
              color: 'var(--color-primary)'
            }}>
                    Current step
                  </p>}
              </div>
            </motion.div>;
      })}
      </div>
    </div>;
}