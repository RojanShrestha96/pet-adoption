import express from 'express';
import { geocodeAddress, reverseGeocode } from '../services/geoService.js';

const router = express.Router();

/**
 * POST /api/geocode
 * Public — no auth required.
 * Body: { address: string }
 * Returns: { lat, lng, formattedAddress }
 */
router.post('/', async (req, res) => {
  const { address } = req.body;

  if (!address || typeof address !== 'string' || !address.trim()) {
    return res.status(400).json({ message: 'address is required' });
  }

  const result = await geocodeAddress(address);

  if (!result) {
    return res.status(404).json({
      message: 'Location not found. Try a more specific name, e.g. "Thamel, Kathmandu".',
    });
  }

  return res.json(result);
});

/**
 * GET /api/geocode/reverse?lat=...&lng=...
 * Public — no auth required.
 */
router.get('/reverse', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'lat and lng are required' });
  }

  const label = await reverseGeocode(parseFloat(lat), parseFloat(lng));

  if (!label) {
    return res.status(404).json({ message: 'Address not found for these coordinates' });
  }

  // Parse display_name to extract a concise city/area name
  const city = label.split(',')[0] || label;

  return res.json({ label: city, fullAddress: label });
});

export default router;
