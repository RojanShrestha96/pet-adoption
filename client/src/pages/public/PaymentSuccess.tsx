
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";


export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyTransaction = async () => {
      const data = searchParams.get("data");
      
      if (!data) {
        // Fallback for direct access or different callback format
        const refId = searchParams.get("refId");
        if (refId) setTransactionId(refId);
        setIsVerifying(false);
        return;
      }

      try {
        // Optional: Decode locally for immediate UI update
        const jsonString = atob(data);
        const decodedData: any = JSON.parse(jsonString); // Fix: Type assertion
        if (decodedData.transaction_uuid) {
            setTransactionId(decodedData.transaction_uuid);
        }

        // Call backend to verify and update status
        const response = await fetch(`http://localhost:5000/api/payment/esewa/verify?data=${data}`);
        const result = await response.json();

        if (!result.success) {
            setError(result.message || "Payment verification failed");
        }
      } catch (e) {
        console.error("Verification error", e);
        setError("Failed to verify payment details.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyTransaction();
  }, [searchParams]);

  if (isVerifying) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
            >
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700">Verifying Payment...</h2>
            </motion.div>
        </div>
    );
  }

  if (error) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2rem] p-8 max-w-lg w-full text-center shadow-xl border border-red-100"
            >
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-red-500 transform rotate-180" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-gray-800">Verification Issue</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button variant="outline" onClick={() => navigate("/donate")}>Try Again</Button>
            </motion.div>
        </div>
     );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl max-w-lg w-full text-center border border-gray-100"
      >
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
            <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
        </motion.div>

        <h1 className="text-3xl font-bold mb-4 text-gray-800">Payment Successful!</h1>
        <p className="text-gray-600 text-lg mb-8">
            Thank you for your generous donation. You are a hero for pets in need! <Heart className="inline w-5 h-5 text-red-500 fill-red-500" />
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
            <span className="block text-sm text-gray-500 uppercase tracking-wider mb-1">Transaction ID</span>
            <span className="block font-mono font-bold text-gray-800 break-all">{transactionId}</span>
        </div>

        <div className="flex flex-col gap-3">
            <Button 
                variant="primary" 
                size="lg" 
                onClick={() => navigate("/")}
                fullWidth
            >
                Return Home
            </Button>
            <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate("/donate")}
                fullWidth
            >
                Make Another Donation
            </Button>
        </div>
      </motion.div>
    </div>
  );
}

