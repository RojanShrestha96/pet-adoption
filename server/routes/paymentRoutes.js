
import express from "express";
import { initiatePayment, verifyPayment, handlePaymentFailure } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/esewa/initiate", initiatePayment);
router.get("/esewa/verify", verifyPayment);
router.post("/esewa/failure", handlePaymentFailure);

export default router;
