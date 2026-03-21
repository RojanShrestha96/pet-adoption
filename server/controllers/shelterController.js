import Shelter from "../models/Shelter.js";
import Admin from "../models/Admin.js";
import Notification from "../models/Notification.js";
import Pet from "../models/Pet.js";
import AdoptionApplication from "../models/AdoptionApplication.js";

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
    
    // Get real stats from Pet model
    const totalPets = await Pet.countDocuments({ shelter: req.user.userId });
    const adoptedPets = await Pet.countDocuments({ 
      shelter: req.user.userId, 
      adoptionStatus: 'adopted' 
    });
    
    // Return stats with real data
    res.json({
      ...shelter.toObject(),
      stats: {
        totalPets: totalPets,
        applications: 0, // TODO: Replace with real application count when Application model is created
        adoptions: adoptedPets,
        views: shelter.profileViews || 0 // Use real views if available, otherwise 0
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
    const { name, email, phone, address, description, operatingHours, theme, city, state, zipCode, contactPerson } = req.body;
    
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
        contactPerson,
        location: req.body.location,
        preferences: req.body.preferences,
        documentation: req.body.documentation,
        operatingHours: req.body.operatingHours,
        establishedDate: req.body.establishedDate,
        logo: req.body.logo,
        coverImage: req.body.coverImage
      },
      { new: true, runValidators: true }
    ).select("-password");

    // Check if documentation was updated/uploaded
    if (req.body.documentation && req.body.documentation.length > 0) {
      const admins = await Admin.find({ role: { $in: ['admin', 'super_admin'] } });
      
      const notificationDocs = admins.map(admin => ({
        recipient: admin._id,
        recipientType: 'admin',
        type: 'application',
        title: 'Documents Uploaded',
        message: `Shelter "${updatedShelter.name}" has uploaded verification documents.`,
        relatedLink: `/admin/shelters/${updatedShelter._id}`
      }));

      if (notificationDocs.length > 0) {
        const savedNotifs = await Notification.insertMany(notificationDocs);
        // Emit real-time to each admin
        const io = req.app.get('io');
        if (io) {
          savedNotifs.forEach(notif => {
            io.to(`user_${notif.recipient}`).emit('new_notification', notif.toObject ? notif.toObject() : notif);
          });
        }
      }
    }

    res.json(updatedShelter);
  } catch (error) {
    console.error("Error updating shelter:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET SHELTER ANALYTICS (Dashboard Charts Data)
export const getShelterAnalytics = async (req, res) => {
  try {
    const shelterId = req.user.userId;
    const now = new Date();

    // Get all pets for this shelter
    const pets = await Pet.find({ shelter: shelterId });

    // 1. Pet Distribution by Species
    const petDistribution = {
      dog: pets.filter(p => p.species === 'dog').length,
      cat: pets.filter(p => p.species === 'cat').length,
      other: pets.filter(p => p.species === 'other').length
    };

    // 2. Pet Status Distribution
    const petStatusDistribution = {
      available: pets.filter(p => p.adoptionStatus === 'available').length,
      pending: pets.filter(p => p.adoptionStatus === 'pending').length,
      adopted: pets.filter(p => p.adoptionStatus === 'adopted').length,
      pendingReview: pets.filter(p => p.adoptionStatus === 'pending-review').length
    };

    // 3. Monthly Adoption Trends (last 6 months)
    const monthlyAdoptions = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const adoptedInMonth = pets.filter(p => {
        if (p.adoptionStatus === 'adopted' && p.updatedAt) {
          const updateDate = new Date(p.updatedAt);
          return updateDate >= monthDate && updateDate < nextMonth;
        }
        return false;
      }).length;
      monthlyAdoptions.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        adoptions: adoptedInMonth
      });
    }

    // 4. Application Status (Real Data)
    const applications = await AdoptionApplication.find({ shelter: shelterId }).populate('pet', 'name species').populate('adopter', 'name email');
    
    const applicationStats = {
      pending: applications.filter(a => a.status === 'pending').length,
      reviewing: applications.filter(a => a.status === 'reviewing').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      followUp: applications.filter(a => ['follow_up_required', 'follow_up_scheduled'].includes(a.status)).length
    };

    // 5. Recent Activity Timeline (last 7 days)
    const activityTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const activitiesCount = pets.filter(p => {
        if (p.createdAt) {
          const createdDate = new Date(p.createdAt);
          return createdDate >= dayStart && createdDate <= dayEnd;
        }
        return false;
      }).length;
      activityTimeline.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        activities: activitiesCount
      });
    }

    // 6. Adoption Funnel Stages
    const totalApplications = applications.length;
    const approvedApps = applications.filter(a => ['approved', 'follow_up_required', 'follow_up_scheduled', 'follow_up_completed', 'finalized'].includes(a.status)).length;
    const meetAndGreetApps = applications.filter(a => ['follow_up_scheduled', 'follow_up_completed', 'finalized'].includes(a.status)).length;
    const finalizedApps = applications.filter(a => a.status === 'finalized').length;

    const adoptionFunnel = [
      { stage: 'Applications', value: totalApplications, color: '#3b82f6' },
      { stage: 'Approved', value: approvedApps, color: '#8b5cf6' },
      { stage: 'Meet & Greet', value: meetAndGreetApps, color: '#f59e0b' },
      { stage: 'Adopted', value: finalizedApps, color: '#22c55e' }
    ];

    // 7. Intake vs Adoption (last 6 months)
    const intakeVsAdoption = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const intakeCount = pets.filter(p => {
        if (p.createdAt) {
          const d = new Date(p.createdAt);
          return d >= monthDate && d < nextMonth;
        }
        return false;
      }).length;
      const adoptedCount = pets.filter(p => {
        if (p.adoptionStatus === 'adopted' && p.updatedAt) {
          const d = new Date(p.updatedAt);
          return d >= monthDate && d < nextMonth;
        }
        return false;
      }).length;
      intakeVsAdoption.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        intake: intakeCount,
        adopted: adoptedCount,
        net: intakeCount - adoptedCount
      });
    }

    // 8. Average Time to Adoption (days)
    const adoptionTimes = applications
      .filter(a => a.status === 'finalized' && a.createdAt && a.updatedAt)
      .map(a => (new Date(a.updatedAt) - new Date(a.createdAt)) / (1000 * 60 * 60 * 24));
    const avgTimeToAdoption = adoptionTimes.length > 0
      ? Math.round(adoptionTimes.reduce((sum, t) => sum + t, 0) / adoptionTimes.length)
      : 0;
    const fastestAdoption = adoptionTimes.length > 0 ? Math.round(Math.min(...adoptionTimes)) : 0;
    const slowestAdoption = adoptionTimes.length > 0 ? Math.round(Math.max(...adoptionTimes)) : 0;

    // 9. Priority Alerts
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const overduePending = applications.filter(a =>
      a.status === 'pending' && new Date(a.createdAt) < threeDaysAgo
    ).map(a => ({
      id: a._id,
      type: 'overdue_pending',
      priority: 'critical',
      petName: a.pet?.name || 'Unknown Pet',
      applicantName: a.personalInfo?.fullName || a.adopter?.name || 'Unknown',
      createdAt: a.createdAt,
      daysElapsed: Math.floor((now - new Date(a.createdAt)) / (1000 * 60 * 60 * 24))
    }));

    const overdueReviewing = applications.filter(a =>
      a.status === 'reviewing' && new Date(a.createdAt) < twoDaysAgo
    ).map(a => ({
      id: a._id,
      type: 'overdue_reviewing',
      priority: 'warning',
      petName: a.pet?.name || 'Unknown Pet',
      applicantName: a.personalInfo?.fullName || a.adopter?.name || 'Unknown',
      createdAt: a.createdAt,
      daysElapsed: Math.floor((now - new Date(a.createdAt)) / (1000 * 60 * 60 * 24))
    }));

    const upcomingMeetGreets = applications.filter(a => {
      if (a.scheduledDate) {
        const d = new Date(a.scheduledDate);
        return d >= now && d <= tomorrow;
      }
      return false;
    }).map(a => ({
      id: a._id,
      type: 'upcoming_meet_greet',
      priority: 'info',
      petName: a.pet?.name || 'Unknown Pet',
      applicantName: a.personalInfo?.fullName || a.adopter?.name || 'Unknown',
      scheduledDate: a.scheduledDate
    }));

    const priorityAlerts = {
      critical: overduePending,
      warning: overdueReviewing,
      info: upcomingMeetGreets,
      totalCount: overduePending.length + overdueReviewing.length + upcomingMeetGreets.length
    };

    // 10. Adoption Rate (finalized / total applications %)
    const adoptionRate = totalApplications > 0
      ? Math.round((finalizedApps / totalApplications) * 100)
      : 0;

    // 11. Scheduled Meet & Greets count (upcoming)
    const scheduledMeetGreets = applications.filter(a =>
      a.scheduledDate && new Date(a.scheduledDate) >= now
    ).length;

    // Return all analytics data
    res.json({
      petDistribution,
      petStatusDistribution,
      monthlyAdoptions,
      applicationStats,
      activityTimeline,
      totalPets: pets.length,
      totalAdopted: pets.filter(p => p.adoptionStatus === 'adopted').length,
      totalApplications,
      adoptionFunnel,
      intakeVsAdoption,
      avgTimeToAdoption,
      fastestAdoption,
      slowestAdoption,
      priorityAlerts,
      adoptionRate,
      scheduledMeetGreets
    });
  } catch (error) {
    console.error("Error fetching shelter analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};
