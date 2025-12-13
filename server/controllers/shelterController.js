import Shelter from "../models/Shelter.js";

// GET ALL SHELTERS (Public - Limited for Homepage)
export const getAllShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find()
      .select("-password -documentation -preferences")
      .limit(4);
    res.json(shelters);
  } catch (error) {
    console.error("Error fetching shelters:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET SHELTER BY ID (Public)
export const getShelterById = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id).select("-password -documentation -preferences");
    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }
    res.json(shelter);
  } catch (error) {
    console.error("Error fetching shelter:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET SHELTER PROFILE (Dashboard Data)
export const getMyShelterProfile = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.user.userId).select("-password");
    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }
    // Return stats (mock or real if available)
    res.json({
      ...shelter.toObject(),
      stats: {
        totalPets: shelter.totalPets || 0,
        applications: 24, // Mock for now
        adoptions: shelter.adoptionsSheltered || 0,
        views: '1.2k' // Mock
      }
    });
  } catch (error) {
    console.error("Error fetching shelter profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update shelter profile
export const updateShelterProfile = async (req, res) => {
  try {
    const { name, email, phone, address, description, operatingHours, theme, city, state, zipCode } = req.body;
    
    // Validate permission (middleware should handle this, but double check)
    if (req.user.type !== 'shelter') {
      return res.status(403).json({ message: "Only shelters can update this profile" });
    }

    const updatedShelter = await Shelter.findByIdAndUpdate(
      req.user.userId,
      {
        name,
        email,
        phone,
        address,
        description,
        theme,
        city,
        state,
        zipCode,
        location: req.body.location,
        preferences: req.body.preferences,
        documentation: req.body.documentation,
        operatingHours: req.body.operatingHours,
        establishedDate: req.body.establishedDate
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(updatedShelter);
  } catch (error) {
    console.error("Error updating shelter:", error);
    res.status(500).json({ message: "Server error" });
  }
};
