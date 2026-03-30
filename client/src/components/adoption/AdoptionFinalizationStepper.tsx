import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, FileSignature, CheckCircle, PackageCheck, AlertCircle, Loader2, Download, Heart, MapPin, Phone, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import api from "../../utils/api";

interface FinalizationStepperProps {
  applicationId: string;
  application: any;
  onRefresh: () => void;
}

// Custom Signature Pad Component
const SignaturePad = ({ onSign }: { onSign: (dataUrl: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
      }
    }
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const submitSignature = () => {
    if (!hasSignature) return;
    const canvas = canvasRef.current;
    if (canvas) {
      // Export as PNG
      onSign(canvas.toDataURL("image/png"));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden relative cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerOut={stopDrawing}
          className="w-full max-w-[400px] h-[200px]"
        />
        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-400 font-medium">
            Draw your signature here
          </div>
        )}
      </div>
      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={clearSignature} disabled={!hasSignature}>
          Clear
        </Button>
        <Button variant="primary" onClick={submitSignature} disabled={!hasSignature}>
          Sign &amp; Submit
        </Button>
      </div>
    </div>
  );
};

export function AdoptionFinalizationStepper({ applicationId, application, onRefresh }: FinalizationStepperProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  const [contractUrls, setContractUrls] = useState<{ unsigned: string | null; signed: string | null }>({
    unsigned: null,
    signed: null,
  });
  const [isExpanded, setIsExpanded] = useState(true);

  const status = application.status;
  const finalization = application.finalization || {};

  const handleDownloadPdf = (url: string, prefix: string) => {
    try {
      // For Cloudinary URLs, inject 'fl_attachment' to force a direct browser download.
      // This bypasses CORS issues with fetch() and is more reliable.
      let downloadUrl = url;
      if (url.includes("cloudinary.com") && url.includes("/upload/")) {
        downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
      }

      // Create a temporary link and click it
      const link = document.createElement("a");
      link.href = downloadUrl;
      // Note: 'download' attribute only works for same-origin or with Content-Disposition header.
      // Since fl_attachment adds the header, this will work.
      link.download = `${prefix}_${application.pet?.name || "Contract"}.pdf`;
      link.target = "_blank"; // Fallback for some browsers
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed, opening in new tab", err);
      window.open(url, "_blank");
    }
  };

  // Fetch contract URLs if in a finalization state
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get(`/applications/${applicationId}/finalize/status`);
        if (response.data.success) {
          setContractUrls({
            unsigned: response.data.contractPdfUrl,
            signed: response.data.signedContractUrl,
          });
        }
      } catch (err) {
        console.error("Failed to fetch contract URLs:", err);
      }
    };
    if (['contract_generated', 'contract_signed', 'handover_pending', 'completed'].includes(status)) {
      fetchStatus();
    }
  }, [applicationId, status]);

  // Map status to active step (0-indexed)
  const getActiveStep = () => {
    switch (status) {
      case "payment_pending":
      case "payment_failed":
        return 0;
      case "contract_generated":
        return 1;
      case "contract_signed":
      case "handover_pending":
        return 2;
      case "completed":
        return 3;
      default:
        // finalization_pending means shelter hasn't confirmed fee yet
        return -1;
    }
  };

  const activeStep = getActiveStep();

  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/applications/${applicationId}/finalize/initiate-payment`);
      const data = response.data;
      
      if (data.success) {
        // Build and submit eSewa form dynamically like DonatePage
        const form = document.createElement("form");
        form.action = data.url;
        form.method = "POST";
        form.style.display = "none";
        Object.keys(data.data).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data.data[key];
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else {
        showToast("Payment initiation failed", "error");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      showToast(error.response?.data?.message || "Payment initiation failed", "error");
      setLoading(false);
    }
  };

  const handleSignContract = async (signatureData: string) => {
    try {
      setLoading(true);
      await api.post(`/applications/${applicationId}/finalize/sign-contract`, { signatureData });
      showToast("Contract signed successfully!", "success");
      onRefresh();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to sign contract", "error");
    } finally {
      setLoading(false);
    }
  };

  // If waiting for shelter to confirm fee, don't show stepper yet or show waiting state
  if (status === "finalization_pending" || status === "meeting_completed") {
    return (
      <Card padding="lg" className="border-blue-200 bg-blue-50/50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <div>
            <h3 className="font-bold text-gray-900">Preparing Finalization</h3>
            <p className="text-sm text-gray-600">The shelter is currently preparing the adoption fee and finalize details. Check back shortly!</p>
          </div>
        </div>
      </Card>
    );
  }

  const steps = [
    { title: "Adoption Fee", icon: CreditCard, description: "Secure payment via eSewa" },
    { title: "Review Contract", icon: FileSignature, description: "Sign digital agreement" },
    { title: "Pickup Ready", icon: PackageCheck, description: "Wait for shelter signal" },
    { title: "Handover", icon: CheckCircle, description: "Adoption complete!" }
  ];

  return (
    <Card padding="none" className="overflow-hidden border border-gray-200 shadow-sm mt-6">
      <div 
        className="bg-gray-50 border-b border-gray-200 p-6 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Finalization Progress</h2>
        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 border-b border-gray-200 p-6 pt-0">
              {/* Stepper Header */}
              <div className="flex items-center justify-between relative mt-4">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0" />
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--color-primary)] rounded-full z-0 transition-all duration-500"
                  style={{ width: `${(Math.max(0, activeStep) / (steps.length - 1)) * 100}%` }}
                />
                
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = activeStep > idx;
                  const isCurrent = activeStep === idx;
                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-gray-50 transition-colors ${
                        isCompleted ? "bg-[var(--color-primary)] text-white" : 
                        isCurrent ? "bg-white border-[var(--color-primary)] text-[var(--color-primary)]" : 
                        "bg-gray-200 text-gray-400"
                      }`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <div className="absolute top-12 w-24 text-center">
                        <p className={`text-xs font-bold ${isCurrent ? "text-gray-900" : "text-gray-500"}`}>{step.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="h-8" />
            </div>

            <div className="p-6 md:p-8 relative min-h-[300px]">
              {loading && (
                <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {/* STEP 1: PAYMENT */}
          {activeStep === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Adoption Fee</h3>
                <p className="text-gray-600 mb-6">The shelter has confirmed the final adoption fee for {application.pet?.name}.</p>
                
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Total Amount</p>
                  <p className="text-4xl font-black text-gray-900 mb-1">
                    Rs {finalization.adoptionFee?.toLocaleString()}
                  </p>
                  {finalization.feeWasOverridden && (
                    <p className="text-xs font-medium text-amber-600 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Note: This fee differs from standard calculated amount.
                    </p>
                  )}
                </div>

                {status === "payment_failed" && (
                   <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 text-sm font-medium">
                     Your previous payment attempt failed or was cancelled. Please try again.
                   </div>
                )}

                <Button size="lg" className="w-full text-lg shadow-lg hover:-translate-y-1 transition-transform" onClick={handlePayment}>
                  Pay securely with eSewa
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CONTRACT */}
          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="max-w-2xl mx-auto text-center mb-6">
                <h3 className="text-2xl font-black text-gray-900 mb-2">Sign Adoption Contract</h3>
                <p className="text-gray-600">Your payment was successful! Please review and sign the digital adoption agreement below.</p>
              </div>

              {/* The Contract PDF view would ideally be embedded here, but we don't have the contractUrl explicitly. 
                  Wait, getFinalizationStatus is called by ApplicationTrackingPage to get the full finalization object? 
                  Yes, but we also can rely on the fact that if contractId is present, we need to fetch it or the backend should return the contract.
                  Since we don't fetch the contract explicitly yet, we'll just show the signature pad for V1.
              */}
              
               <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6 max-w-2xl mx-auto flex flex-col gap-4">
                 <div className="flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-sm text-amber-800 text-left">
                     By signing below, you agree to the terms of the pet adoption agreement. You commit to providing adequate food, shelter, veterinary care, and a loving environment for {application.pet?.name}.
                   </p>
                 </div>

                 {contractUrls.unsigned && (
                   <div className="flex flex-col items-center gap-3 border-t border-amber-200/50 pt-4 mt-2">
                     <Button 
                       variant="outline" 
                       onClick={() => handleDownloadPdf(contractUrls.unsigned!, "Unsigned_Contract")}
                       className="w-full sm:w-auto bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
                     >
                       Download Contract PDF
                     </Button>
                     <label className="flex items-center gap-2 cursor-pointer mt-1 hover:opacity-80 transition-opacity">
                       <input 
                         type="checkbox" 
                         checked={hasReadContract}
                         onChange={(e) => setHasReadContract(e.target.checked)}
                         className="w-4 h-4 rounded text-blue-600 border-amber-300 focus:ring-blue-500 cursor-pointer"
                       />
                       <span className="text-sm font-bold text-amber-900 cursor-pointer select-none">
                         I have read and understood the contract
                       </span>
                     </label>
                   </div>
                 )}
               </div>

              <div className={`transition-all duration-300 ${!hasReadContract && contractUrls.unsigned ? 'opacity-40 pointer-events-none filter grayscale' : ''}`}>
                <SignaturePad onSign={handleSignContract} />
              </div>
            </motion.div>
          )}

          {/* STEP 3: PICKUP READY */}
          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center max-w-md mx-auto py-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  {status === "handover_pending" ? <PackageCheck className="w-10 h-10" /> : <Loader2 className="w-10 h-10 animate-spin" />}
                </div>
                
                {status === "handover_pending" ? (
                  <>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Ready for Pickup!</h3>
                    <p className="text-gray-600 mb-6">{application.pet?.name} is ready to go home. The shelter is expecting you to come pick them up.</p>
                    
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-left mb-6 w-full max-w-sm mx-auto">
                      <h4 className="font-bold text-green-900 mb-2">Shelter Details</h4>
                      <p className="font-medium text-green-800">{application.shelter?.name}</p>
                      {application.shelter?.email && (
                        <p className="text-sm text-green-700 flex items-center gap-2 mt-2">
                          <MapPin className="w-4 h-4" /> {application.shelter.email} {/* Using email as placeholder for location if address missing */}
                        </p>
                      )}
                      {application.shelter?.phone && (
                        <p className="text-sm text-green-700 flex items-center gap-2 mt-2">
                          <Phone className="w-4 h-4" /> {application.shelter.phone}
                        </p>
                      )}
                    </div>

                    {contractUrls.signed && (
                      <Button variant="outline" className="w-full max-w-sm mx-auto bg-white text-green-700 hover:bg-green-100 border-green-300" icon={<Download className="w-4 h-4" />} onClick={() => handleDownloadPdf(contractUrls.signed!, "Signed_Contract")}>
                        Download Signed Contract
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Awaiting Shelter Approval</h3>
                    <p className="text-gray-600 mb-6">Your signed contract has been received. The shelter is preparing {application.pet?.name} for handover and will signal when ready.</p>
                  </>
                )}
              </div>
            </motion.div>
          )}

           {/* STEP 4: COMPLETED */}
          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
               <div className="text-center max-w-md mx-auto py-8">
                 <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
                   <Heart className="w-12 h-12" fill="currentColor" />
                 </div>
                 <h3 className="text-3xl font-black text-gray-900 mb-2">Adoption Complete!</h3>
                 <p className="text-gray-600 mb-8">Congratulations on adopting {application.pet?.name}! We wish you both a lifetime of happiness.</p>
                 
                 <div className="flex flex-col gap-3 max-w-xs mx-auto">
                   <Button variant="primary" className="w-full shadow-lg shadow-blue-500/20" icon={<Share2 className="w-4 h-4" />} onClick={() => window.location.href = "/success-stories"}>
                     Share Your Story
                   </Button>
                   
                   {/* Provide download link if the status endpoint returned signedContractUrl */}
                   {contractUrls.signed && (
                     <Button variant="outline" className="w-full" icon={<Download className="w-4 h-4" />} onClick={() => handleDownloadPdf(contractUrls.signed!, "Signed_Contract")}>
                       Download Signed Contract
                     </Button>
                   )}
                 </div>
               </div>
            </motion.div>
          )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
