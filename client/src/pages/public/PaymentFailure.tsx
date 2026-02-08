
import React from "react";
import { useNavigate } from "react-router-dom";
import { X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";

export function PaymentFailure() {
  const navigate = useNavigate();

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
            className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
            <X className="w-12 h-12 text-red-600" strokeWidth={3} />
        </motion.div>

        <h1 className="text-3xl font-bold mb-4 text-gray-800">Payment Failed</h1>
        <p className="text-gray-600 text-lg mb-8">
            We couldn't process your donation. Please try again or contact support if the problem persists.
        </p>

        <div className="bg-red-50 rounded-xl p-4 mb-8 text-left border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-700">Possible reasons: Insufficient funds, transaction cancelled, or network error.</span>
        </div>

        <div className="flex flex-col gap-3">
            <Button 
                variant="primary" 
                size="lg" 
                onClick={() => navigate("/donate")}
                fullWidth
            >
                Try Again
            </Button>
            <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate("/")}
                fullWidth
            >
                Start Over
            </Button>
        </div>
      </motion.div>
    </div>
  );
}
