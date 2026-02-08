import React from 'react';
import { CheckCircle, XCircle, Calendar } from 'lucide-react';
import type { Pet } from '../data/mockData';
export interface MedicalRecordProps {
  medical: Pet['medical'];
}
export function MedicalRecord({
  medical
}: MedicalRecordProps) {
  const records = [{
    label: 'Vaccinated',
    value: medical.vaccinated
  }, {
    label: 'Dewormed',
    value: medical.dewormed
  }, {
    label: 'Sterilized',
    value: medical.sterilized
  }];
  return <div className="p-6 space-y-4" style={{
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)'
  }}>
      <h3 className="text-xl font-bold" style={{
      color: 'var(--color-text)'
    }}>
        Medical Record
      </h3>

      <div className="space-y-3">
        {records.map(record => <div key={record.label} className="flex items-center justify-between">
            <span style={{
          color: 'var(--color-text)'
        }}>
              {record.label}
            </span>
            <div className="flex items-center gap-2">
              {record.value ? <>
                  <CheckCircle className="w-5 h-5" style={{
              color: 'var(--color-success)'
            }} />
                  <span className="text-sm font-medium" style={{
              color: 'var(--color-success)'
            }}>
                    Yes
                  </span>
                </> : <>
                  <XCircle className="w-5 h-5" style={{
              color: 'var(--color-error)'
            }} />
                  <span className="text-sm font-medium" style={{
              color: 'var(--color-error)'
            }}>
                    No
                  </span>
                </>}
            </div>
          </div>)}
      </div>

      <div className="pt-4 mt-4 flex items-center gap-2" style={{
      borderTop: '1px solid var(--color-border)'
    }}>
        <Calendar className="w-4 h-4" style={{
        color: 'var(--color-text-light)'
      }} />
        <span className="text-sm" style={{
        color: 'var(--color-text-light)'
      }}>
          Last checkup: {new Date(medical.lastCheckup).toLocaleDateString()}
        </span>
      </div>

      {medical.notes && <div className="p-4 mt-4" style={{
      background: 'var(--color-background)',
      borderRadius: 'var(--radius-md)'
    }}>
          <p className="text-sm" style={{
        color: 'var(--color-text)'
      }}>
            <strong>Notes:</strong> {medical.notes}
          </p>
        </div>}
    </div>;
}