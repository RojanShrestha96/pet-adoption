import User from "../models/User.js";
import Shelter from "../models/Shelter.js";
import Pet from "../models/Pet.js";
import Donation from "../models/Donation.js";
import AdoptionApplication from "../models/AdoptionApplication.js";

// GET DASHBOARD OVERVIEW STATS (enhanced)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeShelters = await Shelter.countDocuments({ isVerified: true });
    const pendingShelters = await Shelter.countDocuments({ 
      isVerified: { $ne: true }, 
      isSuspended: { $ne: true } 
    });
    const suspendedShelters = await Shelter.countDocuments({ isSuspended: true });

    let totalPets = 0;
    let adoptedPets = 0;
    let pendingPetReviews = 0;
    let approvedPets = 0;

    try {
      totalPets = await Pet.countDocuments();
      adoptedPets = await Pet.countDocuments({ adoptionStatus: "adopted" });
      pendingPetReviews = await Pet.countDocuments({ reviewStatus: "pending" });
      approvedPets = await Pet.countDocuments({ reviewStatus: "approved" });
    } catch (petError) {
      console.warn("Could not fetch pet stats", petError);
    }

    let totalDonationsAmount = 0;
    try {
      const donationsAgg = await Donation.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      totalDonationsAmount = donationsAgg[0]?.total || 0;
    } catch (_) {}

    const recentShelterCount = await Shelter.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    res.status(200).json({
      totalUsers,
      activeShelters,
      pendingShelters,
      suspendedShelters,
      totalPets,
      adoptedPets,
      pendingPetReviews,
      approvedPets,
      totalDonationsAmount,
      recentShelterCount,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

export const getAllShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find()
      .select("name email city state address location isVerified isSuspended totalPets createdAt logo coverImage phone")
      .sort({ createdAt: -1 });

    // Aggregation to get both total approved pets and pending pets per shelter
    const petCounts = await Pet.aggregate([
      {
        $group: {
          _id: "$shelter",
          totalApproved: {
            $sum: { $cond: [{ $eq: ["$reviewStatus", "approved"] }, 1, 0] }
          },
          totalPending: {
            $sum: { $cond: [{ $eq: ["$reviewStatus", "pending"] }, 1, 0] }
          }
        }
      }
    ]);

    // Create a map for quick lookup
    const countsMap = petCounts.reduce((acc, curr) => {
      if (curr._id) {
        acc[curr._id.toString()] = {
          approved: curr.totalApproved,
          pending: curr.totalPending
        };
      }
      return acc;
    }, {});

    // Attach counts to each shelter
    const sheltersWithStats = shelters.map(s => {
      const stats = countsMap[s._id.toString()] || { approved: 0, pending: 0 };
      const shelterObj = s.toObject();
      return {
        ...shelterObj,
        totalPets: stats.approved, // Live count of verified pets
        pendingPetsCount: stats.pending, // Live count of pets awaiting review
      };
    });

    res.status(200).json(sheltersWithStats);
  } catch (error) {
    console.error("Get shelters error:", error);
    res.status(500).json({ message: "Server error fetching shelters" });
  }
};

// VERIFY OR UPDATE SHELTER STATUS
export const updateShelterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (isVerified) {
      const shelterToCheck = await Shelter.findById(id);
      if (!shelterToCheck) {
        return res.status(404).json({ message: "Shelter not found" });
      }
      if (!shelterToCheck.documentation || shelterToCheck.documentation.length === 0) {
        return res.status(400).json({
          message: "Cannot verify shelter. Required documents are missing.",
        });
      }
    }

    const updateData = { isVerified };
    if (isVerified) {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = req.admin?._id || req.user?._id;
      updateData.isSuspended = false; // clear suspension on verify
    }

    const shelter = await Shelter.findByIdAndUpdate(id, updateData, { new: true }).select(
      "-password"
    );

    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    res.status(200).json({ message: "Shelter status updated", shelter });
  } catch (error) {
    console.error("Update shelter status error:", error);
    res.status(500).json({ message: "Server error updating shelter" });
  }
};

// SUSPEND OR UNSUSPEND SHELTER
export const suspendShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspended, reason } = req.body;

    const updateData = { isSuspended };
    if (isSuspended) {
      updateData.isVerified = false; // Suspended shelters lose verification
    }

    const shelter = await Shelter.findByIdAndUpdate(id, updateData, { new: true }).select(
      "-password"
    );

    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    res.status(200).json({
      message: isSuspended ? "Shelter suspended" : "Shelter reinstated",
      shelter,
    });
  } catch (error) {
    console.error("Suspend shelter error:", error);
    res.status(500).json({ message: "Server error updating shelter" });
  }
};

// GET SINGLE SHELTER DETAILS
export const getShelterDetails = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id).select("-password");
    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }
    res.status(200).json(shelter);
  } catch (error) {
    console.error("Get shelter details error:", error);
    res.status(500).json({ message: "Server error fetching shelter details" });
  }
};


//  GET TOTAL PETS IN EACH SHELTER


// GET ALL PETS FOR A SPECIFIC SHELTER
export const getShelterPets = async (req, res) => {
  try {
    const pets = await Pet.find({ shelter: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(pets);
  } catch (error) {
    console.error("Get shelter pets error:", error);
    res.status(500).json({ message: "Server error fetching shelter pets" });
  }
};

// GET SHELTER ADMIN STATS (adoption count, pending applications)
export const getShelterAdminStats = async (req, res) => {
  try {
    const { id } = req.params;

    let pendingApplications = 0;
    let totalAdoptions = 0;

    try {
      // Count pending applications for pets belonging to this shelter
      const shelterPets = await Pet.find({ shelter: id }).select("_id");
      const petIds = shelterPets.map((p) => p._id);

      pendingApplications = await AdoptionApplication.countDocuments({
        pet: { $in: petIds },
        status: { $in: ["pending", "reviewing"] },
      });

      totalAdoptions = await AdoptionApplication.countDocuments({
        pet: { $in: petIds },
        status: "approved",
      });
    } catch (err) {
      console.warn("Could not fetch shelter application stats", err);
    }

    res.status(200).json({ pendingApplications, totalAdoptions });
  } catch (error) {
    console.error("Get shelter stats error:", error);
    res.status(500).json({ message: "Server error fetching shelter stats" });
  }
};

// UPDATE ADMIN NOTES FOR A SHELTER
export const updateShelterAdminNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const shelter = await Shelter.findByIdAndUpdate(
      id,
      { adminNotes },
      { new: true }
    ).select("-password");

    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    res.status(200).json({ message: "Admin notes saved", shelter });
  } catch (error) {
    console.error("Update admin notes error:", error);
    res.status(500).json({ message: "Server error saving notes" });
  }
};

// GET PENDING PETS MODERATION QUEUE
export const getPendingPetsQueue = async (req, res) => {
  try {
    const pets = await Pet.find({ reviewStatus: "pending" })
      .populate("shelter", "name email city state isVerified")
      .sort({ createdAt: 1 }) // Oldest first (most urgent)
      .limit(50);

    res.status(200).json(pets);
  } catch (error) {
    console.error("Get pending pets error:", error);
    res.status(500).json({ message: "Server error fetching pending pets" });
  }
};

// GET ALL DONATIONS
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "completed" }).sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({ message: "Server error fetching donations" });
  }
};
