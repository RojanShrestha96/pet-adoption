import Pet from "../models/Pet.js";
import Shelter from "../models/Shelter.js";
import Notification from "../models/Notification.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import AdopterProfile from "../models/AdopterProfile.js";
import { notifyAllAdmins } from "./notificationController.js";
import { calculateCompatibility } from "./compatibilityController.js";
import { generateAdopterInsights } from "../services/aiService.js";

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
      apartmentFriendly,
      behaviour,
      environment,
      estimatedMonthlyCost,
      energyLevel,
      independenceTolerance,
      spaceNeeds,
      vaccinations,
      vaccinationStatus
    } = req.body;

    const pet = new Pet({
      name,
      species,
      breed,
      age,
      gender,
      size: size || undefined,
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
        medicalDocuments: medicalDocuments || [],
        vaccinations: vaccinations || [],
        vaccinationStatus: vaccinationStatus || 'unknown'
      },
      temperament: temperament || [],
      compatibility: {
        goodWithKids: goodWithKids || 'yes',
        goodWithPets: goodWithPets || 'yes',
        apartmentFriendly: apartmentFriendly || false
      },
      behaviour: behaviour || {},
      environment: environment || {},
      estimatedMonthlyCost: estimatedMonthlyCost || 0,
      energyLevel: energyLevel || undefined,
      independenceTolerance: independenceTolerance || undefined,
      spaceNeeds: spaceNeeds || undefined,
      shelter: shelterId,
      adoptionStatus: 'pending-review',
      reviewStatus: 'pending'
    });

    await pet.save();

    // Populate shelter info for notification
    await pet.populate('shelter', 'name');
    const shelterName = pet.shelter?.name || 'A shelter';

    // Create notification for the shelter
    await Notification.create({
      recipient: shelterId,
      recipientType: 'shelter',
      type: 'pet',
      title: 'Pet Submitted for Review',
      message: `Your pet "${pet.name}" has been successfully submitted and is pending admin review.`,
      relatedLink: `/shelter/manage-pets`
    });

    // Notify all admins about new pet submission
    await notifyAllAdmins(
      'pet',
      'New Pet Submitted',
      `${shelterName} has submitted a new pet "${pet.name}" (${species}) for review.`,
      `/admin/shelters/${shelterId}`
    );

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

    // Use findByIdAndUpdate for the view increment so we never run Mongoose
    // schema validation against stale/legacy data already in the DB.
    const pet = await Pet.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('shelter', 'name email phone location');

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

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

    // Store previous status to determine if this is an edit
    const wasApproved = pet.reviewStatus === 'approved';

    // Update fields
    const updateFields = req.body;
    Object.keys(updateFields).forEach(key => {
      // Handle empty strings for optional enum fields
      if ((key === 'size' || key === 'energyLevel' || key === 'spaceNeeds') && updateFields[key] === "") {
        pet[key] = undefined;
        return;
      }

      // Special handling for nested objects to prevent data loss
      if (['medical', 'compatibility', 'behaviour', 'environment', 'age'].includes(key) && typeof updateFields[key] === 'object') {
        const nestedData = updateFields[key];
        Object.keys(nestedData).forEach(subKey => {
          // Access the nested path: pet.medical.healthStatus etc.
          if (!pet[key]) pet[key] = {};
          pet[key][subKey] = nestedData[subKey];
        });
      } else {
        pet[key] = updateFields[key];
      }
    });

    // ALWAYS reset pet to pending review on any edit (requires admin re-approval)
    pet.reviewStatus = 'pending';
    pet.adoptionStatus = 'pending-review';

    await pet.save();

    // Populate shelter info for notifications
    await pet.populate('shelter', 'name');
    const shelterName = pet.shelter?.name || 'A shelter';

    // Notify shelter about edit submission
    await Notification.create({
      recipient: shelterId,
      recipientType: 'shelter',
      type: 'info',
      title: 'Pet Edit Submitted',
      message: `Your changes to "${pet.name}" have been submitted and are pending admin re-approval.`,
      relatedLink: `/shelter/manage-pets`
    });

    // Notify all admins about pet edit
    const editType = wasApproved ? 'edited an approved' : 'updated a';
    await notifyAllAdmins(
      'pet',
      'Pet Updated - Review Required',
      `${shelterName} has ${editType} pet "${pet.name}" (${pet.species}). Please review the changes.`,
      `/admin/shelters/${shelterId}`
    );

    res.json({ message: "Pet updated successfully and submitted for re-approval", pet });
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

    // Find ALL applications for this pet (any status) to notify adopters before deleting
    const allApplications = await AdoptionApplication.find({ pet: id })
      .populate('adopter', 'name email');

    if (allApplications.length > 0) {
      // Notify all applicants that the pet profile was removed
      const notificationPromises = allApplications
        .filter(app => app.adopter) // only if adopter still exists
        .map(app =>
          Notification.create({
            recipient: app.adopter._id,
            recipientType: 'adopter',
            type: 'warning',
            title: 'Application Closed',
            message: `The profile for ${pet.name} has been removed by the shelter. Your application has been automatically closed.`,
          })
        );

      await Promise.all(notificationPromises);

      // Hard-delete ALL applications for this pet
      await AdoptionApplication.deleteMany({ pet: id });
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
    const { species, status, search, shelter, page = 1, limit = 12 } = req.query;

    const query = { 
      reviewStatus: 'approved',
      adoptionStatus: { $in: ['available', 'pending'] }
    };

    if (shelter) {
      query.shelter = shelter;
    }

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

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const update = {
      reviewStatus: action === 'approve' ? 'approved' : 'rejected',
      adoptionStatus: action === 'approve' ? 'available' : 'rejected',
      reviewNotes: notes || '',
      reviewedBy: adminId,
      reviewedAt: new Date()
    };

    const pet = await Pet.findByIdAndUpdate(id, update, { new: true, runValidators: false });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Notify the shelter
    const notificationMessage = action === 'approve'
        ? `Great news! Your pet "${pet.name}" has been approved and is now listed as available.`
        : `Update Required: Your pet "${pet.name}" was not approved. Reason: ${notes || 'No reason provided.'}`;

    const notificationType = action === 'approve' ? 'success' : 'warning';

    await Notification.create({
        recipient: pet.shelter,
        recipientType: 'shelter',
        type: notificationType,
        title: action === 'approve' ? 'Pet Approved' : 'Pet Needs Attention',
        message: notificationMessage,
        relatedLink: `/shelter/manage-pets`
    });

    res.json({ 
      message: `Pet ${action}d successfully`, 
      pet 
    });
  } catch (error) {
    console.error("Error reviewing pet:", error);
    res.status(500).json({ message: "Failed to review pet" });
  }
};

/**
 * Get compatibility preview for a pet (Adopter only)
 */
export const getCompatibilityPreview = async (req, res) => {
  try {
    const adopterId = req.user.userId;
    const petId = req.params.id;

    // 1. Get pet
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // 2. Get profile
    const profile = await AdopterProfile.findOne({ adopter: adopterId });
    if (!profile) {
      return res.status(400).json({ message: "Complete your adopter profile to see a preview" });
    }

    // 3. Calculate score
    const compatibilityData = calculateCompatibility(profile, pet);
    const topRiskFlags = compatibilityData.advisories
      .filter(a => a.type === "flag")
      .slice(0, 3)
      .map(a => a.message);

    // 4. Try to find a cached AI insight from any application specifically for this pet+adopter pair
    // We filter out null aiInsights where the adopter summary is present
    const existingApp = await AdoptionApplication.findOne({
      adopter: adopterId,
      pet: petId,
      "aiInsights.adopter": { $ne: null }
    }).select('aiInsights');

    let aiAdopterSummary = existingApp?.aiInsights?.adopter || null;

    // 5. Generate fresh if none exists
    if (!aiAdopterSummary) {
      try {
        const insights = await generateAdopterInsights(compatibilityData, pet, profile);
        aiAdopterSummary = {
          ...insights,
          generatedAt: new Date()
        };
      } catch (err) {
        console.warn("Soft fail: Adopter preview AI generation failed", err);
        // Do not crash the preview if AI fails
      }
    }

    res.json({
      score: compatibilityData.percentage,
      confidenceLevel: compatibilityData.confidenceLevel || "low",
      topRiskFlags,
      aiAdopterSummary,
      cachedAt: new Date()
    });

  } catch (error) {
    console.error("Error generating compatibility preview:", error);
    res.status(500).json({ message: "Failed to generate compatibility preview" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/pets/nearby?lat=&lng=&radius=25&species=&page=1&limit=12
// Returns approved, available pets sorted by distance from a point.
// Shelters without coordinates are automatically excluded by $geoNear.
// ─────────────────────────────────────────────────────────────────────────────
export const getPetsNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 25, species, page = 1, limit = 12 } = req.query;

    // Validate required coordinates
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    console.log(`[NearSearch] Lat: ${latNum}, Lng: ${lngNum}, Radius: ${radius}`);
    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({ message: 'lat and lng are required and must be valid numbers.' });
    }
    // 'null' string means Anywhere — use a very large radius so we still get distances
    const radiusKm = (radius === 'null' || radius === '' || !radius)
      ? 5000
      : Math.min(Math.max(parseFloat(radius) || 25, 1), 5000);
    const pageNum    = Math.max(parseInt(page)  || 1, 1);
    const limitNum   = Math.min(parseInt(limit) || 12, 50);
    const skip       = (pageNum - 1) * limitNum;

    // Build pet-level match condition (applied post-$lookup via dot-prefix)
    const petMatchStage = {
      'pets.reviewStatus':   'approved',
      'pets.adoptionStatus': { $in: ['available', 'pending'] },
    };
    if (species && species !== 'all') {
      petMatchStage['pets.species'] = species === 'other'
        ? { $nin: ['dog', 'cat'] }
        : species;
    }

    // $geoNear MUST be the first stage — requires a 2dsphere index on the collection
    const basePipeline = [
      {
        $geoNear: {
          near:          { type: 'Point', coordinates: [lngNum, latNum] },
          distanceField: 'distanceMeters',
          maxDistance:   radiusKm * 1000, // convert km → metres
          spherical:     true,
          query: {
            // Exclude shelters without geocoded coordinates and sentinel [0,0] values
            'location.coordinates': {
              $exists: true,
              $not: { $size: 0 },
              $nin: [[0, 0]],
            },
          },
        },
      },
      // Join all pets that belong to this shelter
      {
        $lookup: {
          from:         'pets',
          localField:   '_id',
          foreignField: 'shelter',
          as:           'pets',
        },
      },
      // One document per pet
      { $unwind: '$pets' },
      // Apply pet filters
      { $match: petMatchStage },
      // Add distanceKm field (rounded to 1 decimal)
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] },
        },
      },
      // Debug distances
      { $addFields: { debugDist: '$distanceMeters' } },
      // Nearest first
      { $sort: { distanceKm: 1 } },
      // Shape the response
      {
        $project: {
          _id:           '$pets._id',
          name:          '$pets.name',
          species:       '$pets.species',
          breed:         '$pets.breed',
          age:           '$pets.age',
          gender:        '$pets.gender',
          size:          '$pets.size',
          images:        '$pets.images',
          adoptionStatus:'$pets.adoptionStatus',
          temperament:   '$pets.temperament',
          medical:       '$pets.medical',
          compatibility: '$pets.compatibility',
          createdAt:     '$pets.createdAt',
          shelter: {
            _id:      '$_id',
            name:     '$name',
            city:     '$city',
            location: '$location',
          },
          distanceKm: 1,
        },
      },
    ];

    // Run paginated query and count in parallel
    const [pets, countResult] = await Promise.all([
      Shelter.aggregate([...basePipeline, { $skip: skip }, { $limit: limitNum }]),
      Shelter.aggregate([...basePipeline, { $count: 'total' }]),
    ]);

    const total = countResult[0]?.total ?? 0;

    return res.json({
      pets,
      total,
      page:       pageNum,
      totalPages: Math.ceil(total / limitNum),
      radiusKm,
      center: { lat: latNum, lng: lngNum },
    });
  } catch (error) {
    console.error('Error in getPetsNearby:', error);
    res.status(500).json({ message: 'Failed to fetch nearby pets', error: error.message });
  }
};
