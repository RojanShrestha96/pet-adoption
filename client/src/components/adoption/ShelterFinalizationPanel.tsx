import { useState, useEffect } from "react";
import { CreditCard, FileSignature, CheckCircle, PackageCheck, Loader2, ArrowRight, Download } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "../ui/Toast";
import api from "../../utils/api";

interface ShelterFinalizationPanelProps {
  applicationId: string;
  application: any;
  onRefresh: () => void;
}

export function ShelterFinalizationPanel({ applicationId, application, onRefresh }: ShelterFinalizationPanelProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [overrideFee, setOverrideFee] = useState<string>("");
  const [signedContractUrl, setSignedContractUrl] = useState<string | null>(null);

  const status = application.status;
  const finalization = application.finalization || {};

  // Fetch signed contract URL if applicable
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get(`/applications/${applicationId}/finalize/status`);
        if (response.data.success && response.data.signedContractUrl) {
          setSignedContractUrl(response.data.signedContractUrl);
        }
      } catch (err) {
        console.error("Failed to fetch contract status:", err);
      }
    };
    if (['contract_signed', 'handover_pending', 'completed'].includes(status)) {
      fetchStatus();
    }
  }, [applicationId, status]);


  // Actions
  const handleInitialize = async () => {
    try {
      setLoading(true);
      await api.post(`/applications/${applicationId}/finalize/initialize`);
      showToast("Finalization initialized. Please review fee.", "success");
      onRefresh();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to initialize finalization", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmFee = async () => {
    try {
      setLoading(true);
      const payload = overrideFee ? { overrideFee: Number(overrideFee) } : {};
      await api.post(`/applications/${applicationId}/finalize/confirm-fee`, payload);
      showToast("Fee confirmed. Adopter notified.", "success");
      onRefresh();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to confirm fee", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReadyForPickup = async () => {
    try {
      setLoading(true);
      await api.post(`/applications/${applicationId}/finalize/confirm-ready`);
      showToast("Adopter notified that pet is ready for pickup.", "success");
      onRefresh();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Action failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmHandover = async () => {
    try {
      setLoading(true);
      await api.post(`/applications/${applicationId}/finalize/confirm-handover`);
      showToast("Handover confirmed. Adoption is now fully complete!", "success");
      onRefresh();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Action failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (url: string) => {
    try {
      setLoading(true);
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `Signed_Contract_${application.pet?.name || "PetMate"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed", err);
      window.open(url, "_blank");
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async () => {
    try {
      setLoading(true);
      await api.post(`/applications/${applicationId}/finalize/revert`);
      showToast("Process reset to Meeting Complete.", "info");
      onRefresh();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to reset", "error");
    } finally {
      setLoading(false);
    }
  };

  // Only show panel for relevant statuses
  const showStatuses = [
    'meeting_completed', 'finalization_pending', 'payment_pending', 
    'payment_failed', 'contract_generated', 'contract_signed', 
    'handover_pending', 'completed'
  ];

  if (!showStatuses.includes(status)) return null;

  // Determine stage description
  let stageDescription = "";
  switch (status) {
    case 'meeting_completed':
      stageDescription = "Meeting is complete. You can now initiate the finalization process when ready.";
      break;
    case 'finalization_pending':
      stageDescription = "Review the calculated adoption fee and confirm to prompt the adopter for payment.";
      break;
    case 'payment_pending':
    case 'payment_failed':
      stageDescription = "Waiting for the adopter to complete the eSewa payment.";
      break;
    case 'contract_generated':
      stageDescription = "Payment received. Waiting for the adopter to sign the digital contract.";
      break;
    case 'contract_signed':
      stageDescription = "Contract signed. Prepare the pet for pickup and signal the adopter when ready.";
      break;
    case 'handover_pending':
      stageDescription = "Adopter notified. Awaiting physical pickup. Click confirm once the pet has physically left the shelter.";
      break;
    case 'completed':
      stageDescription = "Adoption finalized and pet handed over successfully.";
      break;
  }

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm mt-6">
      <div className="bg-slate-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Finalization Pipeline</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 capitalize">
            Current Stage: {status.replace(/_/g, " ")}
          </div>
          {status !== 'meeting_completed' && status !== 'completed' && (
            <Button variant="outline" size="sm" onClick={handleRevert} className="text-gray-500 hover:text-red-600 hover:border-red-200">
              Reset to Meeting Complete
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[2px]">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}

        <p className="text-sm text-gray-600 mb-6">{stageDescription}</p>

        {/* Action Panels based on status */}

        {status === 'meeting_completed' && (
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleInitialize} icon={<ArrowRight className="w-4 h-4" />}>
              Start Finalization
            </Button>
          </div>
        )}

        {status === 'finalization_pending' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Calculated Fee Component</p>
                <p className="text-2xl font-black text-gray-900">
                  Rs {finalization.calculatedFee?.toLocaleString() || "0"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">Optional Fee Override</label>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Leave blank to use calculated fee"
                  value={overrideFee}
                  onChange={(e) => setOverrideFee(e.target.value)}
                  fullWidth
                  icon={<span className="text-gray-400 font-bold px-2">Rs</span>}
                />
                <Button variant="primary" onClick={handleConfirmFee} className="shrink-0">
                  Confirm Fee
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Entering a value will override the calculated fee for this specific adoption.</p>
            </div>
          </div>
        )}

        {['payment_pending', 'payment_failed'].includes(status) && (
           <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Awaiting Payment</h4>
                <p className="text-sm text-gray-600 mt-0.5">Fee confirmed at Rs {finalization.adoptionFee?.toLocaleString()}. Adopter has been notified to pay.</p>
              </div>
           </div>
        )}

        {status === 'contract_generated' && (
           <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <FileSignature className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Payment Received – Awaiting Signature</h4>
                <p className="text-sm text-gray-600 mt-0.5">The adopter must now sign the digital contract.</p>
              </div>
           </div>
        )}

        {status === 'contract_signed' && (
           <div className="bg-purple-50 rounded-xl border border-purple-200 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Contract Signed</h4>
                  <p className="text-sm text-gray-600 mt-0.5">Please prepare the pet for pickup.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-end">
                <Button variant="primary" onClick={handleReadyForPickup}>
                  Mark Ready for Pickup
                </Button>
                {signedContractUrl && (
                  <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => handleDownloadPdf(signedContractUrl)}>
                    View Digital Signature
                  </Button>
                )}
              </div>
           </div>
        )}

        {status === 'handover_pending' && (
           <div className="bg-green-50 rounded-xl border border-green-200 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Waiting for Physical Handover</h4>
                  <p className="text-sm text-gray-600 mt-0.5">Click confirm only when the pet has physically left the shelter.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-end">
                <Button variant="primary" className="bg-green-600 hover:bg-green-700" onClick={handleConfirmHandover}>
                  Confirm Handover Complete
                </Button>
                {signedContractUrl && (
                  <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => handleDownloadPdf(signedContractUrl)}>
                    View Signed Contract
                  </Button>
                )}
              </div>
           </div>
        )}

        {status === 'completed' && (
           <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
               <div>
                <h4 className="font-bold text-gray-900">Finalization Complete</h4>
                <p className="text-sm text-gray-600 mt-0.5">This adoption has been fully processed and completed.</p>
                {/* Provided signed contract link if available */}
                {signedContractUrl && (
                  <button onClick={() => handleDownloadPdf(signedContractUrl)} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline mt-2 bg-blue-50 px-3 py-1.5 rounded-lg border-0 cursor-pointer text-left">
                    <Download className="w-4 h-4" /> Download Signed Contract
                  </button>
                )}
              </div>
           </div>
        )}
      </div>
    </Card>
  );
}
