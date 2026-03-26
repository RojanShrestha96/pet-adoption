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

// GET ALL PLATFORM USERS (Adopters)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          status: 1,
          statusReason: 1,
          statusUpdatedAt: 1,
          profileImage: 1,
          createdAt: 1,
          applicationsCount: { $size: { $ifNull: ["$applicationsSent", []] } }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Also fetch donation totals for these users
    const donationTotals = await Donation.aggregate([
      { $match: { status: "completed", userId: { $ne: null } } },
      { $group: { _id: "$userId", totalDonated: { $sum: "$amount" } } }
    ]);

    const donationMap = donationTotals.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.totalDonated;
      return acc;
    }, {});

    const usersWithStats = users.map(u => ({
      ...u,
      totalDonated: donationMap[u._id.toString()] || 0
    }));

    res.status(200).json(usersWithStats);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

// GET USER DETAIL PROFILE
export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -emailOTP -resetToken")
      .populate({
        path: "applicationsSent",
        populate: { path: "pet shelter", select: "name" },
        options: { sort: { createdAt: -1 } }
      })
      .populate({
        path: "statusUpdatedBy",
        select: "name role"
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const donations = await Donation.find({ userId: req.params.id, status: "completed" })
      .populate("petId", "name")
      .populate("shelterId", "name")
      .sort({ createdAt: -1 });

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

    res.status(200).json({
      user,
      donations,
      totalDonated
    });
  } catch (error) {
    console.error("Get user detail error:", error);
    res.status(500).json({ message: "Server error fetching user details" });
  }
};

// UPDATE USER STATUS (Warn, Suspend, Ban)
export const updateUserStatus = async (req, res) => {
  try {
    const { status, statusReason } = req.body;
    
    if (!["active", "warned", "suspended", "banned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value provided." });
    }

    // A reason must be given if applying a restrictive status
    if (status !== "active" && (!statusReason || statusReason.trim() === "")) {
      return res.status(400).json({ message: "A reason is required when issuing warnings, suspensions, or bans." });
    }

    const updateData = {
      status,
      statusUpdatedAt: new Date(),
      statusUpdatedBy: req.user.id // Access req.user.id based on verifyToken middleware
    };

    if (statusReason) {
      updateData.statusReason = statusReason;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("name email status statusReason statusUpdatedAt");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: `User account has been marked as ${status}.`,
      user: updatedUser 
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Server error updating user status." });
  }
};

// GET DONATIONS OVERVIEW
export const getDonationsOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Platform Totals
    const platformTotalsAgg = await Donation.aggregate([
      { $match: { status: "completed" } },
      { $group: {
          _id: null,
          allTimeTotal: { $sum: "$amount" },
          avgDonationAmount: { $avg: "$amount" },
          donors: { $addToSet: "$donorEmail" },
          pets: { $addToSet: "$petId" },
          count: { $sum: 1 }
      }}
    ]);

    const monthTotalsAgg = await Donation.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startOfMonth } } },
      { $group: {
          _id: null,
          thisMonthTotal: { $sum: "$amount" },
          thisMonthCount: { $sum: 1 }
      }}
    ]);

    const totals = platformTotalsAgg[0] || { allTimeTotal: 0, avgDonationAmount: 0, donors: [], pets: [], count: 0 };
    const monthTotals = monthTotalsAgg[0] || { thisMonthTotal: 0, thisMonthCount: 0 };

    const platformTotals = {
      allTimeTotal: totals.allTimeTotal,
      thisMonthTotal: monthTotals.thisMonthTotal,
      thisMonthCount: monthTotals.thisMonthCount,
      avgDonationAmount: totals.avgDonationAmount,
      totalDonors: totals.donors.filter(Boolean).length,
      totalPetsHelped: totals.pets.filter(Boolean).length
    };

    // By Shelter
    const byShelterAgg = await Donation.aggregate([
      { $match: { status: "completed", shelterId: { $ne: null } } },
      { $group: {
          _id: "$shelterId",
          totalReceived: { $sum: "$amount" },
          donors: { $addToSet: "$donorEmail" },
          pets: { $addToSet: "$petId" },
          lastDonationDate: { $max: "$createdAt" }
      }}
    ]);

    await Shelter.populate(byShelterAgg, { path: "_id", select: "name city" });
    
    const byShelter = byShelterAgg.map(s => ({
      shelterId: s._id?._id,
      shelterName: s._id?.name || "Unknown",
      shelterCity: s._id?.city || "Unknown",
      totalReceived: s.totalReceived,
      donorCount: s.donors.filter(Boolean).length,
      petCount: s.pets.filter(Boolean).length,
      lastDonationDate: s.lastDonationDate
    })).filter(s => s.shelterId);

    // Recent Transactions
    const recentDocs = await Donation.find({ status: "completed" })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("petId", "name")
      .populate("shelterId", "name");
      
    const recentTransactions = recentDocs.map(d => ({
      transactionUuid: d.transactionUuid,
      amount: d.amount,
      petName: d.petId?.name || "General",
      shelterName: d.shelterId?.name || "Unknown",
      createdAt: d.createdAt,
      status: d.status
    }));

    // Monthly Trend (Last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const trendAgg = await Donation.aggregate([
      { $match: { status: "completed", createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrendMap = new Map();
    
    // Initialize last 6 months to 0
    let curr = new Date(sixMonthsAgo);
    while (curr <= now) {
      const label = `${monthNames[curr.getMonth()]} ${curr.getFullYear()}`;
      monthlyTrendMap.set(label, { month: label, total: 0, count: 0 });
      curr.setMonth(curr.getMonth() + 1);
    }

    trendAgg.forEach(t => {
      const label = `${monthNames[t._id.month - 1]} ${t._id.year}`;
      if (monthlyTrendMap.has(label)) {
        monthlyTrendMap.set(label, { month: label, total: t.total, count: t.count });
      }
    });

    const monthlyTrend = Array.from(monthlyTrendMap.values());

    res.status(200).json({
      platformTotals,
      byShelter,
      recentTransactions,
      monthlyTrend
    });
  } catch (error) {
    console.error("Get donations overview error:", error);
    res.status(500).json({ message: "Server error fetching donations overview" });
  }
};

// EXPORT DONATIONS CSV
export const exportDonationsCsv = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "completed" })
      .sort({ createdAt: -1 })
      .populate("petId", "name")
      .populate("shelterId", "name");

    // PRIVACY: No donor PII in this export
    let csv = "Transaction ID,Amount (Rs),Pet Name,Shelter Name,Date,Status\n";

    donations.forEach(d => {
      const txId = d.transactionUuid || "";
      const amt = d.amount || 0;
      const pet = `"${(d.petId?.name || "General").replace(/"/g, '""')}"`;
      const shelter = `"${(d.shelterId?.name || "Unknown").replace(/"/g, '""')}"`;
      const date = `"${new Date(d.createdAt).toISOString()}"`;
      const status = d.status || "completed";
      
      csv += `${txId},${amt},${pet},${shelter},${date},${status}\n`;
    });

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `petmate-donations-${dateStr}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error("Export donations CSV error:", error);
    res.status(500).json({ message: "Server error exporting donations" });
  }
};
