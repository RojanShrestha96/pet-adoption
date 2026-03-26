import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

export interface TransactionData {
  transactionUuid: string;
  amount: number;
  petName: string;
  shelterName: string;
  createdAt: string;
  status: "completed" | "pending" | "failed";
}

interface AdminDonationTransactionsTableProps {
  data: TransactionData[];
  selectedShelterName: string | null;
}

export function AdminDonationTransactionsTable({ data, selectedShelterName }: AdminDonationTransactionsTableProps) {
  // UX IMPROVEMENT: Admin donation analytics
  
  const filteredData = selectedShelterName 
    ? data.filter(d => d.shelterName === selectedShelterName) 
    : data;

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
         <h3 className="font-bold text-gray-900">
             {selectedShelterName ? `Recent transactions: ${selectedShelterName}` : "Recent transactions"}
         </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Transaction ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Pet</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Shelter</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((tx, idx) => (
              <tr key={tx.transactionUuid + idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-gray-500">
                  {tx.transactionUuid.substring(0, 12)}...
                </td>
                <td className="py-3 px-4 font-bold text-gray-900">
                  Rs {tx.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4 font-medium text-gray-800">
                  {tx.petName}
                </td>
                <td className="py-3 px-4 text-gray-600 flex items-center gap-2">
                  {tx.shelterName}
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'}>
                     {tx.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                        No transactions found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
