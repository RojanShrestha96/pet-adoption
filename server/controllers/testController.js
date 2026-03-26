import { geocodeAddress } from "../services/geoService.js";
import Shelter from "../models/Shelter.js";

/**
 * Manual Haversine Formula Implementation
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} distance in km
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * GET /api/test/geolocation
 * Query: ?location=Kathmandu&compareWith=Lalitpur&radius=25&seed=true
 */
export const testGeolocation = async (req, res) => {
  try {
    const { location, compareWith, radius = 25, seed } = req.query;

    if (!location) {
      return res.status(400).json({ message: "location is required (?location=...)" });
    }

    // ── STEP 0: Optional Seeding ─────────────────────────────────────────────
    if (seed === "true") {
      const testShelters = [
        { name: "Kathmandu Animal Shelter", city: "Kathmandu", coords: [85.3240, 27.7172] },
        { name: "Patan Pet Rescue", city: "Lalitpur", coords: [85.3167, 27.6667] },
        { name: "Bhaktapur Animal Care", city: "Bhaktapur", coords: [85.4278, 27.6710] }
      ];

      for (const s of testShelters) {
        await Shelter.findOneAndUpdate(
          { name: s.name },
          {
            name: s.name,
            city: s.city,
            location: {
              type: "Point",
              coordinates: s.coords,
              formattedAddress: `${s.city}, Nepal`
            }
          },
          { upsert: true, new: true }
        );
      }
      console.log("[GeoTest] Seeded test shelters.");
    }

    // ── STEP 1: Geocode Locations ──────────────────────────────────────────
    const locA = await geocodeAddress(location);
    const locB = compareWith ? await geocodeAddress(compareWith) : null;

    if (!locA) {
      return res.status(404).json({ message: `Could not geocode location: ${location}` });
    }

    const radiusKm = parseFloat(radius);
    const latA = locA.lat;
    const lngA = locA.lng;

    // ── STEP 3: Query MongoDB $geoNear ─────────────────────────────────────
    const mongoResults = await Shelter.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lngA, latA] },
          distanceField: "distanceMeters",
          maxDistance: radiusKm * 1000,
          spherical: true,
          query: { "location.coordinates": { $exists: true, $not: { $size: 0 } } }
        }
      },
      {
        $project: {
          name: 1,
          location: 1,
          distanceMeters: 1
        }
      }
    ]);

    // ── STEP 4: Compare Distances ──────────────────────────────────────────
    const results = mongoResults.map(s => {
      const shelterLng = s.location.coordinates[0];
      const shelterLat = s.location.coordinates[1];
      
      const mongoDistanceKm = parseFloat((s.distanceMeters / 1000).toFixed(4));
      const manualDistanceKm = parseFloat(haversineDistance(latA, lngA, shelterLat, shelterLng).toFixed(4));
      const differenceKm = Math.abs(mongoDistanceKm - manualDistanceKm);

      let status = "ACCURATE";
      if (differenceKm > 0.5) status = "INVESTIGATE";
      else if (differenceKm > 0.1) status = "ACCEPTABLE";

      return {
        shelterName: s.name,
        coordinates: s.location.coordinates,
        mongoDistanceKm,
        haversineDistanceKm: manualDistanceKm,
        differenceKm: parseFloat(differenceKm.toFixed(4)),
        status
      };
    });

    const response = {
      input: {
        location,
        coordinates: { lat: latA, lng: lngA }
      },
      results,
      meta: {
        radiusUsed: radiusKm,
        totalFound: results.length,
        averageError: results.length > 0 
          ? (results.reduce((sum, r) => sum + r.differenceKm, 0) / results.length).toFixed(5)
          : 0
      }
    };

    if (locB) {
      response.compareWith = {
        location: compareWith,
        coordinates: { lat: locB.lat, lng: locB.lng },
        distanceBetweenInputs: haversineDistance(latA, lngA, locB.lat, locB.lng).toFixed(4)
      };
    }

    res.json(response);

  } catch (error) {
    console.error("[GeoTest] Error:", error);
    res.status(500).json({ message: "Internal test error", error: error.message });
  }
};

/**
 * GET /api/test/distance
 * Diagnostic endpoint: runs the exact $geoNear pipeline and returns per-shelter distances.
 * Query: ?lat=27.7172&lng=85.3240&radius=50
 */
export const testDistance = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const radiusKm = parseFloat(radius) || 50;

    const results = await Shelter.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lngNum, latNum] },
          distanceField: "distanceMeters",
          maxDistance: radiusKm * 1000,
          spherical: true,
          query: {
            "location.coordinates": {
              $exists: true,
              $not: { $size: 0 },
              $nin: [[0, 0]],
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          city: 1,
          "location.coordinates": 1,
          "location.formattedAddress": 1,
          distanceMeters: 1,
        },
      },
    ]);

    const diagnostics = results.map((s) => {
      const shelterLng = s.location?.coordinates?.[0];
      const shelterLat = s.location?.coordinates?.[1];
      const mongoKm = parseFloat((s.distanceMeters / 1000).toFixed(4));
      const haversineKm = parseFloat(haversineDistance(latNum, lngNum, shelterLat, shelterLng).toFixed(4));
      const isZero = mongoKm === 0;
      const isSwapped = Math.abs(haversineDistance(latNum, lngNum, shelterLng, shelterLat) - mongoKm) < 0.01;

      return {
        shelter: s.name,
        city: s.city,
        storedCoordinates: s.location?.coordinates,
        formattedAddress: s.location?.formattedAddress,
        mongoDistanceKm: mongoKm,
        haversineDistanceKm: haversineKm,
        flags: {
          isZeroDistance: isZero,
          possibleCoordSwap: isSwapped && !isZero,
          missingCoordinates: !s.location?.coordinates,
        },
      };
    });

    const problems = diagnostics.filter(d => d.flags.possibleCoordSwap || d.flags.missingCoordinates);

    console.log(`[GeoTest/Distance] Queried ${results.length} shelters near [${lngNum},${latNum}]`);
    problems.forEach(p => console.warn(`[GeoTest/Distance] PROBLEM shelter: ${p.shelter}`, JSON.stringify(p.flags)));

    res.json({
      queryCoordinates: { lat: latNum, lng: lngNum },
      radiusKm,
      totalFound: diagnostics.length,
      problems: problems.length,
      results: diagnostics,
    });
  } catch (error) {
    console.error("[GeoTest/Distance] Error:", error);
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};
