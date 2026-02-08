
import { motion } from 'framer-motion';
import { Search, Heart, FileText, Home, CheckCircle } from 'lucide-react';
const steps = [{
  icon: Search,
  title: 'Browse & Search',
  description: 'Find your perfect companion from our database'
}, {
  icon: Heart,
  title: 'Meet & Connect',
  description: 'Visit the shelter and spend time with your chosen pet'
}, {
  icon: FileText,
  title: 'Application',
  description: 'Complete the adoption application form'
}, {
  icon: Home,
  title: 'Home Visit',
  description: 'Quick home check to ensure a safe environment'
}, {
  icon: CheckCircle,
  title: 'Adoption Complete',
  description: 'Welcome your new family member home!'
}];
export function AdoptionSteps() {
  return <div className="space-y-6">
      <h3 className="text-2xl font-bold" style={{
      color: 'var(--color-text)'
    }}>
        Adoption Process
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => <motion.div key={index} initial={{
        opacity: 0,
        x: -20
      }} whileInView={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: index * 0.1
      }} viewport={{
        once: true
      }} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{
          background: 'var(--color-primary)',
          color: 'white'
        }}>
              <step.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1" style={{
            color: 'var(--color-text)'
          }}>
                {index + 1}. {step.title}
              </h4>
              <p className="text-sm" style={{
            color: 'var(--color-text-light)'
          }}>
                {step.description}
              </p>
            </div>
          </motion.div>)}
      </div>
    </div>;
}