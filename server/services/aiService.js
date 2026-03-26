import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPTS (exact text from spec)
// ─────────────────────────────────────────────────────────────────────────────

const SHELTER_SYSTEM_PROMPT = `You are a compatibility analyst for a pet adoption platform. You receive structured output from a deterministic scoring engine. Explain the results in plain language and suggest questions for the shelter to ask at the meet and greet.

Rules you must follow:
Never invent data not in the input. Never recommend approval or rejection. Never reference the applicant by name or any personal identifier. Ground every statement in a specific factor score or risk flag. Only mention factors that are below 80 percent of their maximum. Keep explanation to 3 to 5 sentences. Suggest exactly 3 meet-and-greet questions targeting the specific risk flags present. Be direct — shelter staff are experienced professionals.

Return only valid JSON in this exact shape:
{
  "explanation": "3 to 5 sentences",
  "questions": ["question 1", "question 2", "question 3"],
  "topConcern": "one sentence naming the biggest risk"
}`;

const ADOPTER_SYSTEM_PROMPT = `You are a helpful guide on a pet adoption platform. Explain a compatibility score to an adopter in an encouraging, honest, and practical way.

Rules: Never invent data. Never say the adoption will or will not succeed. For scores above 75 focus on strengths. For scores below 50 be honest and name the concern clearly without being discouraging. Summary must be 2 to 3 sentences. Suggestion must be one specific actionable thing. Be warm but never dishonest.

Return only valid JSON in this exact shape:
{
  "summary": "2 to 3 sentences for the adopter",
  "suggestion": "one specific actionable thing they can do"
}`;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the shelter user message with anonymised data.
 * NO PII: no name, email, phone, address, idNumber, idDocuments.
 */
function buildShelterUserMessage(compatibilityData, pet, profile) {
  const { totalScore, percentage, confidenceLevel, factors = [], advisories = [] } = compatibilityData;

  const factorLines = factors.map(f =>
    `  - ${f.label}: ${f.score}/${f.maxScore} (${f.percentage}%)${f.isFallback ? " [estimated]" : ""}${f.flag ? ` ⚠ ${f.flag}` : ""}`
  ).join("\n");

  const flagLines = advisories.filter(a => a.type === "flag").map(a =>
    `  - ${a.message}`
  ).join("\n") || "  None";

  const household = profile?.household ?? {};
  const lifestyle = profile?.lifestyle ?? {};

  return `COMPATIBILITY ENGINE OUTPUT:
Overall score: ${percentage}/100 (${totalScore} raw points)
Confidence level: ${confidenceLevel ?? "low"}

Factor scores (out of maximum):
${factorLines}

Risk flags:
${flagLines}

PET PROFILE (for context only):
Species: ${pet.species ?? "unknown"}
Energy level: ${pet.energyLevel ?? pet.behaviour?.energyScore ?? "not assessed"}
Independence tolerance: ${pet.independenceTolerance != null ? `${pet.independenceTolerance} hours` : "not set"}
Space needs: ${pet.spaceNeeds ?? pet.environment?.idealEnvironment ?? "not set"}
Training difficulty: ${pet.behaviour?.trainingDifficulty ?? "not assessed"}
Estimated monthly cost: ${pet.estimatedMonthlyCost ? `NPR ${pet.estimatedMonthlyCost}` : "not specified"}

ADOPTER LIFESTYLE (anonymised):
Home type: ${household.homeType ?? "not stated"}
Ownership: ${household.ownershipStatus ?? household.rentOwn ?? "not stated"}
Living size: ${household.livingSize ?? "not stated"}
Work style: ${lifestyle.workStyle ?? "not stated"}
Max continuous alone time: ${lifestyle.maxContinuousAloneTime != null ? `${lifestyle.maxContinuousAloneTime} hours` : "not stated"}
Activity level: ${lifestyle.activityLevel ?? "not stated"}
Experience level: ${lifestyle.experienceLevel ?? "not stated"}
Has children: ${household.hasChildren != null ? String(household.hasChildren) : "not stated"}
Has existing pets: ${household.hasExistingPets != null ? String(household.hasExistingPets) : "not stated"}
Monthly pet budget: ${lifestyle.monthlyPetBudget ?? "not stated"}
Upcoming life changes: ${Array.isArray(lifestyle.upcomingLifeChanges) ? lifestyle.upcomingLifeChanges.join(", ") || "none" : "not stated"}
Pet care support: ${Array.isArray(lifestyle.petCareSupport) ? lifestyle.petCareSupport.join(", ") || "none" : "not stated"}`;
}

/**
 * Build the adopter user message — minimal data, no PII.
 */
function buildAdopterUserMessage(compatibilityData, pet, profile) {
  const { percentage, confidenceLevel, factors = [], advisories = [] } = compatibilityData;

  // Top 3 risk flags
  const topFlags = advisories.filter(a => a.type === "flag").slice(0, 3);
  const flagLines = topFlags.length > 0
    ? topFlags.map(a => `  - ${a.message}`).join("\n")
    : "  None";

  // Lowest 3 scoring factors
  const sortedFactors = [...factors].sort((a, b) => a.percentage - b.percentage).slice(0, 3);
  const lowFactorLines = sortedFactors.map(f =>
    `  - ${f.label}: ${f.percentage}%`
  ).join("\n");

  const lifestyle = profile?.lifestyle ?? {};

  return `Compatibility score: ${percentage}/100
Confidence level: ${confidenceLevel ?? "low"}

Top risk areas:
${flagLines}

Lowest scoring factors:
${lowFactorLines}

Pet energy level: ${pet.energyLevel ?? "not assessed"}
Adopter activity level: ${lifestyle.activityLevel ?? "not stated"}
Adopter work style: ${lifestyle.workStyle ?? "not stated"}
Max continuous alone time: ${lifestyle.maxContinuousAloneTime != null ? `${lifestyle.maxContinuousAloneTime} hours` : "not stated"}`;
}

/**
 * Parse JSON from OpenAI response content. Handles markdown code blocks.
 */
function parseJsonResponse(content) {
  // Strip markdown code blocks if present
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate shelter-facing AI insights from engine output.
 * @returns {{ explanation: string, questions: string[], topConcern: string }}
 */
export async function generateShelterInsights(compatibilityData, pet, profile) {
  const userMessage = buildShelterUserMessage(compatibilityData, pet, profile);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SHELTER_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.4,
    max_tokens: 600,
  });

  const content = response.choices[0]?.message?.content ?? "";
  const parsed = parseJsonResponse(content);

  // Validate shape
  if (!parsed.explanation || !Array.isArray(parsed.questions) || !parsed.topConcern) {
    throw new Error("AI response missing required fields for shelter insights");
  }

  return {
    explanation: String(parsed.explanation),
    questions: parsed.questions.slice(0, 3).map(String),
    topConcern: String(parsed.topConcern),
  };
}

/**
 * Generate adopter-facing AI insights from engine output.
 * @returns {{ summary: string, suggestion: string }}
 */
export async function generateAdopterInsights(compatibilityData, pet, profile) {
  const userMessage = buildAdopterUserMessage(compatibilityData, pet, profile);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: ADOPTER_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.5,
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content ?? "";
  const parsed = parseJsonResponse(content);

  if (!parsed.summary || !parsed.suggestion) {
    throw new Error("AI response missing required fields for adopter insights");
  }

  return {
    summary: String(parsed.summary),
    suggestion: String(parsed.suggestion),
  };
}
