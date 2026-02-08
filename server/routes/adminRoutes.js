import express from "express";
import { 
    adminLogin, 
    getAdminProfile, 
    createAdmin, 
    getAllAdmins, 
    deleteAdmin,
    updateAdminProfile
} from "../controllers/adminAuthController.js";
import { 
    getDashboardStats, 
    getAllShelters, 
    updateShelterStatus,
    getShelterDetails,
    getShelterPets,
    getAllDonations
} from "../controllers/adminDashboardController.js";
import { verifyToken, requireAdmin, requireSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// AUTH ROUTES
// Public login
router.post("/login", adminLogin);

// Protected routes (require admin token)
router.use(verifyToken, requireAdmin);

// Profile
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);

// SUPER ADMIN ROUTES (manage other admins)
router.post("/create", requireSuperAdmin, createAdmin);
router.get("/all", requireSuperAdmin, getAllAdmins);
router.delete("/:id", requireSuperAdmin, deleteAdmin);

// DASHBOARD STATS
router.get("/stats", getDashboardStats);

// SHELTER MONITORING
router.get("/shelters", getAllShelters);
router.get("/shelters/:id", getShelterDetails);
router.get("/shelters/:id/pets", getShelterPets);
router.patch("/shelters/:id/status", updateShelterStatus);
router.get("/donations", getAllDonations);


export default router;
