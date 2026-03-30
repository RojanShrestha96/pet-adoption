import React from 'react';
import { CheckCircle, XCircle, Calendar, ShieldAlert } from 'lucide-react';
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
      label: 'Vaccinated',
      value: medical.isVaccinated ?? medical.vaccinated ?? false
    },
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

  return (
    <div className="p-6 space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Medical Status
        </h3>
        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
          Verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map(record => (
          <div key={record.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-gray-600">
              {record.label}
            </span>
            <div className="flex items-center gap-1.5">
              {record.value ? (
                <div className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>YES</span>
                </div>
              ) : (
                <div className="px-2.5 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>NO</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {lastCheckup && (
        <div className="pt-4 flex items-center gap-3 border-t border-gray-100">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last Professional Checkup</p>
            <p className="text-sm font-bold text-gray-700">
               {new Date(lastCheckup).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      {notes && (
        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-1.5">Medical & Behavioural Notes</p>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
             {notes}
          </p>
        </div>
      )}
    </div>
  );
}