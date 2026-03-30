import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import api from "../../utils/api";

/**
 * AdoptionPaymentSuccess
 *
 * Loaded when eSewa redirects to:
 *   /adoption-payment/success/:appId?data=<base64>
 *
 * Responsibilities:
 *   1. Read appId from the URL path.
 *   2. Read data from the URL query params.
 *   3. Call GET /api/applications/:appId/finalize/verify-payment?data=...
 *   4. On success → redirect to /application-tracking/:appId
 *   5. On failure → show error + manual navigation button
 *
 * NOTE: This route must NOT be behind an auth guard — eSewa redirects
 * without preserving JWT headers.
 */
export function AdoptionPaymentSuccess() {
  const { appId } = useParams<{ appId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const esewaData = searchParams.get("data"); // base64 payload from eSewa

  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!appId) {
      setError("Missing application ID. Cannot verify payment.");
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        // Build query — data may or may not be present depending on eSewa sandbox response
        const params = new URLSearchParams();
        if (esewaData) params.set("data", esewaData);

        await api.get(
          `/applications/${appId}/finalize/verify-payment?${params.toString()}`
        );

        // Start auto-redirect countdown
        setVerifying(false);
        const timer = setInterval(() => {
          setCountdown((c) => {
            if (c <= 1) {
              clearInterval(timer);
              navigate(`/application-tracking/${appId}`);
            }
            return c - 1;
          });
        }, 1000);
      } catch (err: any) {
        console.error("[PaymentSuccess] Verification error:", err);
        setError(
          err.response?.data?.message ||
            "Payment verification failed. Please contact the shelter or try again."
        );
        setVerifying(false);
      }
    };

    verify();
  }, [appId, esewaData, navigate]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Confirming your payment…
          </h1>
          <p className="text-gray-500 text-sm">
            Please wait while we verify your transaction with eSewa.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto text-center px-6"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error}</p>
          {appId && (
            <button
              onClick={() => navigate(`/application-tracking/${appId}`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to Application <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-auto text-center px-6"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600 mb-2 text-sm leading-relaxed">
            Your adoption fee has been confirmed. Your contract is being prepared.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Redirecting you in{" "}
            <span className="font-bold text-green-600">{countdown}</span>{" "}
            seconds…
          </p>

          {appId && (
            <button
              onClick={() => navigate(`/application-tracking/${appId}`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md shadow-green-100"
            >
              View My Application <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
