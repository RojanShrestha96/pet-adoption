
import { Syringe, Cpu, Scissors, Bug, Clock, CheckCircle, XCircle, Info } from 'lucide-react';

interface PetDocBadgeProps {
  isVaccinated?: boolean;
  vaccinationStatus?: string;
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
  status: boolean | string;
  colorClass?: string;
}

export function PetDocBadge({ 
  isVaccinated = false,
  vaccinationStatus,
  isMicrochipped = false, 
  isNeutered = false, 
  isDewormed = false,
  size = 'sm',
  showLabels = false
}: PetDocBadgeProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const badgeSize = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  
  // Normalize vaccination status
  const vStatus = vaccinationStatus || (isVaccinated ? 'fully-vaccinated' : 'unknown');
  
  const getVaccineColor = (status: string) => {
    switch (status) {
      case 'fully-vaccinated': return 'bg-green-100 text-green-600';
      case 'partially-vaccinated': return 'bg-amber-100 text-amber-600';
      case 'not-vaccinated': return 'bg-red-100 text-red-500';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const getVaccineLabel = (status: string) => {
    switch (status) {
      case 'fully-vaccinated': return 'Fully Vaccinated';
      case 'partially-vaccinated': return 'Partially Vaccinated';
      case 'not-vaccinated': return 'Not Vaccinated';
      default: return 'Vaccination Unknown';
    }
  };

  const docs = [
    { 
      key: 'vaccinated', 
      icon: Syringe, 
      label: getVaccineLabel(vStatus), 
      status: vStatus !== 'not-vaccinated' && vStatus !== 'unknown',
      colorOverride: getVaccineColor(vStatus)
    },
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
            doc.colorOverride 
              ? doc.colorOverride
              : doc.status 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
          }`}
        >
          <doc.icon className={iconSize} />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
            {doc.label}: {typeof doc.status === 'boolean' ? (doc.status ? '✓ Yes' : '✗ No') : doc.status}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      ))}
      
      {showLabels && (
        <span className="text-xs text-gray-500 ml-1">
          {docs.filter(d => d.status && d.status !== 'unknown' && d.status !== 'not-vaccinated').length}/{docs.length} complete
        </span>
      )}
    </div>
  );
}

// Compact inline version for list views
export function PetDocBadgeInline({ 
  isVaccinated = false,
  vaccinationStatus,
  isMicrochipped = false, 
  isNeutered = false 
}: Pick<PetDocBadgeProps, 'isVaccinated' | 'vaccinationStatus' | 'isMicrochipped' | 'isNeutered'>) {
  const vStatus = vaccinationStatus || (isVaccinated ? 'fully-vaccinated' : 'unknown');
  
  const getEmoji = (status: string) => {
    switch (status) {
      case 'fully-vaccinated': return '💉✓';
      case 'partially-vaccinated': return '💉⚠';
      case 'not-vaccinated': return '💉✗';
      default: return '💉?';
    }
  };

  const getColor = (status: string) => {
    switch (status) {
      case 'fully-vaccinated': return 'text-green-600';
      case 'partially-vaccinated': return 'text-amber-500';
      case 'not-vaccinated': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={getColor(vStatus)} title={vStatus.replace('-', ' ')}>
        {getEmoji(vStatus)}
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
