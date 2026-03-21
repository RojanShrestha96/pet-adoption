
import crypto from "crypto";
import Donation from "../models/Donation.js";
import Pet from "../models/Pet.js";
import Shelter from "../models/Shelter.js";
import Notification from "../models/Notification.js";

// For sandbox, these values are standard. In production, these should come from .env
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q"; 
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; 

export const initiatePayment = async (req, res) => {
  try {
    const { amount, petId, donorName, donorEmail, message, userId } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    // Derive shelterId from petId
    let shelterId = null;
    let petData = null;

    if (petId) {
      petData = await Pet.findById(petId).populate("shelter", "name");
      if (petData && petData.shelter) {
        shelterId = petData.shelter._id;
      }
    }

    // Prepare eSewa form data
    const transactionUuid = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const productCode = ESEWA_PRODUCT_CODE;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;
    const taxAmount = 0;
    const totalAmount = amount + taxAmount + productServiceCharge + productDeliveryCharge;

    // Create Donation Record with 'pending' status
    const newDonation = new Donation({
      type: petId ? "pet" : "general",
      petId: petId || null,
      shelterId: shelterId || null,
      userId: userId || null,
      amount,
      donorName: donorName || "Anonymous",
      donorEmail,
      message,
      transactionUuid,
      status: "pending",
      paymentMethod: "esewa"
    });

    await newDonation.save();

    // Fields to sign: total_amount, transaction_uuid, product_code
    const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    
    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac("sha256", ESEWA_SECRET_KEY)
      .update(signatureString)
      .digest("base64");

    const paymentData = {
      amount: amount,
      failure_url: `${FRONTEND_URL}/payment/failure`,
      product_delivery_charge: productDeliveryCharge,
      product_service_charge: productServiceCharge,
      product_code: productCode,
      signature: signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: `${FRONTEND_URL}/payment/success`,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
    };

    res.status(200).json({
      success: true,
      donation: newDonation,
      data: paymentData,
      url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form" // Sandbox URL
    });

  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { data } = req.query;
    
    if (!data) {
        return res.status(400).json({ success: false, message: "Data is required" });
    }

    // Decode base64 data
    const decodedBuffer = Buffer.from(data, 'base64');
    const decodedString = decodedBuffer.toString('utf-8');
    const decodedData = JSON.parse(decodedString);
    
    const { transaction_uuid, total_amount, status } = decodedData;

    // Find donation by transactionUuid
    const donation = await Donation.findOne({ transactionUuid: transaction_uuid })
      .populate("petId", "name donationStory images")
      .populate("shelterId", "name");

    if (!donation) {
        return res.status(404).json({ success: false, message: "Donation not found" });
    }

    // Check if payment was completed
    if (status !== "COMPLETE") {
        donation.status = "failed";
        await donation.save();
        return res.status(400).json({ success: false, message: "Payment not complete" });
    }

    // Verify amount matches (prevent tampering)
    if (parseFloat(total_amount) !== donation.amount) {
         console.error("Amount mismatch - Possible tampering!", { 
           expected: donation.amount, 
           received: total_amount 
         });
         donation.status = "failed";
         await donation.save();
         return res.status(400).json({ 
           success: false, 
           message: "Payment amount mismatch" 
         });
    }

    // All checks passed - Mark donation as completed
    donation.status = "completed";
    await donation.save();

    // Create a Notification if this donation was linked to a user
    if (donation.userId) {
      try {
        const petName = donation.petId?.name || null;
        await Notification.create({
          recipient: donation.userId,
          recipientType: "adopter",
          type: "success",
          title: "Donation Successful! 💛",
          message: petName
            ? `You just helped ${petName} get the care they need! Your Rs ${donation.amount} donation has been received. Thank you for your kindness.`
            : `Thank you! Your Rs ${donation.amount} donation has been received and will help pets in need.`,
          relatedLink: "/profile"
        });
        console.log(`[Notification] Donation success notification sent to user ${donation.userId}`);
      } catch (err) {
        console.error("Failed to create donation notification:", err);
      }
    } else {
      console.log("[Notification] No userId on donation — skipping notification.");
    }

    // Increment pet donation count
    if (donation.petId) {
      await Pet.findByIdAndUpdate(donation.petId._id || donation.petId, {
        $inc: { donationCount: 1 }
      });
    }

    // Increment shelter funds
    if (donation.shelterId) {
      await Shelter.findByIdAndUpdate(donation.shelterId._id || donation.shelterId, {
        $inc: { 
          totalFundsAllocated: donation.amount,
          pendingPayout: donation.amount
        }
      });
    }



    res.status(200).json({ 
      success: true, 
      message: "Payment verified successfully", 
      donation,
      pet: donation.petId,
      shelter: donation.shelterId
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

// Handle payment failure (when user cancels or payment fails)
export const handlePaymentFailure = async (req, res) => {
  try {
    const { transactionUuid } = req.body;
    
    if (!transactionUuid) {
      return res.status(400).json({ success: false, message: "Transaction UUID is required" });
    }

    const donation = await Donation.findOne({ transactionUuid });

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    // Mark as failed
    donation.status = "failed";
    await donation.save();

    res.status(200).json({ success: true, message: "Payment marked as failed", donation });

  } catch (error) {
    console.error("Payment failure handler error:", error);
    res.status(500).json({ success: false, message: "Error handling payment failure" });
  }
};
