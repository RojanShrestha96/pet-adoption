
import { Syringe, Cpu, Scissors, Bug } from 'lucide-react';

interface PetDocBadgeProps {
  isVaccinated?: boolean;
  isMicrochipped?: boolean;
  isNeutered?: boolean;
  isDewormed?: boolean;
  size?: 'sm' | 'md';
  showLabels?: boolean;
}

interface DocItem {
  key: string;
  icon: React.ElementType;
  label: string;
  status: boolean;
}

export function PetDocBadge({ 
  isVaccinated = false, 
  isMicrochipped = false, 
  isNeutered = false, 
  isDewormed = false,
  size = 'sm',
  showLabels = false
}: PetDocBadgeProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const badgeSize = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  
  const docs: DocItem[] = [
    { key: 'vaccinated', icon: Syringe, label: 'Vaccinated', status: isVaccinated },
    { key: 'microchipped', icon: Cpu, label: 'Microchipped', status: isMicrochipped },
    { key: 'neutered', icon: Scissors, label: 'Neutered/Spayed', status: isNeutered },
    { key: 'dewormed', icon: Bug, label: 'Dewormed', status: isDewormed },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {docs.map((doc) => (
        <div
          key={doc.key}
          className={`group relative ${badgeSize} rounded-full flex items-center justify-center transition-all ${
            doc.status 
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-100 text-gray-400'
          }`}
          title={`${doc.label}: ${doc.status ? 'Yes' : 'No'}`}
        >
          <doc.icon className={iconSize} />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {doc.label}: {doc.status ? '✓ Yes' : '✗ No'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      ))}
      
      {showLabels && (
        <span className="text-xs text-gray-500 ml-1">
          {docs.filter(d => d.status).length}/{docs.length} complete
        </span>
      )}
    </div>
  );
}

// Compact inline version for list views
export function PetDocBadgeInline({ 
  isVaccinated = false, 
  isMicrochipped = false, 
  isNeutered = false 
}: Pick<PetDocBadgeProps, 'isVaccinated' | 'isMicrochipped' | 'isNeutered'>) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={isVaccinated ? 'text-green-600' : 'text-gray-300'} title="Vaccinated">
        💉{isVaccinated ? '✓' : ''}
      </span>
      <span className={isMicrochipped ? 'text-green-600' : 'text-gray-300'} title="Microchipped">
        📍{isMicrochipped ? '✓' : ''}
      </span>
      <span className={isNeutered ? 'text-green-600' : 'text-gray-300'} title="Neutered">
        ✂️{isNeutered ? '✓' : ''}
      </span>
    </div>
  );
}
