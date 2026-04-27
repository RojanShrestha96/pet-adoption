import express from "express";
import { testGeolocation, testDistance } from "../controllers/testController.js";

const router = express.Router();

// GET /api/test/geolocation?location=...&compareWith=...&radius=...
router.get("/geolocation", testGeolocation);

// GET /api/test/distance?lat=27.7172&lng=85.3240&radius=50
// Diagnostic: shows per-shelter distances and flags problems (0km, coord swaps, missing coords)
router.get("/distance", testDistance);

export default router;
