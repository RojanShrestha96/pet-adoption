import Pet from "../models/Pet.js";

// Create a new pet (Shelter only)
export const createPet = async (req, res) => {
  try {
    const shelterId = req.user.userId;
    
    const {
      name,
      species,
      breed,
      age,
      gender,
      size,
      weight,
      description,
      images,
      isVaccinated,
      vaccinationDate,
      isMicrochipped,
      microchipId,
      isNeutered,
      isDewormed,
      dewormingDate,
      lastVetCheckup,
      healthStatus,
      medicalNotes,
      otherConditions,
      medicalDocuments,
      temperament,
      goodWithKids,
      goodWithPets,
      apartmentFriendly
    } = req.body;

    const pet = new Pet({
      name,
      species,
      breed,
      age,
      gender,
      size,
      weight,
      description,
      images: images || [],
      medical: {
        isVaccinated,
        vaccinationDate: vaccinationDate || null,
        isMicrochipped,
        microchipId: microchipId || null,
        isNeutered,
        isDewormed,
        dewormingDate: dewormingDate || null,
        lastVetCheckup: lastVetCheckup || null,
        healthStatus: healthStatus || 'healthy',
        medicalNotes: medicalNotes || '',
        otherConditions: otherConditions || [],
        medicalDocuments: medicalDocuments || []
      },
      temperament: temperament || [],
      compatibility: {
        goodWithKids: goodWithKids || false,
        goodWithPets: goodWithPets || false,
        apartmentFriendly: apartmentFriendly || false
      },
      shelter: shelterId,
      adoptionStatus: 'pending-review',
      reviewStatus: 'pending'
    });

    await pet.save();

    res.status(201).json({
      message: "Pet submitted for review successfully",
      pet
    });
  } catch (error) {
    console.error("Error creating pet:", error);
    res.status(500).json({ message: "Failed to create pet", error: error.message });
  }
};

// Get all pets for the logged-in shelter
export const getShelterPets = async (req, res) => {
  try {
    const shelterId = req.user.userId;
    const { status, species } = req.query;

    const query = { shelter: shelterId };
    
    if (status && status !== 'all') {
      query.adoptionStatus = status;
    }
    
    if (species && species !== 'all') {
      if (species === 'other') {
        query.species = { $nin: ['dog', 'cat'] };
      } else {
        query.species = species;
      }
    }

    const pets = await Pet.find(query).sort({ createdAt: -1 });

    res.json(pets);
  } catch (error) {
    console.error("Error fetching shelter pets:", error);
    res.status(500).json({ message: "Failed to fetch pets" });
  }
};

// Get a single pet by ID
export const getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id).populate('shelter', 'name email phone location');

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Increment views
    pet.views += 1;
    await pet.save();

    res.json(pet);
  } catch (error) {
    console.error("Error fetching pet:", error);
    res.status(500).json({ message: "Failed to fetch pet" });
  }
};

// Update a pet (Shelter only, their own pets)
export const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const shelterId = req.user.userId;

    const pet = await Pet.findOne({ _id: id, shelter: shelterId });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or unauthorized" });
    }

    // Update fields
    const updateFields = req.body;
    Object.keys(updateFields).forEach(key => {
      if (key === 'medical' || key === 'compatibility') {
        pet[key] = { ...pet[key], ...updateFields[key] };
      } else {
        pet[key] = updateFields[key];
      }
    });

    // If pet was rejected and is being resubmitted, reset review status
    if (pet.reviewStatus === 'rejected') {
      pet.reviewStatus = 'pending';
      pet.adoptionStatus = 'pending-review';
    }

    await pet.save();

    res.json({ message: "Pet updated successfully", pet });
  } catch (error) {
    console.error("Error updating pet:", error);
    res.status(500).json({ message: "Failed to update pet" });
  }
};

// Delete a pet (Shelter only, their own pets)
export const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const shelterId = req.user.userId;

    const pet = await Pet.findOneAndDelete({ _id: id, shelter: shelterId });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or unauthorized" });
    }

    res.json({ message: "Pet deleted successfully" });
  } catch (error) {
    console.error("Error deleting pet:", error);
    res.status(500).json({ message: "Failed to delete pet" });
  }
};

// Get all approved pets (Public - for adopters)
export const getApprovedPets = async (req, res) => {
  try {
    const { species, status, search, page = 1, limit = 12 } = req.query;

    const query = { 
      reviewStatus: 'approved',
      adoptionStatus: { $in: ['available', 'pending'] }
    };

    if (species && species !== 'all') {
      if (species === 'other') {
        query.species = { $nin: ['dog', 'cat'] };
      } else {
        query.species = species;
      }
    }

    if (status && status !== 'all') {
      query.adoptionStatus = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pets = await Pet.find(query)
      .populate('shelter', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Pet.countDocuments(query);

    res.json({
      pets,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({ message: "Failed to fetch pets" });
  }
};

// Admin: Get pets pending review
export const getPendingReviewPets = async (req, res) => {
  try {
    const pets = await Pet.find({ reviewStatus: 'pending' })
      .populate('shelter', 'name email')
      .sort({ createdAt: -1 });

    res.json(pets);
  } catch (error) {
    console.error("Error fetching pending pets:", error);
    res.status(500).json({ message: "Failed to fetch pending pets" });
  }
};

// Admin: Approve or reject a pet
export const reviewPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'
    const adminId = req.user.userId;

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (action === 'approve') {
      pet.reviewStatus = 'approved';
      pet.adoptionStatus = 'available';
    } else if (action === 'reject') {
      pet.reviewStatus = 'rejected';
      pet.adoptionStatus = 'rejected';
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    pet.reviewNotes = notes || '';
    pet.reviewedBy = adminId;
    pet.reviewedAt = new Date();

    await pet.save();

    res.json({ 
      message: `Pet ${action}d successfully`, 
      pet 
    });
  } catch (error) {
    console.error("Error reviewing pet:", error);
    res.status(500).json({ message: "Failed to review pet" });
  }
};
