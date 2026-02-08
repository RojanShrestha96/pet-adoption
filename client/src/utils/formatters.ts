/**
 * Formats a long address string into a shorter, more readable format.
 * Specifically targets typical address formats by extracting the most relevant parts (street/locality).
 * 
 * Example: "682, Jupiter Tole Marg, Tikhidewal, Lalitpur-14..." -> "Jupiter Tole Marg, Tikhidewal"
 */
export const formatAddress = (address: string | undefined | null): string => {
  if (!address) return "Location not available";

  // Split by comma and trim parts
  const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);

  if (parts.length === 0) return address;

  // Heuristic: If the first part is just a number (house number), skip it
  let startIndex = 0;
  if (/^\d+$/.test(parts[0]) || parts[0].length < 5 && /\d/.test(parts[0])) {
    startIndex = 1;
  }

  // If we don't have enough parts after skipping, just return the original or what we have
  if (parts.length <= startIndex) return parts[0] || address;

  // Take the next 1-2 parts as the "short address"
  // If we have enough parts, take 2. Otherwise take 1.
  const relevantParts = parts.slice(startIndex, startIndex + 2);
  
  return relevantParts.join(', ');
};
