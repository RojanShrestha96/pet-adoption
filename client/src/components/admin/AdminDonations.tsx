import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Button } from "../ui/Button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "../ui/Toast";

import { AdminDonationCards } from "./AdminDonationCards";
import { AdminDonationChart } from "./AdminDonationChart";
import { AdminDonationSheltersTable } from "./AdminDonationSheltersTable";
import { AdminDonationTransactionsTable } from "./AdminDonationTransactionsTable";

export function AdminDonations() {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedShelterName, setSelectedShelterName] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get("/admin/donations/overview");
        setData(response.data);
      } catch (error) {
        showToast("Failed to fetch donations overview", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, [showToast]);

  const handleExportCSV = async () => {
    // PRIVACY: No donor PII in this export
    setIsExporting(true);
    try {
      const res = await api.get("/admin/donations/export", { responseType: 'blob' });
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      
      // Determine filename from headers or default
      const disposition = res.headers['content-disposition'];
      let filename = `petmate-donations-${new Date().toISOString().split('T')[0]}.csv`;
      if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
      }
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast("Export successful", "success");
    } catch (error) {
      showToast("Failed to export donations data", "error");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donation Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Platform-wide health and donation insights
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={isExporting}
          icon={isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          className="bg-white"
        >
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {/* 6 Top Stat Cards */}
      <AdminDonationCards data={data.platformTotals} />

      {/* Chart */}
      <AdminDonationChart data={data.monthlyTrend} />

      {/* Two columns layout for tables on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <AdminDonationSheltersTable 
             data={data.byShelter} 
             onShelterClick={(name) => setSelectedShelterName(name)} 
             selectedShelterName={selectedShelterName}
          />
        </div>
        <div>
          <AdminDonationTransactionsTable 
             data={data.recentTransactions} 
             selectedShelterName={selectedShelterName}
          />
        </div>
      </div>
    </div>
  );
}
