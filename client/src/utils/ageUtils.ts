/**
 * Shared age utility functions used across all components.
 * age is stored as { years: number, months: number } in the DB.
 *
 * Examples:
 *   { years: 1, months: 5 } → "1 yr 5 mos"
 *   { years: 0, months: 5 } → "5 mos"
 *   { years: 2, months: 0 } → "2 yrs"
 *   { years: 0, months: 0 } → "Newborn"
 */

export type PetAge = { years: number; months: number };

/**
 * Formats a structured age object into a human-readable string.
 * Also accepts legacy string values gracefully.
 */
export function formatAge(age: PetAge | string | null | undefined): string {
  if (!age) return "Unknown age";
  if (typeof age === "string") return age; // graceful fallback for legacy string data

  const parts: string[] = [];
  if (age.years > 0)
    parts.push(`${age.years} ${age.years === 1 ? "yr" : "yrs"}`);
  if (age.months > 0)
    parts.push(`${age.months} ${age.months === 1 ? "mo" : "mos"}`);

  return parts.length > 0 ? parts.join(" ") : "Newborn";
}

/**
 * Converts a structured age object to total months.
 * Used for filtering and sorting.
 */
export function ageToMonths(age: PetAge | string | null | undefined): number {
  if (!age) return 0;
  if (typeof age === "string") return parseInt(age) * 12 || 0; // legacy fallback
  return (age.years || 0) * 12 + (age.months || 0);
}
