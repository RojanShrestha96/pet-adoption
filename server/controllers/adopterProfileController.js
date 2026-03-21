import User from "../models/User.js";
import AdopterProfile from "../models/AdopterProfile.js";

/**
 * GET /auth/adopter-profile
 * Returns the adopter's reusable profile, or null if not yet created.
 */
export const getAdopterProfile = async (req, res) => {
  try {
    const adopterId = req.user.userId;

    // Grab user's identity fields (not stored in AdopterProfile)
    const user = await User.findById(adopterId).select("name email address phone");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await AdopterProfile.findOne({ adopter: adopterId });

    if (!profile) {
      return res.json({
        exists: false,
        completionStatus: "none",
        completedSections: [],
        email: user.email,
        name: user.name,
        // Pre-seed from User model so the form auto-fills on first use
        userAddress: user.address ?? null,
        userPhone: user.phone ?? null,
      });
    }

    return res.json({
      exists: true,
      ...profile.toObject(),
      email: user.email,
      name: user.name,
      userAddress: user.address ?? null,
      userPhone: user.phone ?? null,
    });
  } catch (error) {
    console.error("Error fetching adopter profile:", error);
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

/**
 * PUT /auth/adopter-profile
 * Create or patch the adopter's reusable profile.
 * Accepts partial payloads — only provided sections are updated.
 * Always recomputes completionStatus after save.
 */
export const upsertAdopterProfile = async (req, res) => {
  try {
    const adopterId = req.user.userId;
    const { personalInfo, household, lifestyle } = req.body;

    let profile = await AdopterProfile.findOne({ adopter: adopterId });

    if (!profile) {
      profile = new AdopterProfile({ adopter: adopterId });
    }

    // Merge provided sections (deep patch, not overwrite)
    if (personalInfo) {
      profile.personalInfo = { ...profile.personalInfo?.toObject?.() ?? {}, ...personalInfo };
      if (personalInfo.idDocuments?.length) {
        profile.personalInfo.documentsUploadedAt = new Date();
      }
    }

    if (household) {
      profile.household = { ...profile.household?.toObject?.() ?? {}, ...household };
    }

    if (lifestyle) {
      profile.lifestyle = { ...profile.lifestyle?.toObject?.() ?? {}, ...lifestyle };
    }

    profile.lastUpdated = new Date();

    // Compute completion before saving
    profile.computeCompletion();

    await profile.save();

    // Add user identity fields for convenience
    const user = await User.findById(adopterId).select("name email address phone");

    return res.json({
      message: "Profile saved successfully",
      profile: {
        ...profile.toObject(),
        email: user.email,
        name: user.name,
        userAddress: user.address ?? null,
        userPhone: user.phone ?? null,
      },
    });
  } catch (error) {
    console.error("Error upserting adopter profile:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Failed to save profile", error: error.message });
  }
};
