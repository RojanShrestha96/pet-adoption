import Pet from "../models/Pet.js";
import Notification from "../models/Notification.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import { notifyAllAdmins } from "./notificationController.js";

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

    // Store previous status to determine if this is an edit
    const wasApproved = pet.reviewStatus === 'approved';

    // Update fields
    const updateFields = req.body;
    Object.keys(updateFields).forEach(key => {
      // Handle empty strings for optional enum fields like size
      if (key === 'size' && updateFields[key] === "") {
        pet[key] = undefined;
        return;
      }

      if (key === 'medical' || key === 'compatibility') {
        pet[key] = { ...pet[key], ...updateFields[key] };
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

    // Find and reject all pending/reviewing applications for this pet
    const activeApplications = await AdoptionApplication.find({
      pet: id,
      status: { $in: ['pending', 'reviewing', 'meeting_scheduled', 'follow_up_required', 'follow_up_scheduled'] }
    }).populate('adopter', 'name email');

    if (activeApplications.length > 0) {
      // Reject all active applications
      await AdoptionApplication.updateMany(
        { 
          pet: id,
          status: { $in: ['pending', 'reviewing', 'meeting_scheduled', 'follow_up_required', 'follow_up_scheduled'] }
        },
        {
          $set: {
            status: 'rejected',
            rejectionReason: 'The pet profile was removed by the shelter.',
            reviewedBy: shelterId,
            reviewedAt: new Date()
          }
        }
      );

      // Notify all applicants
      const notificationPromises = activeApplications.map(app => 
        Notification.create({
          recipient: app.adopter._id,
          recipientType: 'adopter',
          type: 'warning',
          title: 'Application Closed',
          message: `The profile for ${pet.name} has been removed by the shelter. Your application has been automatically closed.`,
          relatedLink: `/application-tracking/${app._id}`
        })
      );

      await Promise.all(notificationPromises);
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
