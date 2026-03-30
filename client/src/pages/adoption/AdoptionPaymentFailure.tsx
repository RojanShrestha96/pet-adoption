import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, Phone, AlertTriangle, Loader2 } from "lucide-react";
import api from "../../utils/api";

/**
 * AdoptionPaymentFailure
 *
 * Loaded when eSewa redirects to:
 *   /adoption-payment/failure/:appId
 *
 * Responsibilities:
 *   1. Read appId from URL path.
 *   2. Call POST /api/applications/:appId/finalize/payment-failure to record
 *      the failed attempt and get remaining attempts from the backend.
 *   3. If attempts remain → show "Try Again" button back to tracking page.
 *   4. If exhausted → show "Shelter has been notified" message.
 *
 * NOTE: Must NOT be behind an auth guard.
 */
export function AdoptionPaymentFailure() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attemptsUsed, setAttemptsUsed] = useState<number>(0);
  const [maxAttempts, setMaxAttempts] = useState<number>(10);
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appId) {
      setError("Missing application ID.");
      setLoading(false);
      return;
    }

    const recordFailure = async () => {
      try {

        const res = await api.post(
          `/applications/${appId}/finalize/payment-failure`,
          {}
        );

        const data = res.data;
        setAttemptsUsed(data.attemptsUsed ?? 1);
        setMaxAttempts(data.maxAttempts ?? 10);
        setExhausted(data.exhausted ?? false);
      } catch (err: any) {
        console.error("[PaymentFailure] Record error:", err);
        // Even if recording fails, show a generic failure message
        setError(
          err.response?.data?.message ||
            "We couldn't record this failure. Please visit your application tracking page."
        );
      } finally {
        setLoading(false);
      }
    };

    recordFailure();
  }, [appId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center px-6"
        >
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Recording attempt…</p>
        </motion.div>
      </div>
    );
  }

  const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);

  // ── Generic error (before recording) ──────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto text-center px-6"
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Something went wrong
          </h1>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          {appId && (
            <button
              onClick={() => navigate(`/application-tracking/${appId}`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to My Application
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Exhausted ──────────────────────────────────────────────────────────────
  if (exhausted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto text-center px-6"
        >
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="w-10 h-10 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Maximum Attempts Reached
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            You've used all <strong>{maxAttempts}</strong> payment attempts. The shelter has been notified and will contact you shortly to resolve this.
          </p>
          <div className="p-4 bg-gray-100 rounded-xl border border-gray-200 mb-6 text-left">
            <p className="text-sm text-gray-600 font-medium mb-1">What happens next?</p>
            <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
              <li>The shelter team has been alerted about your situation.</li>
              <li>They will contact you within 1–2 business days.</li>
              <li>Your application is still active and has not been cancelled.</li>
            </ul>
          </div>
          {appId && (
            <button
              onClick={() => navigate(`/application-tracking/${appId}`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              View My Application
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Standard failure with retries remaining ────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto text-center px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-12 h-12 text-red-500" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Not Completed
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Your transaction was cancelled or declined. No money has been charged.
        </p>

        {/* Attempt counter */}
        <div className="flex justify-center gap-3 mb-6">
          <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
            {attemptsUsed} attempt{attemptsUsed !== 1 ? "s" : ""} used
          </div>
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            {attemptsRemaining} remaining
          </div>
        </div>

        {/* Attempt progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: maxAttempts }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < attemptsUsed ? "bg-red-400" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {appId && (
            <button
              onClick={() => navigate(`/application-tracking/${appId}`)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md shadow-red-100"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
