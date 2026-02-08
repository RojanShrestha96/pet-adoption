import AdoptionApplication from "../models/AdoptionApplication.js";
import Pet from "../models/Pet.js";
import Notification from "../models/Notification.js";

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

    // Populate for response
    await application.populate([
      { path: 'pet', select: 'name species images' },
      { path: 'adopter', select: 'name email' }
    ]);

    // Create notification for shelter
    const shelterName = pet.shelter.name || 'A shelter';
    await Notification.create({
      recipient: pet.shelter._id,
      recipientType: 'shelter',
      type: 'application',
      title: 'New Adoption Application Received',
      message: `${personalInfo.fullName} has submitted an adoption application for ${pet.name}.`,
      relatedLink: `/shelter/applications/${application._id}`
    });

    // Create confirmation notification for adopter
    await Notification.create({
      recipient: adopterId,
      recipientType: 'adopter',
      type: 'success',
      title: 'Application Submitted Successfully',
      message: `Your adoption application for ${pet.name} has been submitted to ${shelterName}. The shelter will review your application and contact you soon.`,
      relatedLink: `/application-tracking/${application._id}`
    });

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
      .populate('pet', 'name species breed age gender images')
      .populate('adopter', 'name email')
      .populate('shelter', 'name email phone location');

    if (!application) {
      return res.status(404).json({
        message: "Application not found or you do not have permission to view it"
      });
    }

    res.json(application);

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
      await Notification.create({
        recipient: application.adopter._id,
        recipientType: 'adopter',
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        relatedLink: `/application-tracking/${application._id}`
      });
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

    const stats = await AdoptionApplication.aggregate([
      { $match: { shelter: shelterId } },
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

    res.json(application);

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
