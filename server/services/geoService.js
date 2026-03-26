/**
 * geoService.js — Nominatim geocoding utility
 *
 * Uses OpenStreetMap Nominatim (free, no API key).
 * Country bias: Nepal (np) for accurate local results.
 * Rate limit: 1 req/sec — only called on profile save, NOT on every search.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const HEADERS = {
  'User-Agent': 'PetMate-App/1.0 (pet adoption platform)',
  'Accept-Language': 'en',
};

/**
 * Geocode a free-text address string into coordinates.
 * @param {string} query  e.g. "Thamel, Kathmandu" or "Lalitpur, Nepal"
 * @returns {{ lat: number, lng: number, formattedAddress: string } | null}
 */
export async function geocodeAddress(query) {
  if (!query || !query.trim()) return null;

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      countrycodes: 'np',   // bias to Nepal
      addressdetails: '1',
      limit: '1',
    });

    const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(5000), // 5-second timeout
    });

    if (!res.ok) {
      console.warn('[geoService] Nominatim HTTP error:', res.status);
      return null;
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[geoService] No results for:', query);
      return null;
    }

    const { lat, lon, display_name } = data[0];
    return {
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      formattedAddress: display_name,
    };
  } catch (err) {
    // Never throw — geocoding failure should never crash the caller
    console.warn('[geoService] geocodeAddress failed:', err.message);
    return null;
  }
}
/**
 * Reverse geocode coordinates [lat, lng] into a display name.
 * @param {number} lat 
 * @param {number} lng 
 * @returns {string | null}
 */
export async function reverseGeocode(lat, lng) {
  if (lat === undefined || lng === undefined) return null;

  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1',
    });

    const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.display_name;
  } catch (err) {
    console.warn('[geoService] reverseGeocode failed:', err.message);
    return null;
  }
}
