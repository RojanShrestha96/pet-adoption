import express from "express";
import { 
    adminLogin, 
    getAdminProfile, 
    createAdmin, 
    getAllAdmins, 
    deleteAdmin,
    updateAdminProfile
} from "../controllers/adminAuthController.js";
import { verifyToken, requireAdmin, requireSuperAdmin } from "../middleware/authMiddleware.js";
import { 
    getDashboardStats, 
    getAllShelters, 
    updateShelterStatus,
    suspendShelter,
    getShelterDetails,
    getShelterPets,
    getShelterAdminStats,
    updateShelterAdminNotes,
    getPendingPetsQueue,
    getAllDonations,
    getDonationsOverview,
    exportDonationsCsv,
    getAllUsers,
    getUserDetail,
    updateUserStatus
} from "../controllers/adminDashboardController.js";

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
router.get("/shelters/:id/stats", getShelterAdminStats);
router.patch("/shelters/:id/status", updateShelterStatus);
router.patch("/shelters/:id/suspend", suspendShelter);
router.put("/shelters/:id/notes", updateShelterAdminNotes);

// MODERATION QUEUE
router.get("/moderation/pets", getPendingPetsQueue);

// DONATIONS
router.get("/donations", getAllDonations);
router.get("/donations/overview", getDonationsOverview);
router.get("/donations/export", exportDonationsCsv);

// USER MANAGEMENT
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetail);
router.patch("/users/:id/status", updateUserStatus);

export default router;
