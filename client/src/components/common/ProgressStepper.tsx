import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
export interface Step {
  title: string;
  description?: string;
  icon?: React.ElementType;
}
interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}
export function ProgressStepper({
  steps,
  currentStep,
  className = ''
}: ProgressStepperProps) {
  return <div className={`w-full ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0">
          <motion.div className="h-full bg-[var(--color-primary)] rounded-full" initial={{
          width: '0%'
        }} animate={{
          width: `${currentStep / (steps.length - 1) * 100}%`
        }} transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }} />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const StepIcon = step.icon;
        return <div key={index} className="relative z-10 flex flex-col items-center">
              <motion.div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isCompleted ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : isCurrent ? 'bg-white border-[var(--color-primary)] text-[var(--color-primary)]' : 'bg-white border-gray-300 text-gray-400'}`} initial={false} animate={{
            scale: isCurrent ? 1.1 : 1
          }}>
                {isCompleted ? <Check className="w-5 h-5" /> : StepIcon ? <StepIcon className="w-5 h-5" /> : <span className="text-sm font-bold">{index + 1}</span>}
              </motion.div>

              <div className="absolute top-12 w-32 text-center hidden md:block">
                <p className={`text-sm font-medium transition-colors duration-300 ${isCurrent || isCompleted ? 'text-[var(--color-text)]' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                {step.description && <p className="text-xs text-[var(--color-text-light)] mt-0.5">
                    {step.description}
                  </p>}
              </div>
            </div>;
      })}
      </div>

      {/* Mobile Labels (Current Step Only) */}
      <div className="md:hidden mt-4 text-center">
        <p className="text-sm font-bold text-[var(--color-text)]">
          {steps[currentStep].title}
        </p>
        <p className="text-xs text-[var(--color-text-light)]">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>;
}