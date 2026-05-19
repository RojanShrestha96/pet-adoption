import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_EVAL_MODEL = "llama-3.1-8b-instant";
const GEMINI_MODEL = "gemini-2.5-flash";

// ─────────────────────────────────────────────────────────────────────────────
// PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

const SHELTER_SYSTEM_PROMPT = `You are a professional Compatibility Analyst for a pet adoption platform. You receive structured output from a deterministic scoring engine. Your job is to translate these data points into actionable insights for shelter staff.

Rules you must follow:
1. DATA ANCHORING: Every claim must include the specific score or reason from the input (e.g., "Factor X scored 3/15").
2. RISK-FIRST: Only mention factors that scored below 80 percent of their maximum. Prioritize High Severity flags.
3. PROFESSIONAL TONE: Be direct and clinical. Do not use fluff. Shelter staff are experienced professionals.
4. NO RECOMMENDATIONS: Never recommend approval or rejection. Only explain the data.
5. NO NAMES: Never reference the applicant by name or personal identifiers.
6. DURATION: Keeping explanations to 3-5 sentences.

Return only valid JSON in this exact shape:
{
  "explanation": "3 to 5 sentences grounded in specific factor scores.",
  "questions": ["Three tactical questions to test the adopter's mitigation plan for the lowest scoring factors."],
  "topConcern": "One sentence naming the biggest risk based on factor deductions or flags."
}`;

const ADOPTER_SYSTEM_PROMPT = `You are a helpful and honest Compatibility Guide. Your goal is to explain a compatibility score to an adopter in a way that is encouraging, realistic, and practical.

Rules:
1. TIERED TONE: 
   - Scores > 75: Focus on strengths and alignment.
   - Scores 50-75: Frame as 'Areas for Growth' or 'Commitment Opportunities'.
   - Scores < 50: Be direct about the concern without being discouraging.
2. HONESTY: Never imply the adoption will definitively succeed. Never invent compatibility.
3. ACTIONABLE ADVICE: The 'suggestion' must be one specific, realistic thing they can do to improve their fit for this pet.
4. GROUNDING: Use the 'reason' field from the engine to explain deductions in plain language.
5. LENGTH: 2-3 sentences for the summary.

Return only valid JSON in this exact shape:
{
  "summary": "2 to 3 sentences explaining the match, referencing strengths and alignment.",
  "suggestion": "One specific, focused actionable suggestion based on their lowest scoring factor."
}`;

const GROUNDING_VALIDATOR_PROMPT = `You are an AI Grounding Auditor. You are given a raw deterministic engine output and an AI-generated explanation.
Your job is to verify if the AI response is factually consistent with the raw data.

CHECKLIST:
1. Score Consistency: Does the AI report deductions that actually occurred in the engine?
2. No Hallucination: Does the AI mention traits or behaviors NOT present in the raw factors?
3. Rule Adherence: Did the AI follow the specific constraints (e.g., number of questions, sentence count)?

Return exactly this JSON format ONLY:
{ "isValid": true, "auditLog": "Brief confirmation" } 
or 
{ "isValid": false, "error": "Reason for failure" }`;

const EVALUATOR_PROMPT = `You are an AI Response Evaluator. You are given two AI-generated JSON responses to an adoption compatibility breakdown. 
Your job is to determine which response strictly adheres better to the rules of Explainable AI (XAI).

XAI CRITERIA:
1. Accuracy: Does the response accurately reflect the raw logic, calculations, and deductions?
2. Grounding: Does the response avoid hallucinating extra traits not present in the input?
3. Clarity: Which response clearly states WHY deductions occurred?

Return your choice in the following exact JSON format ONLY:
{ "winner": "modelA", "reason": "brief explanation" } or { "winner": "modelB", "reason": "brief explanation" }`;

// ─────────────────────────────────────────────────────────────────────────────
// DATA BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

function buildXaiPayload(compatibilityData) {
  // Strip out UI-specific fluff, exposing only the raw explanatory variables
  // to force the AI to use the new exact 'ruleApplied', 'deduction', 'reason' schema.
  return JSON.stringify({
    overallScore: compatibilityData.percentage,
    confidenceLevel: compatibilityData.confidenceLevel,
    factors: compatibilityData.factors.map(f => ({
      label: f.label,
      score: f.score,
      maxScore: f.maxScore,
      deduction: f.deduction,
      ruleApplied: f.ruleApplied,
      calculation: f.calculation,
      detailedReason: f.reason,
      flag: f.flag
    }))
  }, null, 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

function parseJsonResponse(content) {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

async function fetchFromGroq(systemMessage, userMessage) {
  try {
    const response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: "json_object" }
    });
    const parsed = parseJsonResponse(response.choices[0]?.message?.content ?? "{}");
    return parsed;
  } catch (error) {
    console.error("[Groq Fetch Error]", error.message);
    throw error;
  }
}

async function fetchFromGemini(systemMessage, userMessage) {
  try {
    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: userMessage,
      config: {
        systemInstruction: systemMessage,
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });
    const parsed = parseJsonResponse(response.text());
    return parsed;
  } catch (error) {
    console.error("[Gemini Fetch Error]", error.message);
    throw error;
  }
}

async function evaluateAndSelectWinner(resA, resB, rawDataContext, evaluatorSystemPrompt = EVALUATOR_PROMPT) {
  const userMessage = `Raw Engine Output:\n${rawDataContext}\n\nModel A Response:\n${JSON.stringify(resA, null, 2)}\n\nModel B Response:\n${JSON.stringify(resB, null, 2)}\n\nEvaluate which response is more grounded and accurate.`;
  
  try {
    const evalRes = await groqClient.chat.completions.create({
      model: GROQ_EVAL_MODEL,
      messages: [
        { role: "system", content: evaluatorSystemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    
    const parsed = parseJsonResponse(evalRes.choices[0]?.message?.content ?? "{}");
    if (parsed.winner === "modelA") {
      console.log(`[XAI Evaluator] Selected Model A. Reason: ${parsed.reason}`);
      return resA;
    } else {
      console.log(`[XAI Evaluator] Selected Model B. Reason: ${parsed.reason}`);
      return resB;
    }
  } catch (e) {
    console.error("[XAI Evaluator Error] Falling back to Model A.", e.message);
    return resA; // Fallback if evaluation fails
  }
}

async function validateGrounding(aiGeneratedResponse, rawDataContext) {
  const userMessage = `Raw Engine Output:\n${rawDataContext}\n\nAI Response to Audit:\n${JSON.stringify(aiGeneratedResponse, null, 2)}`;
  
  try {
    const validationRes = await groqClient.chat.completions.create({
      model: GROQ_EVAL_MODEL,
      messages: [
        { role: "system", content: GROUNDING_VALIDATOR_PROMPT },
        { role: "user", content: userMessage }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    
    const parsed = parseJsonResponse(validationRes.choices[0]?.message?.content ?? "{}");
    return parsed;
  } catch (e) {
    console.error("[XAI Grounding Validator Error]", e.message);
    return { isValid: true, auditLog: "Validation skipped due to API error." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARALLEL ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs Groq and Gemini in parallel. If both succeed, evaluates the best one.
 * If one fails, returns the successful one.
 */
async function executeDualModel(systemPrompt, userMessage, rawPayload) {
  console.log("[Orchestrator] Dispatching parallel insights request to Groq & Gemini...");
  
  const [groqResult, geminiResult] = await Promise.allSettled([
    fetchFromGroq(systemPrompt, userMessage),
    fetchFromGemini(systemPrompt, userMessage)
  ]);

  let winner;
  if (groqResult.status === "fulfilled" && geminiResult.status === "fulfilled") {
    winner = await evaluateAndSelectWinner(groqResult.value, geminiResult.value, rawPayload);
  } else if (groqResult.status === "fulfilled") {
    winner = groqResult.value;
  } else if (geminiResult.status === "fulfilled") {
    winner = geminiResult.value;
  } else {
    throw new Error(`Dual-model execution completely failed.`);
  }

  // Cross-check grounding
  console.log("[Orchestrator] Validating selected response for grounding...");
  const validation = await validateGrounding(winner, rawPayload);
  
  if (!validation.isValid) {
    console.warn(`[XAI Grounding ALERT] Validation failed: ${validation.error}`);
    // If Model A/B winner failed, and both existed, maybe check the other one?
    // For now, we log the alert and return winner, but this is where we could re-prompt.
  } else {
    console.log(`[XAI Grounding OK] ${validation.auditLog}`);
  }

  return winner;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export async function generateShelterInsights(compatibilityData, pet, profile) {
  const rawPayload = buildXaiPayload(compatibilityData);
  const userMessage = `Pet: ${pet.name}. Overall Score: ${compatibilityData.percentage}%. Factors: ${rawPayload}`;

  try {
    const result = await executeDualModel(SHELTER_SYSTEM_PROMPT, userMessage, rawPayload);
    
    return {
      explanation: result.explanation || "Analysis unavailable.",
      questions: Array.isArray(result.questions) ? result.questions.slice(0, 3) : [],
      topConcern: result.topConcern || "Review factors manually."
    };
  } catch (error) {
    // Fallback stays deterministic
    const lowestFactors = [...compatibilityData.factors].sort((a,b) => a.percentage - b.percentage).slice(0, 3);
    return {
      explanation: `Engine calculates a score of ${compatibilityData.percentage}%. Major deductions in ${lowestFactors.map(f => f.label).join(', ')}.`,
      questions: lowestFactors.map(f => `Can you discuss ${f.label.toLowerCase()}?`),
      topConcern: lowestFactors[0]?.label || "General fit concerns."
    };
  }
}

export async function generateAdopterInsights(compatibilityData, pet, profile) {
  const rawPayload = buildXaiPayload(compatibilityData);
  const userMessage = `Pet: ${pet.name}. Overall Score: ${compatibilityData.percentage}%. Factors: ${rawPayload}`;

  try {
    const result = await executeDualModel(ADOPTER_SYSTEM_PROMPT, userMessage, rawPayload);
    
    return {
      summary: result.summary || "Analysis unavailable.",
      suggestion: result.suggestion || "Discuss this application with the shelter."
    };
  } catch (error) {
    const lowFactors = [...compatibilityData.factors].sort((a,b) => a.percentage - b.percentage).slice(0, 2);
    return {
      summary: `Deterministic Score: ${compatibilityData.percentage}%. Areas to review: ${lowFactors.map(f => f.label).join(' and ')}.`,
      suggestion: `Prepare to discuss ${lowFactors[0]?.label} at your meet and greet.`
    };
  }
}
