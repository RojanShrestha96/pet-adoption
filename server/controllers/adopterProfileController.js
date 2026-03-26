import User from "../models/User.js";
import AdopterProfile from "../models/AdopterProfile.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import Notification from "../models/Notification.js";
import Shelter from "../models/Shelter.js";
import { geocodeAddress } from "../services/geoService.js";

// ── Tier 2 fields — changes during a pending application trigger shelter notification ──
const TIER_2_FIELDS = [
  "homeType",
  "hasFencedYard",
  "hasChildren",
  "childrenAgeRange",
  "existingPets",
  "landlordPermission",
  "housingTenure",
];

/**
 * Identify which fields have changed between two flat objects.
 * Returns an array of changed field names.
 */
function detectChangedFields(oldObj = {}, newObj = {}) {
  const changed = [];
  const IGNORE = ["_id", "__v", "createdAt", "updatedAt"];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  for (const key of allKeys) {
    if (IGNORE.includes(key)) continue;
    const oldVal = JSON.stringify(oldObj[key] ?? null);
    const newVal = JSON.stringify(newObj[key] ?? null);
    if (oldVal !== newVal) changed.push(key);
  }
  return changed;
}

/**
 * Check whether a livingSizeSqm change is a *decrease* (which triggers Tier 2 notification).
 */
function isDecreasedLivingSize(oldLifestyle, newLifestyle) {
  const oldSqm = oldLifestyle?.livingSizeSqm;
  const newSqm = newLifestyle?.livingSizeSqm;
  if (typeof oldSqm !== "number" || typeof newSqm !== "number") return false;
  return newSqm < oldSqm * 0.9; // >10% decrease
}

/**
 * Check whether workStyle changed to office-based from something more home-friendly.
 */
function isWorkStyleWorsened(oldLifestyle, newLifestyle) {
  const worsens = new Set(["fully-remote", "hybrid"]);
  return (
    worsens.has(oldLifestyle?.workStyle) &&
    newLifestyle?.workStyle === "office-based"
  );
}

/**
 * Check whether upcomingLifeChanges has new items added.
 */
function hasNewLifeChanges(oldLifestyle, newLifestyle) {
  const oldChanges = new Set(oldLifestyle?.upcomingLifeChanges ?? []);
  const newChanges = newLifestyle?.upcomingLifeChanges ?? [];
  return newChanges.some(
    (c) => c !== "none" && !oldChanges.has(c)
  );
}

/**
 * Identify which Tier 2 fields changed across household + lifestyle sections.
 * Returns an array of human-readable field names.
 */
function findTier2Changes(oldProfile, newHousehold, newLifestyle) {
  const changed = [];

  // Household Tier 2 checks
  if (newHousehold) {
    const oldH = oldProfile.household?.toObject?.() ?? oldProfile.household ?? {};
    const householdChanged = detectChangedFields(oldH, newHousehold);
    const tier2Household = householdChanged.filter((f) => TIER_2_FIELDS.includes(f));
    changed.push(...tier2Household);

    // livingSizeSqm decrease check — correctly located in household
    if (isDecreasedLivingSize(oldH, newHousehold)) {
      changed.push("livingSizeSqm (decreased)");
    }
  }

  if (newLifestyle) {
    const oldL = oldProfile.lifestyle?.toObject?.() ?? oldProfile.lifestyle ?? {};

    if (isWorkStyleWorsened(oldL, newLifestyle)) changed.push("workStyle (changed to office-based)");
    if (hasNewLifeChanges(oldL, newLifestyle)) changed.push("upcomingLifeChanges");
  }

  return [...new Set(changed)];
}

/**
 * Send Tier 2 notifications to all shelters with a pending application from this adopter.
 */
async function sendTier2Notifications(adopterId, changedFieldNames, adopterNote) {
  // Find all active pending applications for this adopter
  const pendingApps = await AdoptionApplication.find({
    adopter: adopterId,
    status: { $in: ["pending", "reviewing", "availability_submitted", "meeting_scheduled"] },
  }).populate("pet", "name").populate("shelter", "user name");

  if (!pendingApps.length) return { notified: 0, applications: [] };

  const notificationPromises = pendingApps.map(async (app) => {
    const shelterUserId = app.shelter?.user;
    if (!shelterUserId) return;

    const petName = app.pet?.name ?? "the pet";
    const fieldList = changedFieldNames.join(", ");
    const noteText = adopterNote ? ` Note from applicant: "${adopterNote}"` : "";

    return Notification.create({
      recipient: shelterUserId,
      recipientType: "shelter",
      type: "application",
      title: "Applicant Profile Updated",
      message: `An applicant has updated their profile since submitting their application for ${petName}. Updated fields: ${fieldList}.${noteText}`,
      relatedLink: `/shelter/applications/${app._id}`,
    });
  });

  await Promise.allSettled(notificationPromises);

  return {
    notified: pendingApps.length,
    applications: pendingApps.map((a) => ({
      applicationId: a._id,
      petName: a.pet?.name,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
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
        completionTier: "basic",
        completedSections: [],
        profileVersion: 0,
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

// ─────────────────────────────────────────────────────────────────────────────
/**
 * PUT /auth/adopter-profile
 * Create or patch the adopter's reusable profile.
 * Accepts partial payloads — only provided sections are updated.
 * Always recomputes completionStatus and completionTier after save.
 *
 * Body:
 *   personalInfo?   — partial personalInfo object
 *   household?      — partial household object
 *   lifestyle?      — partial lifestyle object
 *   adopterNote?    — optional free-text note to include in Tier 2 notifications
 */
export const upsertAdopterProfile = async (req, res) => {
  try {
    const adopterId = req.user.userId;
    const { personalInfo, household, lifestyle, adopterNote, location } = req.body;

    let profile = await AdopterProfile.findOne({ adopter: adopterId });
    const isNew = !profile;

    if (!profile) {
      profile = new AdopterProfile({ adopter: adopterId });
    }

    // ── Process Explicit Map Pin Location ──
    if (location && location.lat && location.lng) {
      profile.userLocation = {
        type: 'Point',
        coordinates: [parseFloat(location.lng), parseFloat(location.lat)],
        formattedAddress: location.formattedAddress
      };
    }

    // ── Detect Tier 2 changes BEFORE merging (compare old state) ──
    let tier2Changes = [];
    if (!isNew && (household || lifestyle)) {
      tier2Changes = findTier2Changes(profile, household, lifestyle);
    }

    // ── Merge provided sections (deep patch, not overwrite) ──
    if (personalInfo) {
      profile.personalInfo = { ...profile.personalInfo?.toObject?.() ?? {}, ...personalInfo };
      if (personalInfo.idDocuments?.length) {
        profile.personalInfo.documentsUploadedAt = new Date();
      }
    }

    // ── Pre-process legacy frontend field mappings ──
    if (household && Array.isArray(household.landlordPermission)) {
      household.landlordPermissionDocs = household.landlordPermission;
      delete household.landlordPermission; // V2.1: Prevent array from overwriting legacy boolean field
    }

    if (household) {
      profile.household = { ...profile.household?.toObject?.() ?? {}, ...household };
    }


    if (lifestyle) {
      profile.lifestyle = { ...profile.lifestyle?.toObject?.() ?? {}, ...lifestyle };
    }

    // ── Auto-Geocode Address if personalInfo provided ──
    if (personalInfo && personalInfo.address) {
      // Basic check if it changed (optimization)
      const oldAddress = profile.personalInfo?.toObject?.()?.address;
      if (personalInfo.address !== oldAddress || !profile.userLocation?.coordinates?.length) {
        const geoResult = await geocodeAddress(personalInfo.address + ", Nepal");
        if (geoResult) {
          profile.userLocation = {
            type: 'Point',
            coordinates: [geoResult.lng, geoResult.lat],
            formattedAddress: geoResult.formattedAddress
          };
        } else {
          console.warn(`[AdopterProfile] Geocoding failed for: ${personalInfo.address}`);
        }
      }
    }

    // ── Recompute completion (also sets completionTier) ──
    profile.computeCompletion();

    // ── Save (pre-save hook will increment profileVersion and lastUpdatedAt) ──
    await profile.save();

    // ── Send Tier 2 notifications if needed ──
    let tier2Result = { notified: 0, applications: [] };
    if (tier2Changes.length > 0) {
      tier2Result = await sendTier2Notifications(adopterId, tier2Changes, adopterNote);
    }

    // ── Return updated profile with user identity ──
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
      tier2NotificationSent: tier2Result.notified > 0,
      tier2Notified: tier2Result.applications,
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
