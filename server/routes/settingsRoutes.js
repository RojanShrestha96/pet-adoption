import express from "express";
import SystemSettings from "../models/SystemSettings.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/settings/public - Public route to fetch system settings
router.get("/public", async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
});

// PUT /api/settings - Admin only route to update settings
router.put("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }
    
    if (req.body.compatibilityIntelligenceEnabled !== undefined) {
      settings.compatibilityIntelligenceEnabled = req.body.compatibilityIntelligenceEnabled;
    }

    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
});

export default router;
