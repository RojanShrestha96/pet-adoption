import User from "../models/User.js";
import Shelter from "../models/Shelter.js";
import Pet from "../models/Pet.js";
import Donation from "../models/Donation.js";   

// GET DASHBOARD OVERVIEW STATS
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeShelters = await Shelter.countDocuments({ isVerified: true });
    
    // Check if Pet model exists/is imported correctly, handle potential error if not
    let totalPets = 0;
    let adoptedPets = 0;
    try {
        totalPets = await Pet.countDocuments();
        adoptedPets = await Pet.countDocuments({ status: "adopted" });
    } catch (petError) {
        console.warn("Could not fetch pet stats (Pet model might be missing or different path)", petError);
    }

    const recentShelterCount = await Shelter.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    res.status(200).json({
      totalUsers,
      activeShelters,
      totalPets,
      adoptedPets,
      recentShelterCount,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

// GET ALL SHELTERS FOR MONITORING
export const getAllShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find()
      .select("-password")
      .sort({ createdAt: -1 });
      
    res.status(200).json(shelters);
  } catch (error) {
    console.error("Get shelters error:", error);
    res.status(500).json({ message: "Server error fetching shelters" });
  }
};

// VERIFY OR SUSPEND SHELTER
export const updateShelterStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        // If verifying, check if shelter has documents
        if (isVerified) {
            const shelterToCheck = await Shelter.findById(id);
            if (!shelterToCheck) {
                return res.status(404).json({ message: "Shelter not found" });
            }
            
            if (!shelterToCheck.documentation || shelterToCheck.documentation.length === 0) {
                return res.status(400).json({ 
                    message: "Cannot verify shelter. Required documents are missing." 
                });
            }
        }

        const shelter = await Shelter.findByIdAndUpdate(
            id, 
            { isVerified }, 
            { new: true }
        ).select("-password");

        if (!shelter) {
            return res.status(404).json({ message: "Shelter not found" });
        }

        res.status(200).json({ message: "Shelter status updated", shelter });
    } catch (error) {
        console.error("Update shelter status error:", error);
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

// GET ALL PETS FOR A SPECIFIC SHELTER
export const getShelterPets = async (req, res) => {
    try {
        const pets = await Pet.find({ shelter: req.params.id })
            .sort({ createdAt: -1 });
        res.status(200).json(pets);
    } catch (error) {
        console.error("Get shelter pets error:", error);
        res.status(500).json({ message: "Server error fetching shelter pets" });
    }
};
// GET ALL DONATIONS
export const getAllDonations = async (req, res) => {
    try {
        // Only fetch donations with 'completed' status to ensure payment was verified
        const donations = await Donation.find({ status: "completed" })
            .sort({ createdAt: -1 });
        res.status(200).json(donations);
    } catch (error) {
        console.error("Get donations error:", error);
        res.status(500).json({ message: "Server error fetching donations" });
    }
};
