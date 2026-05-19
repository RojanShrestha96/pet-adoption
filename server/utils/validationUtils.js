/**
 * Validates a phone number ensuring it has exactly 10 digits.
 * @param {string} phone - The phone number string.
 * @returns {boolean} True if valid, false otherwise.
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  // Ensure we strip non-digits to test the core numbers, matching original logic
  return phoneRegex.test(phone.replaceAll(/\D/g, ""));
};

/**
 * Validates an email format using a standard regex.
 * @param {string} email - The email string.
 * @returns {boolean} True if valid, false otherwise.
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength (basic > 8 characters).
 * @param {string} password - The password string.
 * @returns {boolean} True if valid, false otherwise.
 */
export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 8;
};
