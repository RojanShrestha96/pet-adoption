/**
 * LIVE SCORING VERIFICATION SCRIPT (DEBUG version)
 * This script runs the actual PetMate V2 Engine logic with extra logging.
 */
import { calculateCompatibility } from '../controllers/compatibilityController.js';

// 1. MOCK PET: "Turbo" (High-Energy Large Dog)
const mockPet = {
  name: "Turbo",
  energyScore: 5,
  independenceTolerance: 3,
  spaceNeeds: "house-required",
  estimatedMonthlyCost: 8000,
  environment: {
    idealEnvironment: "garden-required",
    minSpaceSqm: 50
  },
  behaviour: {
    energyScore: 5,
    separationAnxiety: "severe",
    trainingDifficulty: "challenging"
  },
  compatibility: {
    goodWithKids: "no",
    goodWithPets: "no"
  },
  medical: {
    healthStatus: "healthy"
  }
};

// 2. MOCK ADOPTER: "Busy Apartment Dweller with Kids"
const mockProfile = {
  lifestyle: {
    activityLevel: "sedentary",
    maxContinuousAloneTime: 10,
    experienceLevel: "first-time",
    monthlyPetBudget: "under-5000",
    workStyle: "office",
    upcomingLifeChanges: ["moving-home"]
  },
  household: {
    homeType: "apartment",
    hasFencedYard: false,
    hasChildren: true,
    hasExistingPets: true,
    existingPets: "One small dog",
    ownershipStatus: "rent",
    landlordPermission: true,
    annualVaccinations: true, // +2
    safeEnvironment: true     // +2
  }
};

const result = calculateCompatibility(mockProfile, mockPet);

console.log("\n--- DEBUG PILLAR DUMP ---");
result.factors.forEach(f => {
  console.log(JSON.stringify(f, null, 2));
});

console.log("\n--- FINAL SUMMARY ---");
console.log(`SCORE: ${result.percentage}%`);
console.log(`FLAGS: ${result.advisories.filter(a => a.type === 'flag').length}`);
