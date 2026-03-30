import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdopterProfile from '../models/AdopterProfile.js';

// Load env vars
dotenv.config();

const migrateProfiles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected...');
    console.log('Starting AdopterProfile migration...');

    const profiles = await AdopterProfile.find({});
    let updatedCount = 0;

    for (const profile of profiles) {
      let needsUpdate = false;

      // Ensure household.hasExistingPets and household.existingPetsDescription exist
      if (profile.household) {
        // If household.existingPets is a string and hasExistingPets is not defined
        if (typeof profile.household.existingPets === 'string' && profile.household.hasExistingPets === undefined) {
          const hasPets = profile.household.existingPets.trim().toLowerCase() !== 'none' && 
                          profile.household.existingPets.trim() !== '';
          
          profile.household.hasExistingPets = hasPets;
          profile.household.existingPetsDescription = hasPets ? profile.household.existingPets : '';
          
          needsUpdate = true;
        }

        // Apply new default for remaining fields if missing
        if (profile.household.hasChildren === undefined) {
          profile.household.hasChildren = false;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await profile.save();
        updatedCount++;
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} out of ${profiles.length} profiles.`);
    process.exit(0);

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrateProfiles();
