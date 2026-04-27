import Pet from "../models/Pet.js";
import AdopterProfile from "../models/AdopterProfile.js";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PetMate Compatibility Engine v2.1 — 8-factor bidirectional scoring
 *
 * V2.1 changes: NPR budget tiers, hybrid worst-case hours, boolean pet detection,
 * child safety zero-score for unknown age, score=0 fallbacks for critical pillars,
 * proportional space penalty, explicit preference-first energy, input validation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Issue 16: Input validation guard ─────────────────────────────────────────
function validate(profile, pet) {
  if (!pet) throw new Error("[Engine] Missing pet record — cannot score.");
}

// ── Issue 1: NPR-aligned budget tier map ─────────────────────────────────────
function getBudgetMax(tier) {
  const map = {
    "under-5000":   5000,
    "5000-10000":   10000,
    "10000-20000":  20000,
    "over-20000":   Infinity,
    // Legacy USD-era tiers — kept for backward compat with old profiles
    "under-100":    5000,
    "100-300":      10000,
    "over-300":     Infinity,
  };
  return map[tier] ?? null;
}

// ── Grade thresholds ──────────────────────────────────────────────────────────
const GRADE_THRESHOLDS = { great: 75, good: 50 };

function getGrade(score) {
  if (score >= GRADE_THRESHOLDS.great)
    return { label: "Great Match", emoji: "✅", color: "success" };
  if (score >= GRADE_THRESHOLDS.good)
    return { label: "Good Match", emoji: "⚠️", color: "warning" };
  return { label: "Some Concerns", emoji: "🔶", color: "error" };
}

function scoreFactor({ label, score, maxScore, explanation, isFallback = false, flag = null, missingField = null, isPetDataMissing = false, inputs = {}, ruleApplied = "Standard Logic", calculation = "No specific math applied" }) {
  const boundedScore = Math.min(Math.max(Math.round(score), 0), maxScore);
  return {
    label,
    score: boundedScore,
    maxScore,
    percentage: Math.round((boundedScore / maxScore) * 100),
    deduction: maxScore - boundedScore,
    inputs,
    ruleApplied,
    calculation,
    reason: explanation, // Provided for AI grounding
    explanation, // Legacy field
    isFallback,
    flag,
    missingField,
    isPetDataMissing,
  };
}

// ── Issue 4: Derive alone hours — hybrid uses WORST-CASE (8h office days), not averages ──
function deriveAloneHours(lifestyle) {
  const ws = lifestyle?.workStyle;
  if (ws === "fully-remote" || ws === "remote") return 0;
  if (ws === "hybrid") return 8; // V2.1: worst-case daily hours on office days
  if (ws === "office-based" || ws === "office") return 8;
  const legacy = lifestyle?.hoursAwayPerDay;
  return typeof legacy === "number" ? legacy : 6;
}

// ── Bug 6: resolve pet energy level from canonical field first, then numeric score ──
function resolvePetEnergyLevel(pet) {
  if (pet.energyLevel) return pet.energyLevel;
  const score = pet.behaviour?.energyScore;
  if (!score) return null;
  if (score <= 1) return "low";
  if (score <= 2) return "low";
  if (score === 3) return "moderate";
  if (score === 4) return "high";
  return "very-high";
}

// ── Normalise experience level (handles legacy "none"/"some" values) ─────────
function normaliseExperience(raw) {
  if (!raw) return null;
  if (raw === "none" || raw === "first-time") return "first-time";
  if (raw === "some" || raw === "some-experience") return "some-experience";
  if (raw === "experienced") return "experienced";
  return null;
}

// ── Normalise activity level ──────────────────────────────────────────────────
function normaliseActivity(raw) {
  if (!raw) return null;
  if (raw === "sedentary" || raw === "low") return "low";
  if (raw === "moderate") return "moderate";
  if (raw === "active" || raw === "high" || raw === "very-active") return "high";
  return null;
}

// ── Support offset: reduce effective alone hours based on petCareSupport ─────
function supportAloneOffset(petCareSupport) {
  if (!petCareSupport || petCareSupport.length === 0) return 0;
  let offset = 0;
  if (petCareSupport.includes("dog-walker") || petCareSupport.includes("doggy-daycare")) offset += 3;
  if (petCareSupport.includes("pet-sitter")) offset += 2;
  if (petCareSupport.includes("trusted-family-nearby")) offset += 1;
  return Math.min(offset, 8); // cap at full working day
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTOR 1 — Energy Match (15 pts)
// Pet: behaviour.energyScore (1–5)
// Adopter: lifestyle.activityLevel + lifestyle.preferredEnergyLevel
// ─────────────────────────────────────────────────────────────────────────────
function scoreEnergyMatch(profile, pet) {
  const energyLevel = resolvePetEnergyLevel(pet);
  const energyScore = pet.behaviour?.energyScore;
  const activityRaw = profile.lifestyle?.activityLevel;
  const preferenceRaw = profile.lifestyle?.preferredEnergyLevel;

  const inputs = {
    petEnergyLevel: energyLevel,
    petEnergyScore: energyScore,
    adopterActivityRaw: activityRaw,
    adopterPreferenceRaw: preferenceRaw
  };

  // Issue 8: Preference-first logic — use preferredEnergyLevel if activity not set
  if (!energyLevel) {
    return scoreFactor({
      label: "Energy Match",
      score: 0,
      maxScore: 15,
      explanation: `${pet.name}'s energy level hasn't been entered by the shelter. This factor will be scored once the shelter completes the pet's profile.`,
      isFallback: false,
      missingField: "pet.energyLevel",
      isPetDataMissing: true,
      inputs,
      ruleApplied: "Missing Pet Data",
      calculation: "Score = 0 due to null pet energy level"
    });
  }

  // Issue 10: Score=0 (not 8) when no energy data at all
  if (!activityRaw && !preferenceRaw) {
    return scoreFactor({
      label: "Energy Match",
      score: 0,
      maxScore: 15,
      explanation: `Your activity level and energy preferences haven't been entered. Complete your Lifestyle profile to see this score.`,
      isFallback: false,
      missingField: "lifestyle.activityLevel",
      inputs,
      ruleApplied: "Missing Adopter Data",
      calculation: "Score = 0 due to null adopter activity and preference"
    });
  }

  const isFallback = false;

  const activity = normaliseActivity(activityRaw); // "low" | "moderate" | "high"

  // Map energyLevel label to numeric 1–5 for matrix lookup
  const levelToScore = { "low": 1.5, "moderate": 3, "high": 4.5, "very-high": 5 };
  const petEnergyNum = energyScore ?? Math.round(levelToScore[energyLevel] ?? 3);

  // Activity-to-energy compatibility table
  const compatMatrix = {
    low:      { 1: 12, 2: 10, 3: 7, 4: 4, 5: 0 },
    moderate: { 1: 10, 2: 12, 3: 12, 4: 10, 5: 7 },
    high:     { 1: 7,  2: 10, 3: 12, 4: 12, 5: 12 },
  };

  // Find closest bucket in matrix
  const bucketKey = Math.min(5, Math.max(1, Math.round(petEnergyNum)));
  let base = compatMatrix[activity]?.[bucketKey] ?? 8;

  // Preference modifier
  let prefMod = 0;
  if (preferenceRaw && preferenceRaw !== "no-preference") {
    const preferenceMap = { low: ["low"], moderate: ["moderate"], high: ["high", "very-high"] };
    const aligned = preferenceMap[preferenceRaw]?.includes(energyLevel);
    prefMod = aligned ? 3 : -2;
  }

  const score = Math.max(0, Math.min(15, base + prefMod));

  let explanation = `${pet.name} has a ${energyLevel} energy level. `;
  explanation += `Your profile indicates a ${activity} activity level`;
  explanation += preferenceRaw && preferenceRaw !== "no-preference"
    ? ` with a preference for ${preferenceRaw}-energy pets.`
    : ".";

  if (score >= 12) explanation += ` This is a strong energy match.`;
  else if (score >= 8) explanation += ` This is a reasonable match but may require a commitment to regular exercise routines.`;
  else explanation += ` There is a notable energy mismatch. A ${energyLevel === "low" ? "higher" : "lower"}-energy pet may be a better fit.`;

  return scoreFactor({ 
    label: "Energy Match", 
    score, 
    maxScore: 15, 
    explanation,
    inputs: { ...inputs, normalizedActivity: activity, petEnergyNum },
    ruleApplied: "Activity to Energy Compatibility Matrix with Preference Modifier",
    calculation: `Base score (${base}) + Preference modifier (${prefMod}) = ${Math.max(0, Math.min(15, base + prefMod))}`
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTOR 2 — Alone-Time Tolerance (15 pts)
// Pet: behaviour.separationAnxiety + behaviour.attachmentStyle
// Adopter: lifestyle.workStyle + lifestyle.hybridDaysHomePerWeek + lifestyle.petCareSupport
// ─────────────────────────────────────────────────────────────────────────────
function scoreAloneTimeTolerance(profile, pet) {
  const anxiety = pet.behaviour?.separationAnxiety;
  const attachment = pet.behaviour?.attachmentStyle;
  // Bug 2 fix: use maxContinuousAloneTime if available, fall back to derived hours
  const maxContAlone = profile.lifestyle?.maxContinuousAloneTime;
  const workStyle = profile.lifestyle?.workStyle;
  const petCareSupport = profile.lifestyle?.petCareSupport ?? [];

  const inputs = {
    separationAnxiety: anxiety,
    attachmentStyle: attachment,
    maxContinuousAloneTime: maxContAlone,
    workStyle: workStyle,
    petCareSupport: petCareSupport
  };

  const isFallback = !anxiety || (!maxContAlone && !workStyle);

  if (isFallback) {
    return scoreFactor({
      label: "Alone-Time Tolerance",
      score: 8,
      maxScore: 15,
      explanation: `${pet.name}'s separation needs or your alone-time details haven't been fully entered. This factor is scored conservatively.`,
      isFallback: true,
      missingField: !anxiety ? "pet.behaviour.separationAnxiety" : "lifestyle.maxContinuousAloneTime",
      inputs,
      ruleApplied: "Missing Minimal Data",
      calculation: "Conservative fallback score of 8"
    });
  }

  // Prefer explicit maxContinuousAloneTime; fall back to derived daily hours
  const rawHours = maxContAlone ?? deriveAloneHours(profile.lifestyle);
  const supportOffset = maxContAlone ? 0 : supportAloneOffset(petCareSupport); // offset only when using daily hours
  const effectiveHours = Math.max(0, rawHours - supportOffset);

  // If pet has independenceTolerance set, use it as a hard threshold
  const indepTol = pet.independenceTolerance;
  if (typeof indepTol === "number" && indepTol > 0 && effectiveHours > indepTol) {
    const overshoot = effectiveHours - indepTol;
    const penalty = Math.min(15, Math.round(overshoot * 2.5));
    const score = Math.max(0, 15 - penalty);
    const flag = overshoot >= 3
      ? `${pet.name} is comfortable alone for up to ${indepTol}h, but you may be away for ~${effectiveHours.toFixed(0)}h. This is a significant welfare concern.`
      : null;
    return scoreFactor({
      label: "Alone-Time Tolerance",
      score,
      maxScore: 15,
      explanation: `${pet.name} is comfortable being alone for up to ${indepTol} hours. Your schedule means up to ~${effectiveHours.toFixed(0)} hours alone.`,
      flag,
      inputs: { ...inputs, effectiveHours, independenceTolerance: indepTol, overshoot },
      ruleApplied: "Hard Threshold Independence Tolerance Penalty",
      calculation: `Overshoot (${overshoot}) * 2.5 penalty = -${penalty} pts -> Max(0, 15 - ${penalty}) = ${score}`
    });
  }

  // Base score table: [anxiety][effective hours bracket]
  function getBase(anx, hrs) {
    const brackets = [
      { max: 2,  scores: { none: 15, mild: 15, moderate: 15, severe: 15 } },
      { max: 4,  scores: { none: 15, mild: 12, moderate: 10, severe: 7  } },
      { max: 6,  scores: { none: 13, mild: 9,  moderate: 6,  severe: 2  } },
      { max: 8,  scores: { none: 10, mild: 5,  moderate: 2,  severe: 0  } },
      { max: 99, scores: { none: 7,  mild: 2,  moderate: 0,  severe: 0  } },
    ];
    for (const bracket of brackets) {
      if (hrs <= bracket.max) return bracket.scores[anx] ?? 8;
    }
    return 5;
  }

  let score = getBase(anxiety, effectiveHours);
  const baseScore = score;

  if (attachment === "independent") score = Math.min(15, score + 2);
  const velcroFlag =
    attachment === "velcro" && anxiety === "severe" && effectiveHours >= 6
      ? `${pet.name} is a velcro pet with severe separation anxiety. Being alone for ${effectiveHours.toFixed(0)}+ hours is a significant welfare concern. Please discuss a detailed daily care plan with the shelter.`
      : null;

  const timeSource = maxContAlone ? `max continuous alone time of ${maxContAlone}h` : `an estimated work schedule (~${Math.round(effectiveHours)}h alone per day after support)`;
  let explanation = `${pet.name} has ${anxiety} separation anxiety`;
  if (attachment) explanation += ` and an ${attachment} attachment style`;
  explanation += `. Your ${timeSource}.`;
  if (supportOffset > 0) explanation += ` Your pet care support reduces the effective alone time by ~${supportOffset} hours.`;
  if (score >= 12) explanation += ` This is a good fit for ${pet.name}'s alone-time needs.`;
  else if (score >= 7) explanation += ` This is manageable but requires consistent routine and enrichment.`;
  else explanation += ` This is a high-risk mismatch for alone time. Discuss mitigation strategies with the shelter.`;

  return scoreFactor({ 
    label: "Alone-Time Tolerance", 
    score, 
    maxScore: 15, 
    explanation, 
    flag: velcroFlag,
    inputs: { ...inputs, effectiveHours, rawHours, supportOffset, attachment },
    ruleApplied: "Anxiety Matrix vs Effective Hours + Attachment Modifier",
    calculation: `Base score (${baseScore}) from bracket [anxiety:${anxiety}, hours:${effectiveHours}] + Attachment modifier (${attachment === 'independent' ? '+2' : '0'}) = ${score}`
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTOR 3 — Space & Environment Match (10 pts)
// Pet: environment.idealEnvironment + environment.minSpaceSqm
// Adopter: household.homeType + household.hasFencedYard + lifestyle.livingSizeSqm
// ─────────────────────────────────────────────────────────────────────────────
function scoreSpaceEnvironment(profile, pet) {
  const idealEnv = pet.environment?.idealEnvironment;
  const minSqm = pet.environment?.minSpaceSqm ?? 0;
  const homeType = profile.household?.homeType;
  const hasFencedYard = profile.household?.hasFencedYard ?? false;
  const livingSqm = profile.household?.livingSizeSqm;

  // V2.1 Issue 3: Use new housing.type first, fall back to legacy
  const housingType = profile.household?.housing?.type ?? profile.household?.ownershipStatus ?? (profile.household?.rentOwn === "rent" ? "rent" : null);
  const landlordPermission = profile.household?.housing?.landlordPermission ?? profile.household?.landlordPermission;
  const needsLandlordPermission = housingType === "rent" && landlordPermission === false;

  const inputs = {
    petIdealEnv: idealEnv,
    petMinSqm: minSqm,
    adopterHomeType: homeType,
    adopterHasFencedYard: hasFencedYard,
    adopterLivingSqm: livingSqm,
    adopterHousingType: housingType,
    adopterLandlordPermission: landlordPermission
  };

  if (needsLandlordPermission) {
    return scoreFactor({
      label: "Space & Environment",
      score: 0,
      maxScore: 10,
      explanation: `You are renting without landlord permission to keep a pet. This is a hard blocker — please obtain written permission before submitting an application.`,
      flag: `Renting Without Landlord Permission — this is a high-severity concern. Unapproved pets can lead to lease violations and forced rehoming.`,
      inputs,
      ruleApplied: "Hard Blocker: No Landlord Permission",
      calculation: "Score = 0 automatically applied"
    });
  }

  const isFallback = !idealEnv && pet.compatibility?.apartmentFriendly === undefined;

  // Issue 10: score=0 for missing critical environment data
  if (!homeType) {
    return scoreFactor({
      label: "Space & Environment",
      score: 0,
      maxScore: 10,
      explanation: `Your home type hasn't been entered. Complete your Household profile to see this score.`,
      isFallback: false,
      missingField: "household.homeType",
      inputs,
      ruleApplied: "Missing Adopter Data",
      calculation: "Score = 0 due to null homeType"
    });
  }

  if (isFallback) {
    return scoreFactor({
      label: "Space & Environment",
      score: 0,
      maxScore: 10,
      explanation: `${pet.name}'s ideal environment hasn't been entered by the shelter. This factor will be scored once the shelter completes the pet's profile.`,
      isFallback: true,
      isPetDataMissing: true,
      inputs,
      ruleApplied: "Missing Pet Data",
      calculation: "Score = 0 due to null idealEnvironment"
    });
  }

  if (!idealEnv && pet.compatibility?.apartmentFriendly !== undefined) {
    const inApartment = homeType === "apartment";
    const legacyScore = inApartment && !pet.compatibility.apartmentFriendly ? 0
      : inApartment ? 7
      : hasFencedYard ? 10 : 8;
    return scoreFactor({
      label: "Space & Environment",
      score: legacyScore,
      maxScore: 10,
      explanation: `Environment match based on basic apartment-friendly data (detailed assessment not yet entered by shelter).`,
      isFallback: true,
      inputs: { ...inputs, apartmentFriendly: pet.compatibility?.apartmentFriendly },
      ruleApplied: "Legacy Apartment-Friendly Fallback",
      calculation: `Fallback boolean logic applied = ${legacyScore}`
    });
  }

  const envMatrix = {
    "indoor-only": { apartment: 10, condo: 10, house: 10, townhouse: 10, default: 10 },
    "indoor-with-outdoor-access": { house: 10, townhouse: 9, condo: 6, apartment: 5, default: 5 },
    "garden-required": {
      house: hasFencedYard ? 10 : 6, townhouse: hasFencedYard ? 8 : 5,
      condo: 2, apartment: 0, default: 2,
    },
    "rural-preferred": { house: 8, townhouse: 6, condo: 3, apartment: 2, default: 2 },
  };

  const envRow = envMatrix[idealEnv] ?? {};
  let envScore = envRow[homeType] ?? envRow.default ?? 5;
  const baseScore = envScore;

  let spaceNote = "";
  let spacePenalty = 0;
  if (minSqm > 0 && typeof livingSqm === "number") {
    if (livingSqm < minSqm) {
      // Issue 11: Proportional penalty — not capped at an arbitrary 3 points
      const ratio = livingSqm / minSqm;
      spacePenalty = Math.round((1 - ratio) * envScore);
      envScore = Math.max(0, envScore - spacePenalty);
      spaceNote = ` Your living space (${livingSqm} sqm) is below ${pet.name}'s recommended minimum of ${minSqm} sqm — a ${Math.round((1 - ratio) * 100)}% shortfall.`;
    } else {
      spaceNote = ` Your living space (${livingSqm} sqm) meets ${pet.name}'s minimum requirement.`;
    }
  }

  const vocalFlag =
    pet.behaviour?.noiseLevel === "vocal" && homeType === "apartment"
      ? `${pet.name} is a vocal pet. Apartment living may cause noise concerns with neighbours. We recommend confirming this with your building management before applying.`
      : null;

  let vocalPenalty = 0;
  if (vocalFlag) {
    vocalPenalty = 2;
    envScore = Math.max(0, envScore - vocalPenalty);
  }

  const envLabel = {
    "indoor-only": "indoor-only environment",
    "indoor-with-outdoor-access": "indoor home with access to outdoor space",
    "garden-required": "home with a garden",
    "rural-preferred": "rural or suburban setting",
  }[idealEnv] ?? idealEnv;

  if (housingType === "rent" && landlordPermission === true) {
    spaceNote += ` You rent with confirmed landlord permission — this is noted positively.`;
  }

  let explanation = `${pet.name} thrives in a ${envLabel}. Your ${homeType}`;
  if (hasFencedYard) explanation += ` with a fenced yard`;
  explanation += envScore >= 8 ? ` is a great match.` : envScore >= 5 ? ` is an adequate fit.` : ` may not fully meet ${pet.name}'s environment needs.`;
  explanation += spaceNote;

  return scoreFactor({ 
    label: "Space & Environment", 
    score: envScore, 
    maxScore: 10, 
    explanation, 
    flag: vocalFlag,
    inputs: { ...inputs, baseScore, spacePenalty, vocalPenalty },
    ruleApplied: "Environment Matrix vs Home Type + Space Proportional Penalty",
    calculation: `Base (${baseScore}) - Space Penalty (${spacePenalty}) - Vocal Penalty (${vocalPenalty}) = ${envScore}`
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTOR 4 — Children Compatibility (15 pts)
// Pet: compatibility.goodWithKids
// Adopter: household.hasChildren + household.childrenAgeRange
// ─────────────────────────────────────────────────────────────────────────────
function scoreChildrenCompat(profile, pet) {
  const goodWithKids = pet.compatibility?.goodWithKids;
  const hasChildren = profile.household?.hasChildren;
  // V2.1: Use new childrenAges field first, fall back to legacy childrenAgeRange
  const childrenAges = profile.household?.childrenAges ?? [];
  const legacyAgeRange = profile.household?.childrenAgeRange;

  const inputs = {
    petGoodWithKids: goodWithKids,
    adopterHasChildren: hasChildren,
    adopterChildrenAges: childrenAges,
    adopterLegacyAgeRange: legacyAgeRange
  };

  // Issue 10: score=0 when we can't determine children status at all
  if (goodWithKids === undefined && hasChildren === undefined) {
    // Both sides missing — exclude from denominator
    return scoreFactor({
      label: "Children Compatibility",
      score: 0,
      maxScore: 15,
      explanation: `${pet.name}'s children compatibility hasn't been entered by the shelter. This factor will be scored once the shelter completes the pet's profile.`,
      isFallback: false,
      missingField: "pet.compatibility.goodWithKids",
      isPetDataMissing: true,
      inputs,
      ruleApplied: "Missing Both Data",
      calculation: "Score = 0"
    });
  }
  if (goodWithKids === undefined) {
    // Pet side missing only — exclude from denominator
    return scoreFactor({
      label: "Children Compatibility",
      score: 0,
      maxScore: 15,
      explanation: `${pet.name}'s children compatibility hasn't been assessed by the shelter yet. This factor will be scored once they complete the pet's profile.`,
      isFallback: false,
      missingField: "pet.compatibility.goodWithKids",
      isPetDataMissing: true,
      inputs,
      ruleApplied: "Missing Pet Data",
      calculation: "Score = 0"
    });
  }
  if (hasChildren === undefined) {
    // Adopter side missing — counts against adopter, not pet
    return scoreFactor({
      label: "Children Compatibility",
      score: 0,
      maxScore: 15,
      explanation: `Your household children information is incomplete. Complete your Household profile to see this score.`,
      isFallback: false,
      missingField: "household.hasChildren",
      inputs,
      ruleApplied: "Missing Adopter Data",
      calculation: "Score = 0"
    });
  }

  const kidsFlag = typeof goodWithKids === "boolean"
    ? (goodWithKids ? "yes" : "with-supervision")
    : goodWithKids;

  if (!hasChildren) {
    return scoreFactor({
      label: "Children Compatibility",
      score: 15,
      maxScore: 15,
      explanation: `No children in the home — no children compatibility concerns.`,
      inputs,
      ruleApplied: "No Children Present",
      calculation: "Score = 15 automatic pass"
    });
  }

  if (kidsFlag === "yes") {
    return scoreFactor({
      label: "Children Compatibility",
      score: 15,
      maxScore: 15,
      explanation: `${pet.name} is great with children — a wonderful match for your family.`,
      inputs,
      ruleApplied: "KidsFlag: yes",
      calculation: "Score = 15 automatic pass"
    });
  }

  if (kidsFlag === "no") {
    return scoreFactor({
      label: "Children Compatibility",
      score: 0,
      maxScore: 15,
      explanation: `${pet.name} is not recommended in homes with children. Please discuss this seriously with the shelter.`,
      flag: `${pet.name} has been assessed as not suitable for homes with children. This is a significant concern.`,
      inputs,
      ruleApplied: "KidsFlag: no",
      calculation: "Score = 0 automatic fail"
    });
  }

  if (kidsFlag === "with-supervision") {
    // Issue 9: If children present but age unknown → treat as highest risk (score 0)
    const hasAgeData = childrenAges.length > 0 || legacyAgeRange;
    if (!hasAgeData) {
      return scoreFactor({
        label: "Children Compatibility",
        score: 0,
        maxScore: 15,
        explanation: `${pet.name} requires supervision around children. You have children in the home but have not specified their ages. For safety, this is scored as high risk until age information is provided.`,
        flag: `Unknown child ages treated as high risk. Please update your household profile with children's age ranges.`,
        inputs,
        ruleApplied: "Unknown Children Ages under Supervision Rule",
        calculation: "Score = 0 fail open safety guard"
      });
    }

    // V2.1 new childrenAges array ("infant", "toddler", "school-age", "teen")
    const newAgeScoreMap = {
      infant:       { score: 3,  note: "infants require extra caution" },
      toddler:      { score: 7,  note: "toddlers are unpredictable — supervision essential" },
      "school-age": { score: 12, note: "school-age children can learn to interact respectfully" },
      teen:         { score: 13, note: "teenagers can generally manage supervised interactions well" },
    };
    // Legacy mapping
    const legacyAgeScoreMap = {
      "infant-2":        { score: 3,  note: "very young children require extra caution" },
      "toddler-2-5":     { score: 7,  note: "toddlers are unpredictable and supervision is essential" },
      "school-age-6-12": { score: 12, note: "school-age children can learn to interact respectfully" },
      "teen-13+":        { score: 13, note: "teenagers can generally manage supervised interactions well" },
    };

    let lowestScore = 15;
    let lowestNote = "";
    if (childrenAges.length > 0) {
      for (const age of childrenAges) {
        const entry = newAgeScoreMap[age];
        if (entry && entry.score < lowestScore) { lowestScore = entry.score; lowestNote = entry.note; }
      }
    } else if (legacyAgeRange) {
      const entry = legacyAgeScoreMap[legacyAgeRange];
      if (entry) { lowestScore = entry.score; lowestNote = entry.note; }
    }

    const hasInfant = childrenAges.includes("infant") || legacyAgeRange === "infant-2";
    const flag = hasInfant
      ? `${pet.name} requires supervision, and your household has infants. Please discuss child safety protocols with the shelter.`
      : null;

    return scoreFactor({
      label: "Children Compatibility",
      score: lowestScore,
      maxScore: 15,
      explanation: `${pet.name} can live with children but requires supervision — ${lowestNote}. Discuss safety routines with the shelter at the meet & greet.`,
      flag,
      inputs: { ...inputs, hasInfant, evalAgeStrategy: childrenAges.length ? 'new' : 'legacy' },
      ruleApplied: "Supervision Needed vs Youngest Child Age",
      calculation: `Highest risk age score = ${lowestScore}`
    });
  }

  return scoreFactor({ 
    label: "Children Compatibility", 
    score: 0, 
    maxScore: 15, 
    explanation: "Assessed conservatively — missing data.", 
    isFallback: false,
    inputs,
    ruleApplied: "Missing Supervision Classification",
    calculation: "Score = 0 conservative fallback"
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTOR 5 — Existing Pet Compatibility (10 pts)
// Pet: compatibility.goodWithPets
// Adopter: household.existingPets (parsed for type detection)
// ─────────────────────────────────────────────────────────────────────────────
// V2.1: Issue 5 — Use explicit boolean fields, NO regex on free text
function scoreExistingPetCompat(profile, pet) {
  const goodWithPets = pet.compatibility?.goodWithPets;

  // V2.1: hasDogs/hasCats/hasSmallAnimals booleans take priority over legacy hasExistingPets
  const hasDogs = profile.household?.hasDogs === true;
  const hasCats = profile.household?.hasCats === true;
  const hasSmallAnimals = profile.household?.hasSmallAnimals === true;
  const hasPets = hasDogs || hasCats || hasSmallAnimals
    || profile.household?.hasExistingPets === true;

  const inputs = {
    petGoodWithPets: goodWithPets,
    adopterHasDogs: hasDogs,
    adopterHasCats: hasCats,
    adopterHasSmallAnimals: hasSmallAnimals,
    adopterHasPetsOverall: hasPets
  };

  if (goodWithPets === undefined) {
    return scoreFactor({
      label: "Existing Pet Compatibility",
      score: 0,
      maxScore: 10,
      explanation: `${pet.name}'s compatibility with other animals hasn't been assessed by the shelter yet. This factor will be scored once they complete the pet's profile.`,
      isFallback: false,
      missingField: "pet.compatibility.goodWithPets",
      isPetDataMissing: true,
      inputs,
      ruleApplied: "Missing Pet Data",
      calculation: "Score = 0"
    });
  }

  const petsFlag = typeof goodWithPets === "boolean"
    ? (goodWithPets ? "yes" : "no")
    : goodWithPets;

  if (!hasPets) {
    return scoreFactor({
      label: "Existing Pet Compatibility",
      score: 10,
      maxScore: 10,
      explanation: `No existing pets in the home — no inter-pet compatibility concerns.`,
      inputs,
      ruleApplied: "No Pets Present",
      calculation: "Score = 10 automatic pass"
    });
  }

  if (petsFlag === "yes") {
    return scoreFactor({
      label: "Existing Pet Compatibility",
      score: 10,
      maxScore: 10,
      explanation: `${pet.name} gets along well with other animals.`,
      inputs,
      ruleApplied: "Pet Good With Pets: yes",
      calculation: "Score = 10 automatic pass"
    });
  }

  if (petsFlag === "no") {
    return scoreFactor({
      label: "Existing Pet Compatibility",
      score: 0,
      maxScore: 10,
      explanation: `${pet.name} does not do well with other animals in the home. Careful consideration and shelter guidance is needed.`,
      flag: `${pet.name} has been assessed as not suitable for homes with other animals. This is a significant concern.`,
      inputs,
      ruleApplied: "Pet Good With Pets: no",
      calculation: "Score = 0 automatic fail"
    });
  }

  if (petsFlag === "cats-only") {
    // Bias fix: If adopter has dogs, penalize regardless of whether they also have cats
    if (hasDogs) {
      return scoreFactor({
        label: "Existing Pet Compatibility",
        score: 3,
        maxScore: 10,
        explanation: `${pet.name} does best with cats only. Your household has dogs — careful introductions and shelter guidance are essential.`,
        flag: `${pet.name} is noted as getting along with cats but not dogs. Your existing dog(s) may be a concern.`,
        inputs,
        ruleApplied: "Cats-Only Pet vs Adopter Dog",
        calculation: "Score = 3 explicit clash"
      });
    }
    return scoreFactor({
      label: "Existing Pet Compatibility",
      score: 10,
      maxScore: 10,
      explanation: `${pet.name} is fine with cats, which matches your household.`,
      inputs,
      ruleApplied: "Cats-Only Pet vs Adopter No Dogs",
      calculation: "Score = 10 match"
    });
  }

  if (petsFlag === "dogs-only") {
    // Bias fix: If adopter has cats, penalize regardless of whether they also have dogs
    if (hasCats) {
      return scoreFactor({
        label: "Existing Pet Compatibility",
        score: 3,
        maxScore: 10,
        explanation: `${pet.name} does best with dogs only. Your household has cats — careful introductions and shelter guidance are essential.`,
        flag: `${pet.name} is noted as getting along with dogs but not cats. Your existing cat(s) may be a concern.`,
        inputs,
        ruleApplied: "Dogs-Only Pet vs Adopter Cat",
        calculation: "Score = 3 explicit clash"
      });
    }
    return scoreFactor({
      label: "Existing Pet Compatibility",
      score: 10,
      maxScore: 10,
      explanation: `${pet.name} is fine with dogs, which matches your household.`,
      inputs,
      ruleApplied: "Dogs-Only Pet vs Adopter No Cats",
      calculation: "Score = 10 match"
    });
  }

  return scoreFactor({ 
    label: "Existing Pet Compatibility", 
    score: 7, 
    maxScore: 10, 
    explanation: "Assessed conservatively.",
    inputs,
    ruleApplied: "Fallback Compatibility",
    calculation: "Score = 7 cautious estimate"
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTOR 6 — Experience & Training Match (15 pts)
// Pet: behaviour.trainingDifficulty + medical.healthStatus
// Adopter: lifestyle.experienceLevel
// ─────────────────────────────────────────────────────────────────────────────
function scoreExperienceTraining(profile, pet) {
  const trainingDifficulty = pet.behaviour?.trainingDifficulty;
  const healthStatus = pet.medical?.healthStatus ?? "healthy";
  const experienceRaw = profile.lifestyle?.experienceLevel;
  const experience = normaliseExperience(experienceRaw);

  const inputs = {
    petTrainingDifficulty: trainingDifficulty,
    petHealthStatus: healthStatus,
    adopterExperienceRaw: experienceRaw,
    adopterExperience: experience
  };

  if (!experience) {
    return scoreFactor({
      label: "Experience & Training Match",
      score: 0,
      maxScore: 15,
      explanation: `Your experience level hasn't been entered. Complete your Lifestyle profile to see this score.`,
      isFallback: false,
      missingField: "lifestyle.experienceLevel",
      inputs,
      ruleApplied: "Missing Adopter Data",
      calculation: "Score = 0"
    });
  }

  // Issue 7: No size-based inference — return neutral score with warning when training data missing
  if (!trainingDifficulty) {
    const isSpecial = healthStatus === "special-needs" || healthStatus === "treatment";
    let score = experience === "experienced" ? 12 : experience === "some-experience" ? 10 : 7;
    const baseFallback = score;
    let penalty = 0;
    if (isSpecial && experience === "first-time") {
      penalty = score - Math.max(3, score - 3);
      score = Math.max(3, score - 3);
    }
    return scoreFactor({
      label: "Experience & Training Match",
      score,
      maxScore: 15,
      explanation: `${pet.name}'s individual training difficulty hasn't been assessed by the shelter yet — ask them about it. Score is a cautious estimate based on your experience and health status only.`,
      isFallback: true,
      inputs: { ...inputs, isSpecial, baseFallback, penalty },
      ruleApplied: "Missing Pet Data Fallback (Experience Only)",
      calculation: `Fallback base (${baseFallback}) - Special Needs Penalty (${penalty}) = ${score}`
    });
  }

  // Main matrix: trainingDifficulty × experience
  const matrix = {
    easy:        { "first-time": 15, "some-experience": 15, experienced: 15 },
    moderate:    { "first-time": 9,  "some-experience": 14, experienced: 15 },
    challenging: { "first-time": 3,  "some-experience": 9,  experienced: 15 },
  };

  let score = matrix[trainingDifficulty]?.[experience] ?? 9;
  const baseScore = score;

  // Health status modifier for first-time adopters
  const isSpecialNeeds = healthStatus === "special-needs" || healthStatus === "treatment" || healthStatus === "chronic-condition";
  let healthPenalty = 0;
  if (isSpecialNeeds && experience === "first-time") {
    healthPenalty = 3;
    score = Math.max(0, score - healthPenalty);
  }

  const challengeFlag =
    trainingDifficulty === "challenging" && experience === "first-time"
      ? `${pet.name} has been assessed as challenging to train and manage. First-time adopters may find this a significant commitment. The shelter recommends discussing a support and training plan at the meet & greet.`
      : null;

  const experienceLabel = { "first-time": "first-time adopter", "some-experience": "some prior experience with pets", experienced: "experienced pet owner" }[experience];
  const difficultyLabel = { easy: "easy", moderate: "moderately challenging", challenging: "challenging" }[trainingDifficulty];

  let explanation = `${pet.name} has been individually assessed as ${difficultyLabel} to train and manage. You are a${experience === "experienced" ? "n" : ""} ${experienceLabel}.`;
  if (isSpecialNeeds) explanation += ` ${pet.name} also has ongoing health needs that require additional care.`;
  if (score >= 13) explanation += ` This is a good experience match.`;
  else if (score >= 8) explanation += ` This is manageable with commitment and support from the shelter.`;
  else explanation += ` This combination may be demanding. Consider discussing a dedicated support plan with the shelter.`;

  return scoreFactor({ 
    label: "Experience & Training Match", 
    score, 
    maxScore: 15, 
    explanation, 
    flag: challengeFlag,
    inputs: { ...inputs, isSpecialNeeds, baseScore, healthPenalty, challengeFlag },
    ruleApplied: "Training Difficulty vs Experience Matrix + Health Modifier",
    calculation: `Base score (${baseScore}) - Health penalty (${healthPenalty}) = ${score}`
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTOR 7 — Budget & Commitment (10 pts)
// Pet: medical.healthStatus + medical.isSpecialNeeds (if flag exists)
// Adopter: lifestyle.monthlyPetBudget + household.annualVaccinations + household.safeEnvironment
// ─────────────────────────────────────────────────────────────────────────────
// V2.1: Issues 1 + 2 — NPR budget math + bypass removal
function scoreBudgetCommitment(profile, pet) {
  const healthStatus = pet.medical?.healthStatus ?? "healthy";
  const isSpecialNeeds = pet.medical?.isSpecialNeeds === true
    || healthStatus === "special-needs"
    || healthStatus === "treatment"
    || healthStatus === "chronic-condition";

  const budgetTier = profile.lifestyle?.monthlyPetBudget;
  const estimatedCost = pet.estimatedMonthlyCost ?? 0;
  const annualVax = profile.household?.annualVaccinations;
  const safeEnv = profile.household?.safeEnvironment;

  const inputs = {
    petHealthStatus: healthStatus,
    petIsSpecialNeeds: isSpecialNeeds,
    petEstimatedCost: estimatedCost,
    adopterBudgetTier: budgetTier,
    adopterAnnualVax: annualVax,
    adopterSafeEnv: safeEnv
  };

  // Issue 2: Hard block — if pet has a cost and adopter has no budget, score 0
  if (estimatedCost > 0 && !budgetTier) {
    return scoreFactor({
      label: "Budget & Commitment",
      score: 0,
      maxScore: 10,
      explanation: `${pet.name} has an estimated monthly cost of Rs ${estimatedCost}. You haven't specified your monthly pet budget. Please complete your financial profile.`,
      isFallback: false,
      flag: `Budget information is required for pets with a known monthly cost. Please update your Lifestyle & Preferences profile.`,
      missingField: "lifestyle.monthlyPetBudget",
      inputs,
      ruleApplied: "Hard Blocker: Cost Without Budget",
      calculation: "Score = 0 automatically applied"
    });
  }

  let budgetScore = 6;
  let budgetFlag = null;

  let ratio = null;
  if (budgetTier && estimatedCost > 0) {
    // Issue 1: Use NPR-aligned getBudgetMax map
    const adopterBudgetMax = getBudgetMax(budgetTier);
    if (adopterBudgetMax !== null) {
      ratio = estimatedCost / adopterBudgetMax;
      if (ratio <= 1)        { budgetScore = 6; }
      else if (ratio <= 1.3) { budgetScore = 4; }
      else if (ratio <= 1.6) {
        budgetScore = 2;
        budgetFlag = `${pet.name}'s estimated cost (Rs ${estimatedCost}/mo) is moderately over your budget tier (${budgetTier}). Consider if this is sustainable long-term.`;
      } else {
        budgetScore = 0;
        budgetFlag = `${pet.name}'s estimated cost (Rs ${estimatedCost}/mo) significantly exceeds your budget tier (${budgetTier}). This is a high-severity financial mismatch.`;
      }
    }
  } else if (!budgetTier) {
    // Free pet (estimatedCost === 0) with no budget — neutral pass
    budgetScore = 4;
  }

  // Commitment signals: +2 each, cap at 10
  const vaxScore = annualVax === true ? 2 : annualVax === false ? 0 : 1;
  const safeScore = safeEnv === true ? 2 : safeEnv === false ? 0 : 1;
  const totalScore = Math.min(10, budgetScore + vaxScore + safeScore);

  const budgetLabel = {
    "under-5000":  "under Rs 5,000",
    "5000-10000":  "Rs 5,000–10,000",
    "10000-20000": "Rs 10,000–20,000",
    "over-20000":  "over Rs 20,000",
    // Legacy labels
    "under-100": "under Rs 5,000 (legacy tier)",
    "100-300":   "Rs 5,000–10,000 (legacy tier)",
    "over-300":  "Rs 10,000+ (legacy tier)",
  }[budgetTier] ?? "not specified";

  let explanation = `${pet.name} is ${isSpecialNeeds ? "special-needs" : "generally healthy"}.`;
  if (estimatedCost > 0) explanation += ` Estimated monthly cost: Rs ${estimatedCost}.`;
  explanation += ` Your indicated monthly pet budget is ${budgetLabel}.`;
  if (isSpecialNeeds) explanation += ` Special-needs pets typically require a higher monthly investment.`;
  if (annualVax === true) explanation += ` Your commitment to annual vaccinations is noted.`;
  if (safeEnv === true) explanation += ` Your commitment to a safe home environment is noted.`;

  return scoreFactor({ 
    label: "Budget & Commitment", 
    score: totalScore, 
    maxScore: 10, 
    explanation, 
    isFallback: !budgetTier, 
    flag: budgetFlag,
    inputs: { ...inputs, costToBudgetRatio: ratio, budgetScore, vaxScore, safeScore },
    ruleApplied: "Cost/Budget Ratio Extractor + Commitment Modifiers",
    calculation: `Budget(${budgetScore}) + Vax(${vaxScore}) + Safe(${safeScore}) (capped at 10) = ${totalScore}`
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTOR 8 — Life Stability (10 pts)
// Pet: none (adopter-side only — flags stability for shelter review)
// Adopter: lifestyle.upcomingLifeChanges + household.housingTenure / rentOwn
// ─────────────────────────────────────────────────────────────────────────────
// Bug 4 fix: graduated life stability penalties by change type
function scoreLifeStability(profile, pet) {
  const upcomingChanges = profile.lifestyle?.upcomingLifeChanges ?? [];
  // V2.1 Issue 3: Use new unified housing.type, fall back to legacy fields
  const housingType = profile.household?.housing?.type ?? profile.household?.rentOwn;
  const landlordPermission = profile.household?.housing?.landlordPermission ?? profile.household?.landlordPermission;
  const housingTenure = profile.household?.housingTenure; // kept for legacy records
  const isMoving = upcomingChanges.includes("moving-home");

  const inputs = {
    adopterUpcomingChanges: upcomingChanges,
    adopterHousingType: housingType,
    adopterLandlordPermission: landlordPermission,
    adopterHousingTenure: housingTenure,
    adopterIsMoving: isMoving
  };

  let tenureScore;
  let tenureFlag = null;
  let tenureRule = "Unknown Housing Status Fallback";

  // V2.1: Derive tenure score from new housing fields first
  if (housingType === "own") {
    tenureScore = 5;
    tenureRule = "Homeowner Base Score";
  } else if (housingType === "rent") {
    if (landlordPermission === true) {
      tenureScore = isMoving ? 2 : 4;
      tenureRule = "Renter with Permission Base Score (Moving modifier applied)";
      if (isMoving) tenureFlag = `Your current landlord permission is confirmed, but you've indicated you're planning to move. You'll need to obtain permission at your new address.`;
    } else if (landlordPermission === false) {
      tenureScore = 1;
      tenureRule = "Renter without Permission Penalty Base Score";
      tenureFlag = `You are renting without confirmed landlord permission to keep a pet. Please obtain written permission before applying — unapproved pets can lead to lease violations.`;
    } else {
      tenureScore = 3; // unknown permission
      tenureRule = "Renter with Unknown Permission Base Score";
    }
  } else if (housingType === "live-with-family") {
    tenureScore = isMoving ? 2 : 4; // Treated as stable unless moving
    tenureRule = "Living with Family Base Score";
  } else if (housingTenure) {
    // Legacy fallback
    const tenureScoreMap = { owner: 5, "renter-with-permission": 4, "renter-no-confirmation": 2, "lives-with-family": 3 };
    tenureScore = tenureScoreMap[housingTenure] ?? 3;
    tenureRule = "Legacy Tenure Map Base Score";
    if (housingTenure === "renter-no-confirmation") tenureFlag = `You are renting without confirmed landlord permission. Please obtain written permission before applying.`;
  } else {
    tenureScore = 3;
    tenureRule = "Missing Housing Data Base Score";
  }

  // Bug 4 fix: graduated penalties by change type (was flat +2 for all)
  const hasNoChanges = upcomingChanges.length === 0 || (upcomingChanges.length === 1 && upcomingChanges[0] === "none");
  let changePenalty = 0;
  let changeFlag = null;

  if (!hasNoChanges) {
    if (upcomingChanges.includes("moving-home")) {
      changePenalty += 4; // highest risk — home instability directly threatens pet welfare
      changeFlag = `A planned move is the highest-risk life change for pet stability. The shelter will want to understand your future housing plan.`;
    }
    if (upcomingChanges.includes("expecting-baby")) {
      changePenalty += 3; // high risk
      if (!changeFlag) changeFlag = `A new baby is a significant life change that will impact pet care routines.`;
    }
    if (upcomingChanges.includes("job-change")) changePenalty += 2;  // medium risk
    if (upcomingChanges.includes("other")) changePenalty += 2;        // medium risk
    if (upcomingChanges.includes("extended-travel")) changePenalty += 2; // medium risk
    changePenalty = Math.min(changePenalty, 4); // cap at -4 pts
  }

  const changeScore = 5 - changePenalty;
  const totalScore = Math.max(1, tenureScore + changeScore);

  let changeNote = "";
  if (!hasNoChanges) {
    const changeList = upcomingChanges.filter(c => c !== "none").join(", ");
    changeNote = ` You have indicated upcoming life changes (${changeList}). These are not disqualifying, but the shelter will want to discuss how your plans include ${pet.name}.`;
  }

  const tenureNote = housingTenure === "renter-with-permission" && !isMoving
    ? ` You rent with landlord permission — this is noted positively.`
    : housingTenure === "owner" ? ` You own your home.`
    : "";

  const explanation = `Your life stability has been assessed based on your housing situation and upcoming plans.${tenureNote}${changeNote}`;
  const flag = changeFlag ?? tenureFlag;

  return scoreFactor({ 
    label: "Life Stability", 
    score: totalScore, 
    maxScore: 10, 
    explanation, 
    flag,
    inputs: { ...inputs, changePenalty, tenureScore, changeScore },
    ruleApplied: `Housing Tenure (${tenureRule}) + Lifecycle Event Risk Map`,
    calculation: `Tenure(${tenureScore}) + (5 - ChangeRisk(${changePenalty})) = ${totalScore} (min 1)`
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADVISORY FLAG SYSTEM — runs parallel to scoring, does not reduce totals
// ─────────────────────────────────────────────────────────────────────────────
function buildAdvisories(profile, pet, factors) {
  const advisories = [];

  // 1. Allergy + high shedding
  const hasAllergies = profile.lifestyle?.hasAllergies;
  const sheddingLevel = pet.behaviour?.sheddingLevel;
  if (hasAllergies && sheddingLevel === "high") {
    advisories.push({
      type: "health",
      message: `${pet.name} is a high-shedding pet and you have indicated allergies. We strongly recommend consulting a medical professional before proceeding with this application.`,
    });
  }

  // 2. Collect flags from individual factors (scored 0 factor flags)
  for (const f of factors) {
    if (f.flag) {
      advisories.push({ type: "flag", message: f.flag });
    }
  }

  return advisories;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA COMPLETENESS — percentage of key fields present on both sides
// ─────────────────────────────────────────────────────────────────────────────
function computeDataCompleteness(profile, pet) {
  const petFields = [
    pet.behaviour?.energyScore,
    pet.behaviour?.separationAnxiety,
    pet.behaviour?.attachmentStyle,
    pet.behaviour?.trainingDifficulty,
    pet.behaviour?.noiseLevel,
    pet.behaviour?.sheddingLevel,
    pet.environment?.idealEnvironment,
    pet.compatibility?.goodWithKids,
    pet.compatibility?.goodWithPets,
    pet.medical?.healthStatus,
  ].filter(v => v !== undefined && v !== null);

  const profileFields = [
    profile.lifestyle?.activityLevel,
    profile.lifestyle?.workStyle,
    profile.lifestyle?.experienceLevel,
    profile.lifestyle?.preferredEnergyLevel,
    profile.lifestyle?.monthlyPetBudget,
    profile.lifestyle?.livingSizeSqm,
    profile.household?.homeType,
    profile.household?.hasChildren,
    profile.household?.safeEnvironment,
    profile.household?.annualVaccinations,
  ].filter(v => v !== undefined && v !== null);

  const total = 10 + 10;
  const present = petFields.length + profileFields.length;
  return Math.round((present / total) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIDENCE LEVEL — high only when all 8 key profile fields are present
// ─────────────────────────────────────────────────────────────────────────────
export function deriveConfidenceLevel(profile) {
  if (!profile) return "low";
  const ls = profile.lifestyle ?? {};
  const hh = profile.household ?? {};

  const required = [
    ls.workStyle,
    ls.maxContinuousAloneTime,
    ls.monthlyPetBudget,
    // Support either descriptive livingSize OR numeric livingSizeSqm
    hh.livingSize || (hh.livingSizeSqm !== undefined && hh.livingSizeSqm !== null && hh.livingSizeSqm > 0) ? "valid" : "",
    hh.hasExistingPets !== undefined && hh.hasExistingPets !== null ? "valid" : "",
    ls.activityLevel,
    ls.experienceLevel,
  ];

  // Logic: 7 core mandatory fields + the 8th which is a valid living size
  const coresPresent = required.every(v => v !== null && v !== undefined && v !== "");
  
  // High confidence also requires that a profile snapshot effectively has data, 
  // but we don't block on upcomingLifeChanges since it represents a "No" by being empty.
  return coresPresent ? "high" : "low";
}

export const calculateCompatibility = (profile, pet) => {
  // Issue 16: Input validation
  validate(profile, pet);

  const safeProfile = profile ?? { household: {}, lifestyle: {}, personalInfo: {} };

  const factors = [
    scoreEnergyMatch(safeProfile, pet),
    scoreAloneTimeTolerance(safeProfile, pet),
    scoreSpaceEnvironment(safeProfile, pet),
    scoreChildrenCompat(safeProfile, pet),
    scoreExistingPetCompat(safeProfile, pet),
    scoreExperienceTraining(safeProfile, pet),
    scoreBudgetCommitment(safeProfile, pet),
    scoreLifeStability(safeProfile, pet),
  ];

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  const maxScore = factors.reduce((sum, f) => sum + f.maxScore, 0); // always 100

  // ── Dynamic denominator ───────────────────────────────────────────────────
  // Exclude factors that are locked because the SHELTER hasn't filled in pet data.
  // These factors score 0 but it isn't the adopter's fault — don't count them
  // against the adopter in the displayed percentage.
  const scoredMax = factors.reduce(
    (sum, f) => (f.isPetDataMissing ? sum : sum + f.maxScore),
    0
  );
  // Safe: if somehow everything is missing, fall back to maxScore to avoid Infinity
  const effectiveDenominator = scoredMax > 0 ? scoredMax : maxScore;
  const adjustedPercentage = Math.round((totalScore / effectiveDenominator) * 100);

  // Collect factors that couldn't be scored due to missing pet data
  const unscoredFactors = factors
    .filter(f => f.isPetDataMissing)
    .map(f => ({ label: f.label, reason: f.explanation }));

  // Grade and recommendation use adjustedPercentage so a great adopter
  // isn't penalised for shelter data gaps.
  const grade = getGrade(adjustedPercentage);
  const dataCompleteness = computeDataCompleteness(safeProfile, pet);
  const advisories = buildAdvisories(safeProfile, pet, factors);
  const confidenceLevel = deriveConfidenceLevel(safeProfile);

  const recommendation =
    adjustedPercentage >= 75
      ? `You look like a wonderful match for ${pet.name}! We encourage you to complete your application.`
      : adjustedPercentage >= 50
      ? `You could be a great fit for ${pet.name}. Review the factor breakdown and discuss any concerns with the shelter.`
      : `There are a few compatibility areas worth exploring carefully. The shelter will help you understand if ${pet.name} is the right fit — and the meet & greet is the ideal place to work through any concerns.`;

  // Issue 15: Add numeric confidence score to output
  const coreFields = [
    safeProfile.lifestyle?.activityLevel,
    safeProfile.lifestyle?.workStyle,
    safeProfile.lifestyle?.maxContinuousAloneTime,
    safeProfile.lifestyle?.monthlyPetBudget,
    safeProfile.lifestyle?.experienceLevel,
    safeProfile.household?.livingSize || safeProfile.household?.livingSizeSqm,
    safeProfile.household?.hasExistingPets !== undefined,
  ];
  const confidence = coreFields.filter(v => v !== null && v !== undefined && v !== "").length / coreFields.length;

  return {
    petId: pet._id?.toString() || pet.id,
    totalScore,
    maxScore,
    scoredMax,               // denominator actually used (excludes pet-data-missing factors)
    percentage: Math.round((totalScore / maxScore) * 100), // raw out of 100, kept for reference
    adjustedPercentage,      // the REAL score to display — out of scoredMax
    unscoredFactors,         // [{label, reason}] pending shelter data
    grade,
    recommendation,
    factors,
    advisories,
    dataCompleteness,
    confidenceLevel,
    confidence: Math.round(confidence * 100), // 0–100 numeric confidence
    completionTier: profile?.completionTier ?? "basic",
    isProfileComplete: profile?.completionStatus === "complete",
    disclaimer:
      "This score surfaces potential fit based on your profile. The shelter makes all final adoption decisions.",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONTROLLER
// GET /applications/compatibility/:petId
// ─────────────────────────────────────────────────────────────────────────────
export const getCompatibilityScore = async (req, res) => {
  try {
    const { petId } = req.params;
    const adopterId = req.user.userId;

    const [pet, profile] = await Promise.all([
      Pet.findById(petId),
      AdopterProfile.findOne({ adopter: adopterId }),
    ]);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const scoreData = calculateCompatibility(profile, pet);

    return res.json(scoreData);
  } catch (error) {
    console.error("Error computing compatibility score:", error);
    res.status(500).json({ message: "Failed to compute compatibility score", error: error.message });
  }
};
