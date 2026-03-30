import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

import AdopterProfile from "../models/AdopterProfile.js";

async function migrate() {
  console.log("Starting AdopterProfile V2.1 Schema Migration...");
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const profiles = await AdopterProfile.find({});
    let migratedCount = 0;

    for (const profile of profiles) {
      let isModified = false;
      const household = profile.household || {};

      // 1. Migrate Housing (Legacy: rentOwn, ownershipStatus -> New: housing.type)
      if (!household.housing || !household.housing.type) {
        const legacyType = household.ownershipStatus || household.rentOwn;
        if (legacyType) {
          household.housing = {
            type: legacyType === "rent" ? "rent" : legacyType === "own" ? "own" : "live-with-family",
            landlordPermission: household.landlordPermission === true
          };
          isModified = true;
        }
      }

      // 2. Migrate Pets (Legacy: regex parsing text -> New: explicit booleans)
      if (!household.hasDogs && !household.hasCats) {
        const petText = (household.existingPetsDescription || household.existingPets || "").toLowerCase();
        if (petText) {
          if (/dog|puppy|pup/.test(petText)) household.hasDogs = true;
          if (/cat|kitten|kitty/.test(petText)) household.hasCats = true;
          if (/bird|rabbit|hamster|fish|guinea/.test(petText)) household.hasSmallAnimals = true;
          isModified = true;
        }
      }

      // 3. Migrate Children Ages (Legacy: childrenAgeRange string array -> New: childrenAges Enum mapping)
      if (household.hasChildren && household.childrenAgeRange?.length > 0 && (!household.childrenAges || household.childrenAges.length === 0)) {
        const mappedAges = [];
        household.childrenAgeRange.forEach(age => {
          if (age === "infant-2") mappedAges.push("infant");
          if (age === "toddler-2-5") mappedAges.push("toddler");
          if (age === "school-age-6-12") mappedAges.push("school-age");
          if (age === "teen-13+") mappedAges.push("teen");
        });
        household.childrenAges = mappedAges;
        isModified = true;
      }

      // 4. Migrate Budget (Legacy: USD strings -> New: NPR tiers)
      const lifestyle = profile.lifestyle || {};
      if (lifestyle.monthlyPetBudget) {
        if (lifestyle.monthlyPetBudget === "under-100") {
          lifestyle.monthlyPetBudget = "under-5000";
          isModified = true;
        } else if (lifestyle.monthlyPetBudget === "100-300") {
          lifestyle.monthlyPetBudget = "5000-10000";
          isModified = true;
        } else if (lifestyle.monthlyPetBudget === "over-300") {
          lifestyle.monthlyPetBudget = "over-20000";
          isModified = true;
        }
      }

      if (isModified) {
        profile.markModified('household');
        profile.markModified('lifestyle');
        await profile.save({ validateBeforeSave: false }); // Skip validation for pure data migration
        migratedCount++;
      }
    }

    console.log(`Migration complete. Successfully migrated ${migratedCount} profiles to V2.1 schema.`);
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    mongoose.connection.close();
  }
}

migrate();
