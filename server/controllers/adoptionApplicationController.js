import mongoose from "mongoose";
import AdoptionApplication from "../models/AdoptionApplication.js";
import Pet from "../models/Pet.js";
import Notification from "../models/Notification.js";
import AdopterProfile from "../models/AdopterProfile.js";
import { calculateCompatibility } from "./compatibilityController.js";
import { generateShelterInsights, generateAdopterInsights } from "../services/aiService.js";

/**
 * Emit a new notification to a user's socket room immediately after DB write.
 * @param {import('http').Server & { get: Function }} app - Express app (for io access)
 * @param {string} recipientId - MongoDB ObjectId string of the recipient
 * @param {object} notification - The saved Mongoose document
 */
function emitNotification(app, recipientId, notification) {
  try {
    const io = app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('new_notification', notification.toObject ? notification.toObject() : notification);
    }
  } catch (e) {
    // Never crash the request if socket emit fails
    console.warn('Socket emit failed for notification:', e.message);
  }
}

/**
 * Create a new adoption application (Adopters only)
 */
export const createApplication = async (req, res) => {
  try {
    const adopterId = req.user.userId;
    const {
      petId,
      screening,
      personalInfo,
      household,
      adoptionIntent,
      agreeToTerms
    } = req.body;

    // Validate required fields
    if (!petId || !screening || !personalInfo || !household || !adoptionIntent) {
      return res.status(400).json({
        message: "Missing required fields. Please complete all sections of the application."
      });
    }

    // Verify pet exists and is available
    const pet = await Pet.findById(petId).populate('shelter', 'name email');
    
    if (!pet) {
      return res.status(404).json({
        message: "Pet not found"
      });
    }

    if (pet.adoptionStatus !== 'available') {
      return res.status(400).json({
        message: `This pet is currently ${pet.adoptionStatus} and not available for adoption applications.`
      });
    }

    if (pet.reviewStatus !== 'approved') {
      return res.status(400).json({
        message: "This pet has not been approved for adoption yet."
      });
    }

    // Check if adopter already has an application for this pet
    const existingApplication = await AdoptionApplication.findOne({
      pet: petId,
      adopter: adopterId
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already submitted an application for this pet.",
        applicationId: existingApplication._id
      });
    }

    // Validate age requirement
    if (personalInfo.age < 18) {
      return res.status(400).json({
        message: "You must be at least 18 years old to adopt a pet."
      });
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      return res.status(400).json({
        message: "You must agree to the terms and conditions to submit an application."
      });
    }

    // Create the application
    const application = new AdoptionApplication({
      pet: petId,
      shelter: pet.shelter,
      adopter: adopterId,
      screening,
      personalInfo,
      household,
      adoptionIntent,
      agreeToTerms,
      status: 'pending'
    });

    await application.save();

    // Trigger AI insights generation in the background (fire-and-forget)
    (async () => {
      try {
        const profileData = application.profileSnapshot || (await AdopterProfile.findOne({ adopter: adopterId }));
        if (profileData && application.pet) {
          const compatibilityScore = calculateCompatibility(profileData, application.pet);
          
          // Generate Adopter Insights
          generateAdopterInsights(compatibilityScore, application.pet, profileData)
            .then(async (insights) => {
              application.aiInsights = { 
                ...application.aiInsights,
                adopter: { ...insights, status: 'success', generatedAt: new Date() } 
              };
              await application.save();
            }).catch(e => console.error("Async Adopter AI Insight error:", e));

          // Generate Shelter Insights
          generateShelterInsights(compatibilityScore, application.pet, profileData)
            .then(async (insights) => {
              application.aiInsights = { 
                ...application.aiInsights,
                shelter: { ...insights, status: 'success', generatedAt: new Date() } 
              };
              await application.save();
            }).catch(e => console.error("Async Shelter AI Insight error:", e));
        }
      } catch (err) {
        console.error("Background AI generation trigger error:", err);
      }
    })();

    // Create notification for shelter
    const shelterName = pet.shelter.name || 'A shelter';
    const shelterNotif = await Notification.create({
      recipient: pet.shelter._id,
      recipientType: 'shelter',
      type: 'application',
      title: 'New Adoption Application Received',
      message: `${personalInfo.fullName} has submitted an adoption application for ${pet.name}.`,
      relatedLink: `/shelter/applications/${application._id}`
    });
    emitNotification(req.app, pet.shelter._id.toString(), shelterNotif);

    // Create confirmation notification for adopter
    const adopterNotif = await Notification.create({
      recipient: adopterId,
      recipientType: 'adopter',
      type: 'success',
      title: 'Application Submitted Successfully',
      message: `Your adoption application for ${pet.name} has been submitted to ${shelterName}. The shelter will review your application and contact you soon.`,
      relatedLink: `/application-tracking/${application._id}`
    });
    emitNotification(req.app, adopterId.toString(), adopterNotif);

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });

  } catch (error) {
    console.error("Error creating adoption application:", error);
    
    // Handle duplicate key error (unique index violation)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already submitted an application for this pet."
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: messages
      });
    }

    res.status(500).json({
      message: "Failed to submit application. Please try again.",
      error: error.message
    });
  }
};

/**
 * Get all applications for shelter's pets (Shelter only)
 */
export const getShelterApplications = async (req, res) => {
  try {
    const shelterId = req.user.userId;
    const { status, petId, search, page = 1, limit = 50 } = req.query;

    // Build query
    const query = { shelter: shelterId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (petId) {
      query.pet = petId;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await AdoptionApplication.find(query)
      .populate('pet', 'name species images')
      .populate('adopter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AdoptionApplication.countDocuments(query);

    res.json({
      applications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    console.error("Error fetching shelter applications:", error);
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message
    });
  }
};

/**
 * Get a single application by ID (Shelter only - must own the pet)
 */
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const shelterId = req.user.userId;

    const application = await AdoptionApplication.findOne({
      _id: id,
      shelter: shelterId
    })
      .populate('pet', 'name species breed age gender images size')
      .populate('adopter', 'name email')
      .populate('shelter', 'name email phone location');

    if (!application) {
      return res.status(404).json({
        message: "Application not found or you do not have permission to view it"
      });
    }

    // Use snapshot if available, else fetch the live profile for backward compatibility
    let profileData = application.profileSnapshot;
    if (!profileData) {
      profileData = await AdopterProfile.findOne({ adopter: application.adopter._id });
    }

    let compatibilityScore = null;
    if (application.pet && profileData) {
      compatibilityScore = calculateCompatibility(profileData, application.pet);
    }

    // AI Insights Generation (Shelter) - BACKGROUND TRIGGER
    if (compatibilityScore && (!application.aiInsights?.shelter?.explanation || application.aiInsights?.shelter?.status === 'none' || application.aiInsights?.shelter?.status === 'error')) {
      if (!application.aiInsights) application.aiInsights = {};
      
      // Set generating status and return immediately
      application.aiInsights.shelter = { 
        ...application.aiInsights.shelter,
        status: 'generating',
        error: null 
      };
      await application.save();

      // Trigger generation in background
      (async () => {
        try {
          const shelterInsights = await generateShelterInsights(compatibilityScore, application.pet, profileData);
          const currentApp = await AdoptionApplication.findById(application._id);
          if (currentApp) {
            currentApp.aiInsights.shelter = {
              ...shelterInsights,
              status: 'success',
              error: null,
              generatedAt: new Date()
            };
            await currentApp.save();
          }
        } catch (aiErr) {
          console.error("Async AI Insight generation failed for shelter:", aiErr);
          const currentApp = await AdoptionApplication.findById(application._id);
          if (currentApp) {
            currentApp.aiInsights.shelter = {
              ...currentApp.aiInsights.shelter,
              status: 'error',
              error: "AI Insights temporarily unavailable."
            };
            await currentApp.save();
          }
        }
      })();
    }

    const responseData = application.toObject();
    responseData.compatibilityScore = compatibilityScore;

    res.json(responseData);

  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({
      message: "Failed to fetch application",
      error: error.message
    });
  }
};

/**
 * Update application status (Shelter only)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const shelterId = req.user.userId;
    const { status, notes, scheduledDate, scheduledTime, rejectionReason } = req.body;

    // Validate status
    const validStatuses = [
      'pending', 
      'reviewing', 
      'approved', 
      'availability_submitted', 
      'meeting_scheduled', 
      'meeting_completed', 
      'completed', 
      'rejected'
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(', ')
      });
    }

    const application = await AdoptionApplication.findOne({
      _id: id,
      shelter: shelterId
    }).populate('pet', 'name').populate('adopter', 'name email');

    if (!application) {
      return res.status(404).json({
        message: "Application not found or you do not have permission to update it"
      });
    }

    // Update fields
    application.status = status;
    
    if (notes !== undefined) {
      application.notes = notes;
    }
    
    if (scheduledDate) {
      application.scheduledDate = scheduledDate;
    }
    
    if (scheduledTime) {
      application.scheduledTime = scheduledTime;
    }
    
    if (status === 'rejected' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }
    
    application.reviewedBy = shelterId;
    application.reviewedAt = new Date();
    
    // If application was previously completed and is now being changed to something else
    if (application.status === 'completed' && status !== 'completed') {
       // Revert pet adoption status
       const pet = await Pet.findById(application.pet);
       if (pet) {
         pet.adoptionStatus = 'available';
         await pet.save();
       }
       
       // Clear completedAt if reverting
       application.completedAt = undefined;
    }

    if (status === 'completed') {
      application.completedAt = new Date();
      
      // Update pet adoption status
      const pet = await Pet.findById(application.pet);
      if (pet) {
        pet.adoptionStatus = 'adopted';
        await pet.save();

        // REJECT ALL OTHER APPLICANTS FOR THIS PET
        const otherApplications = await AdoptionApplication.find({
          pet: application.pet,
          _id: { $ne: application._id }, // Exclude current application
          status: { $nin: ['completed', 'rejected'] } // Only active applications
        }).populate('adopter', 'name email');

        if (otherApplications.length > 0) {
          // Bulk update status to rejected
          await AdoptionApplication.updateMany(
            {
              pet: application.pet,
              _id: { $ne: application._id },
              status: { $nin: ['completed', 'rejected'] }
            },
            {
              $set: {
                status: 'rejected',
                rejectionReason: 'This pet has been adopted by another applicant.',
                reviewedBy: shelterId,
                reviewedAt: new Date()
              }
            }
          );

          // Notify each rejected applicant and emit via socket
          const notificationPromises = otherApplications.map(async (otherApp) => {
            const notif = await Notification.create({
              recipient: otherApp.adopter._id,
              recipientType: 'adopter',
              type: 'warning',
              title: 'Application Update',
              message: `The pet ${pet.name} has been adopted by another family. We know this is disappointing, but there are many other pets waiting for a home.`,
              relatedLink: `/application-tracking/${otherApp._id}`
            });
            emitNotification(req.app, otherApp.adopter._id.toString(), notif);
            return notif;
          });

          await Promise.all(notificationPromises);
        }
      }
    }

    await application.save();

    // Create notification for adopter based on status
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = 'info';

    switch (status) {
      case 'reviewing':
        notificationTitle = 'Application Under Review';
        notificationMessage = `Your adoption application for ${application.pet.name} is now being reviewed by the shelter.`;
        notificationType = 'info';
        break;
      case 'scheduled':
        notificationTitle = 'Home Visit Scheduled';
        notificationMessage = `Your home visit for ${application.pet.name} has been scheduled for ${scheduledDate}${scheduledTime ? ` at ${scheduledTime}` : ''}.`;
        notificationType = 'success';
        break;
      case 'approved':
        notificationTitle = 'Application Approved!';
        notificationMessage = `Congratulations! Your adoption application for ${application.pet.name} has been approved. The shelter will contact you to finalize the adoption.`;
        notificationType = 'success';
        break;
      case 'rejected':
        notificationTitle = 'Application Update';
        notificationMessage = `Unfortunately, your application for ${application.pet.name} was not approved at this time. ${rejectionReason || 'Please contact the shelter for more information.'}`;
        notificationType = 'warning';
        break;
      case 'completed':
        notificationTitle = 'Adoption Completed!';
        notificationMessage = `Congratulations on adopting ${application.pet.name}! Thank you for giving them a loving home.`;
        notificationType = 'success';
        break;
    }

    if (notificationTitle) {
      const statusNotif = await Notification.create({
        recipient: application.adopter._id,
        recipientType: 'adopter',
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        relatedLink: `/application-tracking/${application._id}`
      });
      emitNotification(req.app, application.adopter._id.toString(), statusNotif);
    }

    res.json({
      message: "Application status updated successfully",
      application
    });

  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      message: "Failed to update application status",
      error: error.message
    });
  }
};

/**
 * Get adopter's own applications (Adopter only)
 */
export const getAdopterApplications = async (req, res) => {
  try {
    const adopterId = req.user.userId;
    const { status, petId, page = 1, limit = 20 } = req.query;

    const query = { adopter: adopterId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (petId) {
      query.pet = petId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await AdoptionApplication.find(query)
      .populate('pet', 'name species breed images adoptionStatus')
      .populate('shelter', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AdoptionApplication.countDocuments(query);

    res.json({
      applications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    console.error("Error fetching adopter applications:", error);
    res.status(500).json({
      message: "Failed to fetch your applications",
      error: error.message
    });
  }
};

/**
 * Get application stats for shelter dashboard
 */
export const getShelterApplicationStats = async (req, res) => {
  try {
    const shelterId = req.user.userId;

    // Cast to ObjectId — aggregation $match does NOT auto-cast string IDs unlike find()
    const shelterObjectId = new mongoose.Types.ObjectId(shelterId);

    const stats = await AdoptionApplication.aggregate([
      { $match: { shelter: shelterObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      reviewing: 0,
      scheduled: 0,
      approved: 0,
      availability_submitted: 0,
      meeting_scheduled: 0,
      meeting_completed: 0,
      follow_up_required: 0,
      follow_up_scheduled: 0,
      rejected: 0,
      completed: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.json(formattedStats);

  } catch (error) {
    console.error("Error fetching application stats:", error);
    res.status(500).json({
      message: "Failed to fetch application statistics",
      error: error.message
    });
  }
};

/**
 * Get a single application by ID (Adopter only - must be the one who created it)
 */
export const getAdopterApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const adopterId = req.user.userId;

    const application = await AdoptionApplication.findOne({
      _id: id,
      adopter: adopterId
    })
      .populate('pet', 'name species breed age gender images adoptionStatus size')
      .populate('adopter', 'name email')
      .populate('shelter', 'name email phone location');

    if (!application) {
      return res.status(404).json({
        message: "Application not found or you do not have permission to view it"
      });
    }

    let profileData = application.profileSnapshot;
    if (!profileData) {
      // Fallback
      profileData = await AdopterProfile.findOne({ adopter: application.adopter._id });
    }

    let compatibilityScore = null;
    if (application.pet && profileData) {
       compatibilityScore = calculateCompatibility(profileData, application.pet);
    }

    // AI Insights Generation (Adopter) - BACKGROUND TRIGGER
    if (compatibilityScore && (!application.aiInsights || !application.aiInsights.adopter || application.aiInsights.adopter.status === 'none' || application.aiInsights.adopter.status === 'error')) {
      if (!application.aiInsights) application.aiInsights = {};
      
      // Set generating status and return immediately
      application.aiInsights.adopter = {
        ...application.aiInsights.adopter,
        status: 'generating',
        error: null
      };
      await application.save();

      // Trigger generation in background
      (async () => {
        try {
          const adopterInsights = await generateAdopterInsights(compatibilityScore, application.pet, profileData);
          const currentApp = await AdoptionApplication.findById(application._id);
          if (currentApp) {
            currentApp.aiInsights.adopter = {
              ...adopterInsights,
              status: 'success',
              error: null,
              generatedAt: new Date()
            };
            await currentApp.save();
          }
        } catch (aiErr) {
          console.error("Async AI Insight generation failed for adopter:", aiErr);
          const currentApp = await AdoptionApplication.findById(application._id);
          if (currentApp) {
            currentApp.aiInsights.adopter = {
              ...currentApp.aiInsights.adopter,
              status: 'error',
              error: "Insights unavailable."
            };
            await currentApp.save();
          }
        }
      })();
    }

    // Use model method to filter internal data (backend security)
    const safeData = application.getAdopterView();
    if (compatibilityScore) {
       safeData.compatibilityScore = compatibilityScore;
    }
    
    res.json(safeData);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch application",
      error: error.message
    });
  }
};

/**
 * Update document verification status (Shelter only)
 */
export const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const shelterId = req.user.userId;
    const { documentUrl, status } = req.body;

    if (!documentUrl || !status || !['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        message: "Invalid request. Provide documentUrl and valid status (verified, rejected, pending)."
      });
    }

    const application = await AdoptionApplication.findOne({
      _id: id,
      shelter: shelterId
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found or permission denied"
      });
    }

    // Initialize array if it doesn't exist
    if (!application.documentStatus) {
      application.documentStatus = [];
    }

    // Find if status for this URL already exists
    const existingDocIndex = application.documentStatus.findIndex(doc => doc.url === documentUrl);

    if (existingDocIndex >= 0) {
      // Update existing
      application.documentStatus[existingDocIndex].status = status;
    } else {
      // Add new
      application.documentStatus.push({ url: documentUrl, status });
    }
    
    await application.save();

    res.json({
      message: "Document status updated",
      documentStatus: application.documentStatus
    });

  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({
      message: "Failed to update document status",
      error: error.message
    });
  }
};

/**
 * Cancel/withdraw an application (Adopter only - must be the one who created it)
 * Only allowed when status is pending or reviewing (not yet deep into the process).
 */
export const cancelApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const adopterId = req.user.userId;

    const application = await AdoptionApplication.findOne({
      _id: id,
      adopter: adopterId
    })
      .populate('pet', 'name')
      .populate('shelter', 'name email');

    if (!application) {
      return res.status(404).json({
        message: "Application not found or you do not have permission to cancel it"
      });
    }

    // Prevent cancellation of already-closed applications
    const nonCancellableStatuses = ['completed', 'rejected', 'cancelled'];
    if (nonCancellableStatuses.includes(application.status)) {
      return res.status(400).json({
        message: `This application cannot be cancelled because it is already ${application.status}.`
      });
    }

    // Update status to cancelled
    application.status = 'cancelled';
    await application.save();

    const petName = application.pet?.name || 'the pet';

    // Notify the shelter
    const shelterNotif = await Notification.create({
      recipient: application.shelter._id,
      recipientType: 'shelter',
      type: 'warning',
      title: 'Application Withdrawn',
      message: `An adopter has withdrawn their application for ${petName}.`,
      relatedLink: `/shelter/applications/${application._id}`
    });
    emitNotification(req.app, application.shelter._id.toString(), shelterNotif);

    res.json({
      message: "Your application has been successfully withdrawn.",
      applicationId: application._id
    });

  } catch (error) {
    console.error("Error cancelling application:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Regenerate AI Insights for an application (Shelter only)
 */
export const regenerateInsights = async (req, res) => {
  try {
    const { id } = req.params;
    const shelterId = req.user.userId;

    const application = await AdoptionApplication.findOne({
      _id: id,
      shelter: shelterId
    }).populate('pet');

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    let profileData = application.profileSnapshot;
    if (!profileData) {
      profileData = await AdopterProfile.findOne({ adopter: application.adopter });
    }

    if (!profileData) {
      return res.status(400).json({ message: "No adopter profile found to base insights on." });
    }

    const compatibilityScore = calculateCompatibility(profileData, application.pet);

    // Clear existing
    if (!application.aiInsights) {
      application.aiInsights = {};
    }
    
    application.aiInsights.shelter = null;
    application.aiInsights.adopter = null;

    // Regenerate both
    try {
      // Set both to generating
      application.aiInsights.shelter = { ...application.aiInsights.shelter, status: 'generating', error: null };
      application.aiInsights.adopter = { ...application.aiInsights.adopter, status: 'generating', error: null };
      await application.save();

      const [shelterInsights, adopterInsights] = await Promise.all([
        generateShelterInsights(compatibilityScore, application.pet, profileData).catch(e => { 
          console.error("Shelter AI Error:", e);
          return { error: true, technical: e.message };
        }),
        generateAdopterInsights(compatibilityScore, application.pet, profileData).catch(e => {
          console.error("Adopter AI Error:", e);
          return { error: true, technical: e.message };
        })
      ]);

      if (shelterInsights && !shelterInsights.error) {
        application.aiInsights.shelter = { ...shelterInsights, status: 'success', error: null, generatedAt: new Date() };
      } else {
        application.aiInsights.shelter = { status: 'error', error: "Failed to generate shelter insights." };
      }

      if (adopterInsights && !adopterInsights.error) {
        application.aiInsights.adopter = { ...adopterInsights, status: 'success', error: null, generatedAt: new Date() };
      } else {
        application.aiInsights.adopter = { status: 'error', error: "Failed to generate adopter insights." };
      }

      await application.save();

      res.json({
        message: "Insights regeneration process completed",
        aiInsights: application.aiInsights
      });

    } catch (err) {
      console.error("Regeneration logic failed:", err);
      res.status(500).json({ message: "Failed to process insights regeneration", error: err.message });
    }

  } catch (error) {
    res.status(500).json({
      message: "Server error during regeneration",
      error: error.message
    });
  }
};

