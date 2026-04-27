import Shelter from "../models/Shelter.js";
import Admin from "../models/Admin.js";
import Notification from "../models/Notification.js";
import Pet from "../models/Pet.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import Donation from "../models/Donation.js";
import { geocodeAddress } from "../services/geoService.js";

// GET ALL SHELTERS (Public - Limited for Homepage)
export const getAllShelters = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    let shelters = [];

    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);

      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        // Step 1: Try finding verified shelters within 50km
        shelters = await Shelter.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [parsedLng, parsedLat] },
              distanceField: "distance",
              maxDistance: 50000, 
              spherical: true,
              query: { isSuspended: false, isVerified: true }
            }
          },
          {
            $project: { password: 0, documentation: 0, preferences: 0 }
          },
          { $limit: 4 }
        ]);

        // Step 2: If no verified shelters nearby, try finding ANY shelters nearby (up to 500km)
        if (shelters.length === 0) {
          shelters = await Shelter.aggregate([
            {
              $geoNear: {
                near: { type: "Point", coordinates: [parsedLng, parsedLat] },
                distanceField: "distance",
                maxDistance: 500000,
                spherical: true,
                query: { isSuspended: false }
              }
            },
            {
              $project: { password: 0, documentation: 0, preferences: 0 }
            },
            { $limit: 4 }
          ]);
        }
      }
    }

    // Step 3: Global fallback if still no shelters found (or no location provided)
    if (shelters.length === 0) {
      // Find shelters that have available pets, prioritized by verification and total count
      shelters = await Shelter.aggregate([
        { $match: { isSuspended: false } },
        {
          $lookup: {
            from: "pets",
            localField: "_id",
            foreignField: "shelter",
            as: "availPets",
            pipeline: [
              { $match: { adoptionStatus: "available" } },
              { $project: { _id: 1 } }
            ]
          }
        },
        {
          $addFields: {
            activeCount: { $size: "$availPets" }
          }
        },
        { $sort: { activeCount: -1, isVerified: -1, createdAt: -1 } },
        { $limit: 4 },
        { $project: { password: 0, documentation: 0, preferences: 0, availPets: 0 } }
      ]);
    }

    // Format distance, get real pet count and format address
    shelters = await Promise.all(shelters.map(async s => {
      const petCount = await Pet.countDocuments({ shelter: s._id, adoptionStatus: 'available' });
      
      let locString = "Location varies";
      if (s.location && s.location.formattedAddress) {
        locString = s.location.formattedAddress;
      } else if (s.city || s.state) {
        locString = [s.city, s.state].filter(Boolean).join(", ");
      } else if (s.address) {
        locString = s.address;
      }

      return {
        ...s,
        distance: s.distance ? (s.distance / 1000).toFixed(1) + " km" : "Location varies",
        totalPets: petCount,
        address: locString
      };
    }));
    
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

    const currentShelter = await Shelter.findById(req.user.userId);
    if (!currentShelter) return res.status(404).json({ message: "Shelter not found" });

    // Block documentation updates if shelter is verified
    if (currentShelter.isVerified && req.body.documentation) {
      const isDocModified = JSON.stringify(req.body.documentation) !== JSON.stringify(currentShelter.documentation);
      if (isDocModified) {
        return res.status(403).json({ message: "Verified shelters cannot modify documentation. Please contact support." });
      }
    }

    // ── Pre-process Geocoding if address info changes ──
    let newLocation = req.body.location; // might already have coordinates from frontend

    const addressChanged = 
      address !== currentShelter.address || 
      city !== currentShelter.city || 
      state !== currentShelter.state;

    if (addressChanged) {
      const fullQuery = [address, city, state, "Nepal"].filter(Boolean).join(", ");
      const geoResult = await geocodeAddress(fullQuery);

      if (geoResult) {
         newLocation = {
           type: 'Point',
           coordinates: [geoResult.lng, geoResult.lat], // [lng, lat]
           formattedAddress: geoResult.formattedAddress
         };
      } else {
         console.warn(`[ShelterController] Geocoding failed for: ${fullQuery}`);
      }
    } else if (newLocation && newLocation.lat && newLocation.lng && !newLocation.type) {
      const parsedLat = parseFloat(newLocation.lat);
      const parsedLng = parseFloat(newLocation.lng);
      // Only convert to GeoJSON if coordinates are valid non-zero numbers
      if (!isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0 && parsedLng !== 0) {
        newLocation = {
          type: 'Point',
          coordinates: [parsedLng, parsedLat], // GeoJSON: [lng, lat]
          formattedAddress: newLocation.formattedAddress
        };
      } else {
        // Preserve existing location data, don't save invalid coordinates
        console.warn(`[ShelterController] Rejected invalid coordinates: lat=${parsedLat}, lng=${parsedLng}`);
        newLocation = currentShelter.location;
      }
    } else if (!newLocation || (!newLocation.type && !newLocation.lat)) {
      // No location data sent – preserve existing
      newLocation = currentShelter.location;
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
        location: newLocation,
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
      followUp: applications.filter(a => ['follow_up_required', 'follow_up_scheduled'].includes(a.status)).length,
      finalizing: applications.filter(a => [
        'finalization_pending', 
        'payment_pending', 
        'payment_failed', 
        'contract_generated', 
        'contract_signed', 
        'handover_pending'
      ].includes(a.status)).length
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
    const finalizationStatuses = [
      'finalization_pending', 
      'payment_pending', 
      'payment_failed', 
      'contract_generated', 
      'contract_signed', 
      'handover_pending'
    ];
    
    const approvedApps = applications.filter(a => 
      ['approved', 'follow_up_required', 'follow_up_scheduled', 'follow_up_completed', 'completed', ...finalizationStatuses].includes(a.status)
    ).length;
    
    const meetAndGreetApps = applications.filter(a => 
      ['meeting_scheduled', 'meeting_completed', 'follow_up_scheduled', 'follow_up_completed', 'completed', ...finalizationStatuses].includes(a.status)
    ).length;
    
    const finalizedApps = applications.filter(a => a.status === 'completed').length;
    
    const finalizationApps = applications.filter(a => 
      [...finalizationStatuses, 'completed'].includes(a.status)
    ).length;

    const adoptionFunnel = [
      { stage: 'Applications', value: totalApplications, color: '#3b82f6' },
      { stage: 'Approved', value: approvedApps, color: '#8b5cf6' },
      { stage: 'Meet & Greet', value: meetAndGreetApps, color: '#f59e0b' },
      { stage: 'Finalizing', value: finalizationApps, color: '#06b6d4' },
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
      .filter(a => a.status === 'completed' && a.createdAt && a.completedAt)
      .map(a => (new Date(a.completedAt) - new Date(a.createdAt)) / (1000 * 60 * 60 * 24));
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

// GET SHELTER DONATION STATS (Dashboard)
export const getShelterDonationStats = async (req, res) => {
  try {
    const shelterId = req.user.userId;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all completed donations for this shelter
    const donations = await Donation.find({ shelterId, status: "completed" }).populate('petId', 'name images').sort({ createdAt: -1 });

    const totalReceived = donations.reduce((sum, d) => sum + d.amount, 0);
    const donationsThisMonth = donations
      .filter(d => new Date(d.createdAt) >= startOfMonth)
      .reduce((sum, d) => sum + d.amount, 0);

    const uniqueDonors = new Set(donations.map(d => d.userId?.toString()).filter(Boolean));
    const donorCount = uniqueDonors.size;

    // Per-pet breakdown
    const petMap = {}; // key: petId toString
    donations.forEach(d => {
      if (!d.petId) return;
      const id = d.petId._id.toString();
      if (!petMap[id]) {
        petMap[id] = {
          petId: id,
          petName: d.petId.name,
          petImage: d.petId.images?.[0] || null,
          donationCount: 0,
          totalAmount: 0,
          lastDonation: d.createdAt
        };
      }
      petMap[id].donationCount += 1;
      petMap[id].totalAmount += d.amount;
      if (new Date(d.createdAt) > new Date(petMap[id].lastDonation)) {
        petMap[id].lastDonation = d.createdAt;
      }
    });
    
    const perPet = Object.values(petMap).sort((a, b) => b.totalAmount - a.totalAmount);

    // PRIVACY: No donor PII exposed
    const recentDonations = donations.slice(0, 10).map(d => ({
      amount: d.amount,
      petName: d.petId?.name || null,
      message: d.message,
      createdAt: d.createdAt
    }));

    res.json({
      totalReceived,
      donationsThisMonth,
      donorCount,
      perPet,
      recentDonations
    });
  } catch (error) {
    console.error("Error fetching shelter donation stats:", error);
    res.status(500).json({ message: "Server error fetching donation stats" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEE TABLE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

import AdoptionFeeTable from "../models/AdoptionFeeTable.js";

// GET SHELTER FEE TABLE
export const getFeeTable = async (req, res) => {
  try {
    const shelterId = req.user.userId;
    let feeTable = await AdoptionFeeTable.findOne({ shelter: shelterId });

    if (!feeTable) {
      // Return a default empty structure if none exists yet
      return res.json({
        shelter: shelterId,
        currency: "NPR",
        defaultFee: 0,
        speciesRates: []
      });
    }

    res.json(feeTable);
  } catch (error) {
    console.error("Error fetching fee table:", error);
    res.status(500).json({ message: "Server error fetching fee table" });
  }
};

// UPDATE SHELTER FEE TABLE
export const updateFeeTable = async (req, res) => {
  try {
    const shelterId = req.user.userId;
    const { currency, defaultFee, speciesRates } = req.body;

    // Use findOneAndUpdate with upsert: true to create or update in one go
    const feeTable = await AdoptionFeeTable.findOneAndUpdate(
      { shelter: shelterId },
      { currency, defaultFee, speciesRates },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Fee table updated successfully",
      feeTable
    });
  } catch (error) {
    console.error("Error updating fee table:", error);
    res.status(500).json({ message: "Server error updating fee table" });
  }
};
