/**
 * vaccinationReminderService.js
 *
 * Runs once daily (on startup + every 24h via setInterval).
 * Finds all adopted pets whose vaccinations are due in exactly 7 days,
 * then sends an email + in-app notification to the adopter.
 *
 * No external cron libraries needed — native setInterval matches the pattern
 * already used in server.js for featured pet rotation.
 */

import Pet from "../models/Pet.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import Notification from "../models/Notification.js";
import { sendVaccinationReminderEmail } from "../utils/emailService.js";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Core reminder logic — called on startup and every 24h.
 */
export async function runVaccinationReminderJob() {
  const now = new Date();

  // The target window: vaccinations due in 6–8 days from now
  // (generous window catches any time-of-day drift across daily runs)
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() + 6);
  windowStart.setHours(0, 0, 0, 0);

  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + 8);
  windowEnd.setHours(23, 59, 59, 999);

  console.log(
    `[VaccinationReminder] Running job. Checking for vaccinations due between ${windowStart.toDateString()} and ${windowEnd.toDateString()}.`
  );

  try {
    // Find adopted pets with vaccinations due in the target window
    const pets = await Pet.find({
      adoptionStatus: "adopted",
      "medical.vaccinations": {
        $elemMatch: {
          nextDueDate: { $gte: windowStart, $lte: windowEnd },
        },
      },
    }).select("name medical.vaccinations");

    if (pets.length === 0) {
      console.log("[VaccinationReminder] No vaccinations due in the next 7 days.");
      return;
    }

    console.log(`[VaccinationReminder] Found ${pets.length} pet(s) with upcoming vaccinations.`);

    for (const pet of pets) {
      // Find the completed adoption application for this pet to get the adopter
      const application = await AdoptionApplication.findOne({
        pet: pet._id,
        status: "completed",
      })
        .populate("adopter", "name email _id")
        .select("adopter");

      if (!application?.adopter) {
        console.warn(`[VaccinationReminder] No completed application/adopter found for pet ${pet._id} (${pet.name}). Skipping.`);
        continue;
      }

      const adopter = application.adopter;

      // Filter to only the vaccinations actually in the window
      const dueVaccinations = (pet.medical?.vaccinations || []).filter((v) => {
        if (!v.nextDueDate) return false;
        const due = new Date(v.nextDueDate);
        return due >= windowStart && due <= windowEnd;
      });

      for (const vaccine of dueVaccinations) {
        const dueDateStr = new Date(vaccine.nextDueDate).toLocaleDateString("en-NP", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Deduplicate: skip if we already sent a reminder for this exact vaccine today
        const alreadyNotified = await Notification.findOne({
          recipient: adopter._id,
          title: { $regex: pet.name, $options: "i" },
          message: { $regex: vaccine.name, $options: "i" },
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        });

        if (alreadyNotified) {
          console.log(
            `[VaccinationReminder] Already notified ${adopter.name} about ${vaccine.name} for ${pet.name} today. Skipping.`
          );
          continue;
        }

        // ── In-app notification 
        try {
          await Notification.create({
            recipient: adopter._id,
            recipientType: "adopter",
            type: "warning",
            title: `💉 ${pet.name}'s ${vaccine.name} Due in 7 Days`,
            message: `Just a heads up! ${pet.name}'s ${vaccine.name} vaccination is due on ${dueDateStr}. Please book a vet appointment soon.`,
            relatedLink: "/profile",
          });
        } catch (notifErr) {
          console.error(
            `[VaccinationReminder] Failed to create in-app notification for ${adopter.name}:`,
            notifErr.message
          );
        }

        // ── Email reminder ───────────────────────────────────────────────────
        if (adopter.email) {
          await sendVaccinationReminderEmail(
            adopter.email,
            adopter.name,
            pet.name,
            vaccine.name,
            dueDateStr
          );
          console.log(
            `[VaccinationReminder] ✅ Sent reminder to ${adopter.email} — ${pet.name} / ${vaccine.name} due ${dueDateStr}`
          );
        }
      }
    }

    console.log("[VaccinationReminder] Job complete.");
  } catch (err) {
    console.error("[VaccinationReminder] Job failed:", err.message);
  }
}

/**
 * Start the daily vaccination reminder job.
 * Runs once on startup, then every 24 hours.
 */
export function startVaccinationReminderJob() {
  console.log("[VaccinationReminder] Daily reminder job started (every 24h).");

  // Run immediately on startup
  runVaccinationReminderJob().catch(console.error);

  // Then every 24 hours
  setInterval(() => {
    runVaccinationReminderJob().catch(console.error);
  }, TWENTY_FOUR_HOURS_MS);
}
