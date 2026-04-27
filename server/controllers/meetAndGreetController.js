import AdoptionApplication from "../models/AdoptionApplication.js";
import Pet from "../models/Pet.js";
import Notification from "../models/Notification.js";

/**
 * Submit availability for meet & greet (Adopter only)
 * Status transition: approved → availability_submitted
 */
export const submitAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const adopterId = req.user.userId;
    const { availabilitySlots } = req.body;

    // Validate availability slots
    if (!availabilitySlots || !Array.isArray(availabilitySlots) || availabilitySlots.length < 2 || availabilitySlots.length > 3) {
      return res.status(400).json({
        message: "Please provide 2-3 availability slots"
      });
    }

    // Validate each slot
    for (const slot of availabilitySlots) {
      if (!slot.date || !slot.timeSlot) {
        return res.status(400).json({
          message: "Each slot must have a date and timeSlot"
        });
      }
      
      if (!['morning', 'afternoon', 'evening'].includes(slot.timeSlot)) {
        return res.status(400).json({
          message: "timeSlot must be 'morning', 'afternoon', or 'evening'"
        });
      }

      // Validate date is in the future
      const slotDate = new Date(slot.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (slotDate < today) {
        return res.status(400).json({
          message: "All dates must be in the future"
        });
      }
    }

    // Find application
    const application = await AdoptionApplication.findOne({
      _id: id,
      adopter: adopterId
    })
      .populate('pet', 'name')
      .populate('shelter', 'name email');

    if (!application) {
      return res.status(404).json({
        message: "Application not found or you do not have permission"
      });
    }

    // Verify application is in approved or follow_up_required status
    if (!['approved', 'follow_up_required'].includes(application.status)) {
      return res.status(400).json({
        message: `Cannot submit availability. Application status is ${application.status}. Must be approved or follow_up_required.`
      });
    }

    // Update application with availability
    application.meetAndGreet = application.meetAndGreet || {};
    application.meetAndGreet.availabilitySlots = availabilitySlots;
    application.meetAndGreet.availabilitySubmittedAt = new Date();
    application.status = 'availability_submitted';

    await application.save();

    if (application.shelter) {
      await Notification.create({
        recipient: application.shelter._id,
        recipientType: 'shelter',
        type: 'application',
        title: 'New Meet & Greet Availability Submitted',
        message: `${req.user.name || 'An adopter'} has submitted availability for a meet & greet with ${application.pet?.name || 'a pet'}.`,
        relatedLink: `/shelter/applications/${application._id}`
      });
    }

    // Notify adopter (confirmation)
    await Notification.create({
      recipient: adopterId,
      recipientType: 'adopter',
      type: 'success',
      title: 'Availability Submitted',
      message: `Your availability for meeting ${application.pet.name} has been submitted. The shelter will confirm a time soon.`,
      relatedLink: `/application-tracking/${application._id}`
    });

    res.json({
      message: "Availability submitted successfully",
      application
    });

  } catch (error) {
    console.error("Error submitting availability:", error);
    res.status(500).json({
      message: "Failed to submit availability",
      error: error.message
    });
  }
};

/**
 * Schedule meet & greet (Shelter only)
 * Status transition: availability_submitted → meeting_scheduled
 */
export const scheduleMeetAndGreet = async (req, res) => {
  try {
    const { id } = req.params;
    const shelterId = req.user.userId;
    const { selectedSlotIndex, specificTime, location, shelterNotes } = req.body;

    // Validate inputs
    if (selectedSlotIndex === undefined || selectedSlotIndex === null) {
      return res.status(400).json({
        message: "selectedSlotIndex is required"
      });
    }

    // Find application
    const application = await AdoptionApplication.findOne({
      _id: id,
      shelter: shelterId
    })
      .populate('pet', 'name')
      .populate('adopter', 'name email')
      .populate('shelter', 'name location');

    if (!application) {
      return res.status(404).json({
        message: "Application not found or permission denied"
      });
    }

    // Verify status
    if (application.status !== 'availability_submitted') {
      return res.status(400).json({
        message: `Cannot schedule meeting. Current status is ${application.status}.`
      });
    }

    // Verify availability slots exist
    if (!application.meetAndGreet?.availabilitySlots || application.meetAndGreet.availabilitySlots.length === 0) {
      return res.status(400).json({
        message: "No availability slots found for this application"
      });
    }

    // Verify selected slot index is valid
    if (selectedSlotIndex < 0 || selectedSlotIndex >= application.meetAndGreet.availabilitySlots.length) {
      return res.status(400).json({
        message: "Invalid slot index"
      });
    }

    const selectedSlot = application.meetAndGreet.availabilitySlots[selectedSlotIndex];

    // Check for conflicts - prevent double booking same pet at same time
    const conflictingApplications = await AdoptionApplication.find({
      shelter: shelterId,
      pet: application.pet._id,
      _id: { $ne: application._id },
      status: 'meeting_scheduled',
      'meetAndGreet.confirmedSlot.date': selectedSlot.date
    });

    if (conflictingApplications.length > 0) {
      // Check if time slots overlap
      const hasTimeConflict = conflictingApplications.some(app => {
        return app.meetAndGreet?.confirmedSlot?.timeSlot === selectedSlot.timeSlot;
      });

      if (hasTimeConflict) {
        return res.status(409).json({
          message: "This time slot conflicts with another scheduled meeting for this pet"
        });
      }
    }

    // Update application with confirmed schedule
    application.meetAndGreet.confirmedSlot = {
      date: selectedSlot.date,
      timeSlot: selectedSlot.timeSlot,
      specificTime: specificTime || ''
    };
    
    if (location) {
      application.meetAndGreet.location = location;
    } else if (application.shelter.location?.formattedAddress) {
      application.meetAndGreet.location = application.shelter.location.formattedAddress;
    }

    if (shelterNotes) {
      application.meetAndGreet.shelterNotes = shelterNotes;
    }

    application.meetAndGreet.scheduledAt = new Date();
    application.status = 'meeting_scheduled';

    // Also update legacy fields for backward compatibility
    application.scheduledDate = new Date(selectedSlot.date);
    application.scheduledTime = specificTime || selectedSlot.timeSlot;

    await application.save();

    // Notify adopter
    const timeSlotDisplay = {
      morning: '9:00 AM - 12:00 PM',
      afternoon: '12:00 PM - 3:00 PM',
      evening: '3:00 PM - 6:00 PM'
    };

    if (application.adopter) {
      await Notification.create({
        recipient: application.adopter._id,
        recipientType: 'adopter',
        type: 'success',
        title: 'Meet & Greet Scheduled! 🐾',
        message: `Your meet & greet with ${application.pet?.name || 'the pet'} is scheduled for ${selectedSlot.date}${specificTime ? ` at ${specificTime}` : ` (${timeSlotDisplay[selectedSlot.timeSlot]})`}. Location: ${application.meetAndGreet.location || 'TBD'}`,
        relatedLink: `/application-tracking/${application._id}`
      });
    }

    res.json({
      message: "Meeting scheduled successfully",
      application
    });

  } catch (error) {
    console.error("Error scheduling meeting:", error);
    res.status(500).json({
      message: "Failed to schedule meeting",
      error: error.message
    });
  }
};

/**
 * Complete meet & greet (Shelter only)
 * Status transition: meeting_scheduled → meeting_completed / follow_up_required / rejected
 */
export const completeMeetAndGreet = async (req, res) => {
  try {
    const { id } = req.params;
    const shelterId = req.user.userId;
    const { outcome, internalNotes, rejectionReason, customReason, followUpDate, followUpNotes } = req.body;

    // Validate outcome
    if (!outcome || !['successful', 'needs_followup', 'not_a_match'].includes(outcome)) {
      return res.status(400).json({
        message: "outcome is required and must be 'successful', 'needs_followup', or 'not_a_match'"
      });
    }

    // Validate rejection reason for "not_a_match"
    if (outcome === 'not_a_match') {
      if (!rejectionReason) {
        return res.status(400).json({
          message: "rejectionReason is required when outcome is 'not_a_match'"
        });
      }
      
      const validReasons = [
        'home_not_suitable', 'energy_mismatch', 'behavioral_concerns',
        'expectations_mismatch', 'compatibility_issue', 'adopter_withdrew', 'other'
      ];
      
      if (!validReasons.includes(rejectionReason)) {
        return res.status(400).json({ message: "Invalid rejection reason" });
      }
      
      // If 'other', require custom reason
      if (rejectionReason === 'other' && !customReason?.trim()) {
        return res.status(400).json({
          message: "customReason is required when rejectionReason is 'other'"
        });
      }
    }

    // Validate follow-up date for "needs_followup"
    if (outcome === 'needs_followup') {
      if (!followUpDate) {
        return res.status(400).json({
          message: "followUpDate is required when outcome is 'needs_followup'"
        });
      }
    }

    // Find application
    const application = await AdoptionApplication.findOne({
      _id: id,
      shelter: shelterId
    })
      .populate('pet', 'name')
      .populate('adopter', 'name email');

    if (!application) {
      return res.status(404).json({
        message: "Application not found or permission denied"
      });
    }

    // Verify status
    if (application.status !== 'meeting_scheduled' && application.status !== 'follow_up_scheduled') {
      return res.status(400).json({
        message: `Cannot complete meeting. Current status is ${application.status}.`
      });
    }

    // Enforce max 2 follow-ups
    if (outcome === 'needs_followup') {
      const followUpCount = application.meetAndGreet?.followUpCount || 0;
      
      if (followUpCount >= 2) {
        return res.status(400).json({
          message: "Maximum follow-ups reached (2). You must select 'Successful Match' or 'Not a Match'."
        });
      }
    }

    // Update application
    application.meetAndGreet = application.meetAndGreet || {};
    application.meetAndGreet.outcome = outcome;
    application.meetAndGreet.completedAt = new Date();
    
    // Store internal notes (never shown to adopter)
    if (internalNotes?.trim()) {
      const notePrefix = application.meetAndGreet.shelterNotes ? '\n\n' : '';
      application.meetAndGreet.shelterNotes = 
        (application.meetAndGreet.shelterNotes || '') + `${notePrefix}Internal Meeting Notes (${new Date().toLocaleDateString()}): ${internalNotes}`;
    }
    
    // Handle outcome-specific logic
    switch (outcome) {
      case 'not_a_match':
        // Store structured rejection details (internal only)
        application.meetAndGreet.rejectionDetails = {
          reason: rejectionReason,
          customReason: rejectionReason === 'other' ? customReason : undefined,
          internalNotes: internalNotes || undefined
        };
        application.status = 'rejected';
        
        // Reopen pet for other adopters
        if (application.pet) {
          await Pet.findByIdAndUpdate(application.pet._id, {
            adoptionStatus: 'available'
          });
        }
        break;
        
      case 'needs_followup':
        // Increment follow-up counter
        application.meetAndGreet.followUpCount = (application.meetAndGreet.followUpCount || 0) + 1;
        
        application.meetAndGreet.followUpDetails = {
          requiredByDate: new Date(followUpDate),
          notes: followUpNotes || '',
          secondMeetingScheduled: false
        };
        application.status = 'follow_up_required';
        // Pet stays RESERVED (pending) - NOT reopened
        break;
        
      case 'successful':
        application.status = 'meeting_completed';
        // Pet remains in 'pending' status until final adoption
        break;
    }

    await application.save();

    // Notify adopter based on outcome (professional, non-revealing messages)
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = 'info';

    switch (outcome) {
      case 'successful':
        notificationTitle = 'Great News! 🎉';
        notificationMessage = `The meet & greet with ${application.pet.name} went wonderfully! The shelter will contact you soon about finalizing the adoption.`;
        notificationType = 'success';
        break;
      case 'needs_followup':
        notificationTitle = 'Follow-up Meeting Needed';
        notificationMessage = `Thank you for meeting ${application.pet.name}. The shelter would like to schedule a follow-up discussion. Please submit your availability for a second meeting.`;
        notificationType = 'info';
        break;
      case 'not_a_match':
        // Generic professional message - NO internal reasoning exposed
        notificationTitle = 'Thank You for Your Interest';
        notificationMessage = `After careful consideration, we feel this pet may not be the best match for your current situation. We encourage you to explore other available pets.`;
        notificationType = 'info';
        break;
    }

    if (application.adopter) {
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
      message: "Meeting completed successfully",
      application
    });

  } catch (error) {
    console.error("Error completing meeting:", error);
    res.status(500).json({
      message: "Failed to complete meeting",
      error: error.message
    });
  }
};

/**
 * Get all meet & greet schedules for shelter calendar (Shelter only)
 */
export const getShelterMeetAndGreets = async (req, res) => {
  try {
    const shelterId = req.user.userId;
    const { startDate, endDate, status } = req.query;

    // Build query
    const query = {
      shelter: shelterId,
      status: { $in: ['availability_submitted', 'meeting_scheduled', 'meeting_completed'] }
    };

    // Filter by specific status if provided
    if (status && ['availability_submitted', 'meeting_scheduled', 'meeting_completed'].includes(status)) {
      query.status = status;
    }

    // Filter by date range if provided (for scheduled meetings)
    if (startDate && endDate) {
      query['meetAndGreet.confirmedSlot.date'] = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const meetings = await AdoptionApplication.find(query)
      .populate('pet', 'name species images')
      .populate('adopter', 'name email')
      .populate('shelter', 'name location')
      .sort({ 'meetAndGreet.confirmedSlot.date': 1, 'meetAndGreet.availabilitySubmittedAt': -1 });

    res.json({
      meetings,
      total: meetings.length
    });

  } catch (error) {
    console.error("Error fetching meet & greet schedules:", error);
    res.status(500).json({
      message: "Failed to fetch schedules",
      error: error.message
    });
  }
};

/**
 * Request reschedule (Adopter only)
 * Resets to availability_submitted status
 */
export const requestReschedule = async (req, res) => {
  try {
    const { id } = req.params;
    const adopterId = req.user.userId;
    const { availabilitySlots, reason } = req.body;

    // Validate new availability slots
    if (!availabilitySlots || !Array.isArray(availabilitySlots) || availabilitySlots.length < 2 || availabilitySlots.length > 3) {
      return res.status(400).json({
        message: "Please provide 2-3 new availability slots"
      });
    }

    // Find application
    const application = await AdoptionApplication.findOne({
      _id: id,
      adopter: adopterId
    })
      .populate('pet', 'name')
      .populate('shelter', 'name email');

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    // Can only reschedule if meeting is scheduled
    if (application.status !== 'meeting_scheduled') {
      return res.status(400).json({
        message: "Can only reschedule meetings that are currently scheduled"
      });
    }

    // Update with new availability
    application.meetAndGreet.availabilitySlots = availabilitySlots;
    application.meetAndGreet.confirmedSlot = undefined; // Clear confirmed slot
    application.meetAndGreet.scheduledAt = undefined;
    application.meetAndGreet.availabilitySubmittedAt = new Date();
    application.status = 'availability_submitted';

    // Add reschedule note
    const rescheduleNote = `Reschedule requested by adopter${reason ? `: ${reason}` : ''}`;
    if (application.meetAndGreet.shelterNotes) {
      application.meetAndGreet.shelterNotes += `\n\n${rescheduleNote}`;
    } else {
      application.meetAndGreet.shelterNotes = rescheduleNote;
    }

    await application.save();

    if (application.shelter) {
      await Notification.create({
        recipient: application.shelter._id,
        recipientType: 'shelter',
        type: 'application',
        title: 'Reschedule Request',
        message: `${req.user.name || 'An adopter'} has requested to reschedule the meet & greet for ${application.pet?.name || 'the pet'}.${reason ? ` Reason: ${reason}` : ''}`,
        relatedLink: `/shelter/applications/${application._id}`
      });
    }

    res.json({
      message: "Reschedule request submitted successfully",
      application
    });

  } catch (error) {
    console.error("Error requesting reschedule:", error);
    res.status(500).json({
      message: "Failed to request reschedule",
      error: error.message
    });
  }
};
