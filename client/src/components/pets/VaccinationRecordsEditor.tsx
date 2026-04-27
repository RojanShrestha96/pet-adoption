import React from 'react';
import { Plus, Trash2, Calendar, Syringe, User } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export interface VaccinationRecord {
  name: string;
  dateAdministered: string;
  nextDueDate?: string;
  administeredBy?: string;
}

interface VaccinationRecordsEditorProps {
  species: string;
  vaccinations: VaccinationRecord[];
  onChange: (vaccinations: VaccinationRecord[]) => void;
}

const DOG_VACCINES = [
  'Rabies',
  'Distemper (CDV)',
  'Parvovirus (CPV)',
  'Hepatitis (CAV)',
  'Leptospirosis',
  'Bordetella',
  'Other'
];

const CAT_VACCINES = [
  'Rabies',
  'FVRCP (3-in-1)',
  'Feline Leukaemia (FeLV)',
  'Bordetella',
  'Other'
];

export function VaccinationRecordsEditor({
  species,
  vaccinations,
  onChange
}: VaccinationRecordsEditorProps) {
  const vaccineOptions = species.toLowerCase() === 'cat' ? CAT_VACCINES : DOG_VACCINES;

  const handleAdd = () => {
    onChange([
      ...vaccinations,
      { name: '', dateAdministered: '', nextDueDate: '', administeredBy: '' }
    ]);
  };

  const handleRemove = (index: number) => {
    const newVaccinations = [...vaccinations];
    newVaccinations.splice(index, 1);
    onChange(newVaccinations);
  };

  const handleChange = (index: number, field: keyof VaccinationRecord, value: string) => {
    const newVaccinations = [...vaccinations];
    newVaccinations[index] = { ...newVaccinations[index], [field]: value };
    onChange(newVaccinations);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Syringe className="w-5 h-5 text-[var(--color-primary)]" />
          Vaccination Records
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </Button>
      </div>

      {vaccinations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 text-gray-500 text-sm">
          No vaccination records added yet.
        </div>
      ) : (
        <div className="space-y-4">
          {vaccinations.map((record, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm relative group animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Vaccine Name *
                  </label>
                  <select
                    value={record.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[var(--color-primary)] focus:outline-none transition-all bg-gray-50/50 text-sm hover:border-gray-200"
                    required
                  >
                    <option value="">Select Vaccine</option>
                    {vaccineOptions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                    {!vaccineOptions.includes(record.name) && record.name && (
                        <option value={record.name}>{record.name}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Date Administered *
                  </label>
                  <input
                    type="date"
                    value={record.dateAdministered}
                    onChange={(e) => handleChange(index, 'dateAdministered', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[var(--color-primary)] focus:outline-none transition-all bg-gray-50/50 text-sm hover:border-gray-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Next Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={record.nextDueDate || ''}
                    onChange={(e) => handleChange(index, 'nextDueDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[var(--color-primary)] focus:outline-none transition-all bg-gray-50/50 text-sm hover:border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    <User className="w-3 h-3 inline mr-1" />
                    Administered By (Optional)
                  </label>
                  <Input
                    placeholder="Vet name or clinic"
                    value={record.administeredBy || ''}
                    onChange={(e) => handleChange(index, 'administeredBy', e.target.value)}
                    fullWidth
                    className="!bg-gray-50/50 !border-gray-100 hover:!border-gray-200"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
