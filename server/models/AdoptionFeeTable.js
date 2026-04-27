import mongoose from "mongoose";

/**
 * AdoptionFeeTable
 *
 * One document per shelter. Stores the configurable fee table for
 * adoption fees, broken down by species and age range.
 *
 * Adding new species or age tiers requires no code changes — shelters
 * manage this entirely through the fee-table API endpoints.
 *
 * Fee calculation priority:
 *   1. Find the most specific matching entry (species + age range).
 *   2. If no entry matches, fall back to defaultFee.
 *   3. defaultFee itself defaults to 0 (free adoption).
 *
 * Age is stored in months so the range logic is unambiguous:
 *   Puppy/Kitten : minAgeMonths=0,   maxAgeMonths=6
 *   Young        : minAgeMonths=7,   maxAgeMonths=24
 *   Adult        : minAgeMonths=25,  maxAgeMonths=84
 *   Senior       : minAgeMonths=85,  maxAgeMonths=9999
 */

const feeEntrySchema = new mongoose.Schema(
  {
    species: {
      type: String,
      required: true,
      enum: ["dog", "cat", "other"],
    },
    label: {
      type: String,
      trim: true,
      // Human-readable label displayed in the UI, e.g. "Puppy (0–6 months)"
    },
    minAgeMonths: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    maxAgeMonths: {
      type: Number,
      required: true,
      min: 0,
      // 9999 is the sentinel for "no upper bound" (senior animals)
      default: 9999,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
      // Fee in NPR
    },
  },
  { _id: false } // Sub-docs do not need their own _id
);

const adoptionFeeTableSchema = new mongoose.Schema(
  {
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: true,
      unique: true, // One fee table per shelter
      index: true,
    },

    // Ordered list of fee entries. Evaluated top-to-bottom; first match wins.
    speciesRates: {
      type: [feeEntrySchema],
      default: [],
    },

    // Fallback fee when no entry matches (e.g. exotic animal with no entry).
    // Defaults to 0 — free adoption — so shelters that don't configure fees
    // are not accidentally blocking adoptions.
    defaultFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // ISO 4217 currency code. NPR for Nepal.
    currency: {
      type: String,
      default: "NPR",
      uppercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

/**
 * Instance method: calculate the adoption fee for a given pet.
 *
 * @param {string} species  - 'dog' | 'cat' | 'other'
 * @param {number} ageMonths - Pet age in months (parsed from pet.age string by caller)
 * @returns {number} The fee in NPR (or the currency stored in this table)
 */
adoptionFeeTableSchema.methods.calculateFee = function (species, ageMonths) {
  const normalizedSpecies = (species || "other").toLowerCase();
  const age = typeof ageMonths === "number" ? ageMonths : 0;

  for (const entry of this.speciesRates) {
    if (
      entry.species === normalizedSpecies &&
      age >= entry.minAgeMonths &&
      age <= entry.maxAgeMonths
    ) {
      return entry.fee;
    }
  }

  return this.defaultFee;
};

const AdoptionFeeTable = mongoose.model(
  "AdoptionFeeTable",
  adoptionFeeTableSchema
);

export default AdoptionFeeTable;
