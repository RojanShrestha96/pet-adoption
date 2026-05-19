import User from "../models/User.js";
import Shelter from "../models/Shelter.js";

/**
 * Finds a user or shelter by email.
 * @param {string} email - The email to search for.
 * @returns {Promise<{user: Object|null, userType: string|null}>} Object containing the user document and userType ('adopter' or 'shelter').
 */
export const findUserOrShelterByEmail = async (email) => {
  // Normalize email for case-insensitive search
  const normalizedEmail = email.trim().toLowerCase();

  let user = await User.findOne({ email: normalizedEmail });
  if (user) {
    return { user, userType: "adopter" };
  }

  user = await Shelter.findOne({ email: normalizedEmail });
  if (user) {
    return { user, userType: "shelter" };
  }

  return { user: null, userType: null };
};

/**
 * Finds a user or shelter by exact phone match.
 * @param {string} phone - The phone number to search for.
 * @returns {Promise<{user: Object|null, userType: string|null}>} Object containing the user document and userType ('adopter' or 'shelter').
 */
export const findUserOrShelterByPhone = async (phone) => {
  let user = await User.findOne({ phone });
  if (user) {
    return { user, userType: "adopter" };
  }

  user = await Shelter.findOne({ phone });
  if (user) {
    return { user, userType: "shelter" };
  }

  return { user: null, userType: null };
};
