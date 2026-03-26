import { useState } from "react";
import { Card } from "../ui/Card";
import { ArrowUpDown } from "lucide-react";

export interface ShelterDonationData {
  shelterId: string;
  shelterName: string;
  shelterCity: string;
  totalReceived: number;
  donorCount: number;
  petCount: number;
  lastDonationDate: string;
}

interface AdminDonationSheltersTableProps {
  data: ShelterDonationData[];
  onShelterClick: (shelterName: string | null) => void;
  selectedShelterName: string | null;
}

export function AdminDonationSheltersTable({ data, onShelterClick, selectedShelterName }: AdminDonationSheltersTableProps) {
  // UX IMPROVEMENT: Admin donation analytics
  const [sortAsc, setSortAsc] = useState(false);

  const sortedData = [...data].sort((a, b) => {
    if (sortAsc) return a.totalReceived - b.totalReceived;
    return b.totalReceived - a.totalReceived;
  });

  return (
    <Card className="overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
         <h3 className="font-bold text-gray-900">Donations by shelter</h3>
         {selectedShelterName && (
             <button 
                onClick={() => onShelterClick(null)}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
             >
                 Clear Filter
             </button>
         )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Shelter</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">City</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setSortAsc(!sortAsc)}>
                <div className="flex items-center gap-1">
                   Total Received <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Donors</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Pets</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Last Donation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((shelter) => (
              <tr key={shelter.shelterId} className={`hover:bg-gray-50 transition-colors ${selectedShelterName === shelter.shelterName ? 'bg-red-50' : ''}`}>
                <td className="py-3 px-4">
                   <button 
                     onClick={() => onShelterClick(shelter.shelterName)}
                     className="font-medium text-red-600 hover:text-red-700 hover:underline text-left"
                   >
                       {shelter.shelterName}
                   </button>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {shelter.shelterCity}
                </td>
                <td className="py-3 px-4 font-bold text-gray-900">
                  Rs {shelter.totalReceived.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {shelter.donorCount}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {shelter.petCount}
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">
                  {shelter.lastDonationDate ? new Date(shelter.lastDonationDate).toLocaleDateString() : 'Never'}
                </td>
              </tr>
            ))}
            {sortedData.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                        No shelter donation data available.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
