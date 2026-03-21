import Pet from "../models/Pet.js";
import AdopterProfile from "../models/AdopterProfile.js";

/**
 * Rule-based compatibility scoring engine.
 * Inputs: adopter's AdopterProfile + Pet data
 * Output: { totalScore, maxScore, grade, recommendation, factors[] }
 *
 * All logic is deterministic and explainable — no AI involved.
 */

const GRADE_THRESHOLDS = {
  great: 75,
  good: 50,
  concerns: 0,
};

function getGrade(score) {
  if (score >= GRADE_THRESHOLDS.great)
    return { label: "Great Match", emoji: "✅", color: "success" };
  if (score >= GRADE_THRESHOLDS.good)
    return { label: "Good Match", emoji: "⚠️", color: "warning" };
  return { label: "Some Concerns", emoji: "🔶", color: "error" };
}

function scoreFactor({ label, score, maxScore, explanation }) {
  return { label, score, maxScore, percentage: Math.round((score / maxScore) * 100), explanation };
}

/**
 * Factor 1 — Home Type / Space Match (20 pts)
 */
function scoreHomeType(profile, pet) {
  const homeType = profile.household?.homeType;
  const apartmentFriendly = pet.compatibility?.apartmentFriendly;
  const hasFencedYard = profile.household?.hasFencedYard;

  if (!homeType) {
    return scoreFactor({
      label: "Home Type Match",
      score: 10,
      maxScore: 20,
      explanation: "Home type not provided — scored conservatively.",
    });
  }

  const inApartment = homeType === "apartment";

  if (inApartment && !apartmentFriendly) {
    return scoreFactor({
      label: "Home Type Match",
      score: 0,
      maxScore: 20,
      explanation: `${pet.name} prefers a home with more space. An apartment may not be the best fit.`,
    });
  }

  if (!inApartment && hasFencedYard) {
    return scoreFactor({
      label: "Home Type Match",
      score: 20,
      maxScore: 20,
      explanation: `Your ${homeType} with a fenced yard is a great environment for ${pet.name}.`,
    });
  }

  if (!inApartment) {
    return scoreFactor({
      label: "Home Type Match",
      score: 16,
      maxScore: 20,
      explanation: `Your ${homeType} provides good space. A fenced yard would be a bonus.`,
    });
  }

  return scoreFactor({
    label: "Home Type Match",
    score: 14,
    maxScore: 20,
    explanation: `${pet.name} is apartment-friendly—your living space works well.`,
  });
}

/**
 * Factor 2 — Children Compatibility (20 pts)
 */
function scoreChildrenCompatibility(profile, pet) {
  const hasChildren = profile.household?.hasChildren;
  const goodWithKids = pet.compatibility?.goodWithKids;

  if (hasChildren === undefined) {
    return scoreFactor({
      label: "Children Compatibility",
      score: 10,
      maxScore: 20,
      explanation: "Household details not provided — scored conservatively.",
    });
  }

  if (hasChildren && !goodWithKids) {
    return scoreFactor({
      label: "Children Compatibility",
      score: 4,
      maxScore: 20,
      explanation: `${pet.name} may need extra supervision around children. The shelter will assess this during the meet & greet.`,
    });
  }

  if (hasChildren && goodWithKids) {
    return scoreFactor({
      label: "Children Compatibility",
      score: 20,
      maxScore: 20,
      explanation: `${pet.name} is great with kids — a wonderful match for your family!`,
    });
  }

  if (!hasChildren) {
    return scoreFactor({
      label: "Children Compatibility",
      score: 20,
      maxScore: 20,
      explanation: `No children in the home — no compatibility concerns here.`,
    });
  }

  return scoreFactor({ label: "Children Compatibility", score: 10, maxScore: 20, explanation: "Assessed conservatively." });
}

/**
 * Factor 3 — Existing Pets Compatibility (15 pts)
 */
function scoreExistingPets(profile, pet) {
  const existingPetsText = profile.household?.existingPets;
  const goodWithPets = pet.compatibility?.goodWithPets;

  const hasPets = existingPetsText && existingPetsText.trim().length > 2;

  if (!hasPets) {
    return scoreFactor({
      label: "Existing Pet Compatibility",
      score: 15,
      maxScore: 15,
      explanation: "No existing pets — no inter-pet compatibility concerns.",
    });
  }

  if (goodWithPets) {
    return scoreFactor({
      label: "Existing Pet Compatibility",
      score: 15,
      maxScore: 15,
      explanation: `${pet.name} gets along well with other animals.`,
    });
  }

  return scoreFactor({
    label: "Existing Pet Compatibility",
    score: 3,
    maxScore: 15,
    explanation: `${pet.name} may need careful introduction to existing pets. Discuss with the shelter.`,
  });
}

/**
 * Factor 4 — Adopter Experience Level (20 pts)
 */
function scoreExperience(profile, pet) {
  const experienceLevel = profile.lifestyle?.experienceLevel;
  const isSpecialNeeds = pet.medical?.healthStatus === "special-needs" || pet.medical?.healthStatus === "treatment";
  const isLarge = pet.size === "large" || pet.size === "extra-large";

  if (!experienceLevel) {
    return scoreFactor({
      label: "Experience Level",
      score: 10,
      maxScore: 20,
      explanation: "Experience level not provided — scored conservatively.",
    });
  }

  if (experienceLevel === "experienced") {
    return scoreFactor({
      label: "Experience Level",
      score: 20,
      maxScore: 20,
      explanation: "Your experience with pets is excellent — you're prepared for any personality.",
    });
  }

  if (isSpecialNeeds && experienceLevel === "none") {
    return scoreFactor({
      label: "Experience Level",
      score: 5,
      maxScore: 20,
      explanation: `${pet.name} has special needs that benefit from experienced caretakers. That said, many first-time owners do great with guidance from the shelter.`,
    });
  }

  if (isLarge && experienceLevel === "none") {
    return scoreFactor({
      label: "Experience Level",
      score: 10,
      maxScore: 20,
      explanation: `Large pets may need firmer handling. With some training, first-timers can do wonderfully.`,
    });
  }

  if (experienceLevel === "some") {
    return scoreFactor({
      label: "Experience Level",
      score: 16,
      maxScore: 20,
      explanation: "Your prior experience with pets is a great foundation.",
    });
  }

  return scoreFactor({
    label: "Experience Level",
    score: 13,
    maxScore: 20,
    explanation: "First-time adopters are welcome — we'll support you through the process.",
  });
}

/**
 * Factor 5 — Activity / Lifestyle Match (15 pts)
 */
function scoreLifestyle(profile, pet) {
  const activityLevel = profile.lifestyle?.activityLevel;
  const hoursAway = profile.lifestyle?.hoursAwayPerDay;
  const isHighEnergy = pet.species === "dog" && (pet.size === "large" || pet.size === "medium");

  if (!activityLevel) {
    return scoreFactor({
      label: "Lifestyle Match",
      score: 8,
      maxScore: 15,
      explanation: "Lifestyle details not provided — scored conservatively.",
    });
  }

  let score = 0;
  let explanation = "";

  if (isHighEnergy) {
    if (activityLevel === "high") {
      score = 15;
      explanation = `Your active lifestyle is a perfect match for ${pet.name}'s energy level.`;
    } else if (activityLevel === "moderate") {
      score = 10;
      explanation = `${pet.name} is energetic — regular walks and play sessions would keep them happy.`;
    } else {
      score = 5;
      explanation = `${pet.name} has high energy needs. A more active routine would benefit them greatly.`;
    }
  } else {
    // Low energy / cats / small pets — any activity level works
    score = activityLevel === "low" ? 15 : 13;
    explanation = `${pet.name} adapts well to your lifestyle.`;
  }

  // Penalise if away a lot (>10hrs)
  if (hoursAway !== undefined && hoursAway > 10 && pet.species === "dog") {
    score = Math.max(0, score - 4);
    explanation += ` Note: being away ${hoursAway}h/day may be long for a dog — consider a dog walker.`;
  }

  return scoreFactor({ label: "Lifestyle Match", score, maxScore: 15, explanation });
}

/**
 * Factor 6 — Commitment Signals (10 pts)
 */
function scoreCommitment(profile, pet) {
  let score = 0;
  const h = profile.household;

  if (h?.medicalAffordability) score += 4;
  if (h?.annualVaccinations) score += 3;
  if (h?.safeEnvironment) score += 3;

  const explanation =
    score === 10
      ? "You've committed to medical care, vaccinations, and a safe environment — excellent!"
      : score >= 6
      ? "Good commitment signals. Ensuring all three will make you an even stronger applicant."
      : "Consider confirming your commitment to medical care and a safe environment.";

  return scoreFactor({ label: "Commitment & Responsibility", score, maxScore: 10, explanation });
}

// ─────────────────────────────────────────────────────────────
/**
 * GET /applications/compatibility/:petId
 * Returns a rule-based compatibility score between the adopter and the pet.
 */
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

    // If no profile yet, return a placeholder with the logic explained
    const safeProfile = profile || { household: {}, lifestyle: {}, personalInfo: {} };

    const factors = [
      scoreHomeType(safeProfile, pet),
      scoreChildrenCompatibility(safeProfile, pet),
      scoreExistingPets(safeProfile, pet),
      scoreExperience(safeProfile, pet),
      scoreLifestyle(safeProfile, pet),
      scoreCommitment(safeProfile, pet),
    ];

    const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
    const maxScore = factors.reduce((sum, f) => sum + f.maxScore, 0); // 100

    const grade = getGrade(totalScore);

    const recommendation =
      totalScore >= 75
        ? `You look like a wonderful match for ${pet.name}! We encourage you to complete your application.`
        : totalScore >= 50
        ? `You could be a great fit for ${pet.name}. Review the concerns below and discuss them with the shelter.`
        : `There are a few compatibility questions worth exploring. The shelter will help you understand if ${pet.name} is the right fit.`;

    return res.json({
      petId,
      totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100),
      grade,
      recommendation,
      factors,
      isProfileComplete: profile?.completionStatus === "complete",
      disclaimer:
        "This score surfaces potential fit based on your profile. The shelter makes all final adoption decisions.",
    });
  } catch (error) {
    console.error("Error computing compatibility score:", error);
    res.status(500).json({ message: "Failed to compute compatibility score", error: error.message });
  }
};
