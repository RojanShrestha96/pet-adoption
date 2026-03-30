import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Calculator, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/Toast";
import api from "../../utils/api";

interface FeeEntry {
  species: "dog" | "cat" | "other";
  minAgeMonths: number;
  maxAgeMonths: number;
  fee: number;
}

export function AdoptionFeeSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feeTable, setFeeTable] = useState<{
    currency: string;
    defaultFee: number;
    speciesRates: FeeEntry[];
  }>({
    currency: "NPR",
    defaultFee: 0,
    speciesRates: [],
  });

  useEffect(() => {
    fetchFeeTable();
  }, []);

  const fetchFeeTable = async () => {
    try {
      setLoading(true);
      const response = await api.get("/shelter/fee-table");
      setFeeTable(response.data);
    } catch (error: any) {
      console.error("Error fetching fee table:", error);
      showToast("Failed to load fee table", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setFeeTable((prev) => ({
      ...prev,
      speciesRates: [
        ...prev.speciesRates,
        { species: "dog", minAgeMonths: 0, maxAgeMonths: 12, fee: 0 },
      ],
    }));
  };

  const handleRemoveField = (index: number) => {
    setFeeTable((prev) => ({
      ...prev,
      speciesRates: prev.speciesRates.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateField = (index: number, field: keyof FeeEntry, value: any) => {
    setFeeTable((prev) => {
      const newRates = [...prev.speciesRates];
      newRates[index] = { ...newRates[index], [field]: value };
      return { ...prev, speciesRates: newRates };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put("/shelter/fee-table", feeTable);
      showToast("Adoption fee table updated successfully!", "success");
    } catch (error: any) {
      console.error("Error saving fee table:", error);
      showToast(error.response?.data?.message || "Failed to save fee table", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Adoption Fee Table</h2>
          <p className="text-sm text-gray-500">Define automated adoption fees based on pet type and age.</p>
        </div>
        <Button
          variant="primary"
          icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-500" />
                Species & Age Specific Rates
              </h3>
              <Button variant="outline" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleAddField}>
                Add Rule
              </Button>
            </div>

            <div className="space-y-4">
              {(!feeTable.speciesRates || feeTable.speciesRates.length === 0) ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 italic">No specific rules defined. The default fee will be used for all pets.</p>
                </div>
              ) : (
                feeTable.speciesRates.map((rate, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Species</label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={rate.species || "dog"}
                        onChange={(e) => handleUpdateField(index, "species", e.target.value)}
                      >
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Age (mo)</label>
                      <Input
                        type="number"
                        value={rate.minAgeMonths.toString()}
                        onChange={(e) => handleUpdateField(index, "minAgeMonths", Number(e.target.value))}
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Age (mo)</label>
                      <Input
                        type="number"
                        value={rate.maxAgeMonths.toString()}
                        onChange={(e) => handleUpdateField(index, "maxAgeMonths", Number(e.target.value))}
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fee (NPR)</label>
                      <Input
                        type="number"
                        value={rate.fee.toString()}
                        onChange={(e) => handleUpdateField(index, "fee", Number(e.target.value))}
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveField(index)}
                      className="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Fallback Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Adoption Fee</label>
                  <Input
                    type="number"
                    placeholder="Base fee for everything else"
                    value={feeTable.defaultFee.toString()}
                    onChange={(e) => setFeeTable(prev => ({ ...prev, defaultFee: Number(e.target.value) }))}
                    icon={<span className="text-gray-400 font-bold px-2">Rs</span>}
                  />
                  <p className="text-xs text-gray-500 mt-1">This fee applies if no species/age rule matches the pet.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed outline-none"
                    value={feeTable.currency}
                    disabled
                  >
                    <option value="NPR">Nepalese Rupee (NPR)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">How calculation works:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>System checks for species match first</li>
                <li>Then it checks if pet's age falls within the month range</li>
                <li>If multiple matches exist, it picks the first one</li>
                <li>If no matches, the default fee is used</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
