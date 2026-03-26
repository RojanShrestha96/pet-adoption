
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, Heart, Share2, Home, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";

const API = "http://localhost:5000";

interface PetInfo {
  _id: string;
  name: string;
  images: string[];
  donationStory: string;
}
interface ShelterInfo {
  _id: string;
  name: string;
}

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [pet, setPet] = useState<PetInfo | null>(null);
  const [shelter, setShelter] = useState<ShelterInfo | null>(null);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    const verifyTransaction = async () => {
      const data = searchParams.get("data");
      if (!data) {
        setIsVerifying(false);
        return;
      }
      try {
        // Decode locally for immediate UI
        const jsonString = atob(data);
        const decodedData: any = JSON.parse(jsonString);
        if (decodedData.transaction_uuid) setTransactionId(decodedData.transaction_uuid);
        if (decodedData.total_amount) setAmount(parseFloat(decodedData.total_amount));

        // Backend verification — now returns pet & shelter
        const response = await fetch(`${API}/api/payment/esewa/verify?data=${data}`);
        const result = await response.json();

        if (result.success) {
          if (result.pet) setPet(result.pet);
          if (result.shelter) setShelter(result.shelter);
          if (result.donation?.amount) setAmount(result.donation.amount);
        } else {
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Verifying your donation...</h2>
          <p className="text-gray-400 text-sm mt-1">Just a moment while we confirm everything</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-8 max-w-lg w-full text-center shadow-xl border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Verification Issue</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button variant="outline" onClick={() => navigate("/donate")}>Try Again</Button>
        </motion.div>
      </div>
    );
  }

  const petImageUrl = pet?.images?.[0] || null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
      >
        {/* Top accent bar */}
        <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #e85d3a 0%, #f4956a 100%)" }} />

        <div className="p-8 md:p-10 text-center">
          {/* Pet image or checkmark */}
          {petImageUrl ? (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-5 border-4 shadow-lg"
              style={{ borderColor: "#f4956a" }}
            >
              <img src={petImageUrl} alt={pet?.name} className="w-full h-full object-cover" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
              style={{ background: "linear-gradient(135deg, #f4956a22, #e85d3a22)" }}
            >
              <Check className="w-12 h-12" style={{ color: "#e85d3a" }} strokeWidth={3} />
            </motion.div>
          )}

          {/* Emotional headline */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h1 className="text-3xl font-black mb-2 text-gray-800 leading-tight">
              {pet ? (
                <>You just helped <span style={{ color: "#e85d3a" }}>{pet.name}</span> get the care they need!</>
              ) : (
                <>Thank you for your kindness! <Heart className="inline w-6 h-6 text-red-400 fill-red-400" /></>
              )}
            </h1>
            <p className="text-gray-500 text-base mb-6">
              {pet?.donationStory
                ? `"${pet.donationStory}"`
                : "Your generosity makes a real difference for pets in need."}
            </p>
          </motion.div>

          {/* Donation summary card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-5 mb-6 text-left space-y-3"
            style={{ background: "var(--color-surface, #faf9f8)", border: "1.5px solid rgba(0,0,0,0.06)" }}
          >
            {amount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Amount Donated</span>
                <span className="font-black text-lg" style={{ color: "#e85d3a" }}>NPR {amount.toLocaleString()}</span>
              </div>
            )}
            {pet && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">For</span>
                <span className="font-bold text-gray-800">{pet.name} 🐾</span>
              </div>
            )}
            {shelter && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Shelter</span>
                <span className="font-semibold text-gray-700">{shelter.name}</span>
              </div>
            )}
            {transactionId && (
              <div className="pt-2 border-t border-gray-100">
                <span className="block text-xs text-gray-400 mb-0.5">Transaction ID</span>
                <span className="block font-mono text-xs text-gray-600 break-all">{transactionId}</span>
              </div>
            )}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                const text = pet
                  ? `I just donated NPR ${amount} to help ${pet.name} at ${shelter?.name ?? "a rescue shelter"} via PetMate! 🐾💛`
                  : `I just donated via PetMate to help pets in need! 🐾`;
                if (navigator.share) {
                  navigator.share({ title: "PetMate Donation", text });
                } else {
                  navigator.clipboard.writeText(text);
                }
              }}
              icon={<Share2 className="w-4 h-4" />}
            >
              Share Your Impact
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              fullWidth 
              onClick={() => navigate("/profile?tab=donations")} 
              icon={<MessageSquare className="w-4 h-4" />}
              style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              Leave a message
            </Button>
            <Button variant="outline" size="lg" fullWidth onClick={() => navigate("/donate")} icon={<Heart className="w-4 h-4" />}>
              Donate Again
            </Button>
            <button onClick={() => navigate("/")} className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 mt-1">
              <Home className="w-3.5 h-3.5" /> Return Home
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
