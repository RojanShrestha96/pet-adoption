import React from 'react';
import { CheckCircle, XCircle, Calendar, ShieldAlert, Syringe, Info, User, Clock } from 'lucide-react';
import type { Pet } from '../data/mockData';

export interface MedicalRecordProps {
  medical?: Pet['medical'];
}

export function MedicalRecord({
  medical
}: MedicalRecordProps): JSX.Element {
  // Guard against missing medical data
  if (!medical) {
    return (
      <div className="p-6 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400">
        <ShieldAlert className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm font-medium">No medical records available</p>
      </div>
    );
  }

  const records = [
    {
      label: 'Dewormed',
      value: medical.isDewormed ?? medical.dewormed ?? false
    },
    {
      label: 'Microchipped',
      value: medical.isMicrochipped ?? false
    },
    {
      label: 'Sterilized/Neutered',
      value: medical.isNeutered ?? medical.sterilized ?? false
    }
  ];

  const lastCheckup = medical.lastVetCheckup || medical.lastCheckup;
  const notes = medical.medicalNotes || medical.notes;
  const vaccinationStatus = medical.vaccinationStatus || (medical.isVaccinated ? 'fully-vaccinated' : 'unknown');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'fully-vaccinated':
        return { label: 'Fully Vaccinated', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> };
      case 'partially-vaccinated':
        return { label: 'Partially Vaccinated', color: 'bg-amber-100 text-amber-700', icon: <Info className="w-4 h-4" /> };
      case 'not-vaccinated':
        return { label: 'Not Vaccinated', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> };
      default:
        return { label: 'Unknown Status', color: 'bg-gray-100 text-gray-600', icon: <Clock className="w-4 h-4" /> };
    }
  };

  const statusConfig = getStatusConfig(vaccinationStatus);

  return (
    <div className="p-6 space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[var(--color-primary)]" />
          Medical Status
        </h3>
        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider border border-green-100">
          Shelter Verified
        </span>
      </div>

      {/* Primary Vaccination Status Card */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${statusConfig.color} border-current/10`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/50 rounded-lg">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Vaccination Status</p>
            <p className="text-base font-bold">{statusConfig.label}</p>
          </div>
        </div>
        {statusConfig.icon}
      </div>

      {/* Grid for other medical fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {records.map(record => (
          <div key={record.label} className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {record.label}
            </span>
            <div className={`text-xs font-bold flex items-center gap-1 ${record.value ? 'text-green-600' : 'text-gray-400'}`}>
              {record.value ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {record.value ? 'YES' : 'NO'}
            </div>
          </div>
        ))}
      </div>

      {/* Individual Vaccine Records */}
      {medical.vaccinations && medical.vaccinations.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Vaccination History
          </h4>
          <div className="space-y-3">
            {medical.vaccinations.map((v, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-blue-50/30 rounded-xl border border-blue-100/50">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Syringe className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-gray-800 truncate">{v.name}</p>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                      Adm. {new Date(v.dateAdministered).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {v.nextDueDate && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Next Due: <span className="font-semibold text-gray-700">{new Date(v.nextDueDate).toLocaleDateString()}</span>
                      </p>
                    )}
                    {v.administeredBy && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        By: <span className="font-semibold text-gray-700">{v.administeredBy}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        {lastCheckup && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last Prof. Checkup</p>
              <p className="text-sm font-bold text-gray-700">
                {new Date(lastCheckup).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}
      </div>

      {notes && (
        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
             <Info className="w-3.5 h-3.5" />
             Medical & Behavioural Notes
          </p>
          <p className="text-sm text-gray-700 leading-relaxed font-medium capitalize">
             {notes}
          </p>
        </div>
      )}
    </div>
  );
}