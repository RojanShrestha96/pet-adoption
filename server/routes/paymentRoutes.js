
import express from "express";
import { initiatePayment, verifyPayment, handlePaymentFailure } from "../controllers/paymentController.js";
import { verifyToken, requireActiveUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/esewa/initiate", verifyToken, requireActiveUser, initiatePayment);
router.get("/esewa/verify", verifyPayment);
router.post("/esewa/failure", handlePaymentFailure);

export default router;
