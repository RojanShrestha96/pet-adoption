import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pet from '../models/Pet.js';

// Load env vars
dotenv.config();

const migratePets = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected...');
    console.log('Starting Pet migration for V2 Compatibility Engine...');

    const pets = await Pet.find({});
    let updatedCount = 0;

    for (const pet of pets) {
      let needsUpdate = false;
      
      // Ensure V2 default properties exist on the pet
      pet.compatibility = pet.compatibility || {};
      pet.behaviour = pet.behaviour || {};
      pet.environment = pet.environment || {};
      pet.financial = pet.financial || {};

      // 1. Compatibility Defaults
      if (pet.compatibility.goodWithKids === undefined) {
        pet.compatibility.goodWithKids = 'yes';
        needsUpdate = true;
      }
      if (pet.compatibility.goodWithPets === undefined) {
        pet.compatibility.goodWithPets = 'yes';
        needsUpdate = true;
      }

      // 2. Behaviour Defaults (crucial for engine)
      if (pet.behaviour.energyScore === undefined) {
        pet.behaviour.energyScore = 3; // Default to moderate
        needsUpdate = true;
      }
      if (!pet.behaviour.separationAnxiety) {
        pet.behaviour.separationAnxiety = 'moderate';
        needsUpdate = true;
      }
      if (!pet.behaviour.attachmentStyle) {
        pet.behaviour.attachmentStyle = 'moderate';
        needsUpdate = true;
      }
      if (!pet.behaviour.trainingDifficulty) {
        pet.behaviour.trainingDifficulty = 'moderate';
        needsUpdate = true;
      }

      // 3. Environment Defaults
      if (!pet.environment.idealEnvironment) {
        pet.environment.idealEnvironment = 'indoor-only';
        needsUpdate = true;
      }
      
      // 4. Financial Defaults
      if (pet.financial.estimatedMonthlyCost === undefined) {
        pet.financial.estimatedMonthlyCost = 50; // default modest cost
        needsUpdate = true;
      }

      if (needsUpdate) {
        await mongoose.connection.collection('pets').updateOne(
          { _id: pet._id },
          { $set: { 
            compatibility: pet.compatibility,
            behaviour: pet.behaviour,
            environment: pet.environment,
            financial: pet.financial
          }}
        );
        updatedCount++;
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} out of ${pets.length} pets.`);
    process.exit(0);

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migratePets();
