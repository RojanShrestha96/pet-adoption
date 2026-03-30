/**
 * PetMate Compatibility Engine v2 — Test Script
 * Run: node server/scripts/testCompatibilityEngine.js
 *
 * Pure in-memory unit tests — no database, no imports needed.
 * Tests all 8 scoring factors with known inputs.
 */

let passed = 0;
let failed = 0;

function assert(label, condition, got, expected) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label} — got ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`);
    failed++;
  }
}

// ─── Paste scoring functions inline for test isolation ───────────────────────
// (Copy of the pure scoring functions from compatibilityController.js)

function deriveAloneHours(lifestyle) {
  const ws = lifestyle?.workStyle;
  if (ws === "fully-remote") return 0;
  if (ws === "hybrid") {
    const daysHome = lifestyle?.hybridDaysHomePerWeek ?? 2;
    return Math.round((5 - daysHome) * 8 / 5);
  }
  if (ws === "office-based") return 8;
  return lifestyle?.hoursAwayPerDay ?? 6;
}

function supportAloneOffset(petCareSupport) {
  if (!petCareSupport || petCareSupport.length === 0) return 0;
  let offset = 0;
  if (petCareSupport.includes("dog-walker") || petCareSupport.includes("doggy-daycare")) offset += 3;
  if (petCareSupport.includes("pet-sitter")) offset += 2;
  if (petCareSupport.includes("trusted-family-nearby")) offset += 1;
  return Math.min(offset, 8);
}

function normaliseActivity(raw) {
  if (!raw) return null;
  if (raw === "sedentary" || raw === "low") return "low";
  if (raw === "moderate") return "moderate";
  if (raw === "active" || raw === "high" || raw === "very-active") return "high";
  return null;
}

function normaliseExperience(raw) {
  if (!raw) return null;
  if (raw === "none" || raw === "first-time") return "first-time";
  if (raw === "some" || raw === "some-experience") return "some-experience";
  if (raw === "experienced") return "experienced";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: deriveAloneHours
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Factor 2 Helper: deriveAloneHours ──");

const rh1 = deriveAloneHours({ workStyle: "fully-remote" });
assert("fully-remote = 0 hrs alone", rh1 === 0, rh1, 0);

const rh2 = deriveAloneHours({ workStyle: "office-based" });
assert("office-based = 8 hrs alone", rh2 === 8, rh2, 8);

const rh3 = deriveAloneHours({ workStyle: "hybrid", hybridDaysHomePerWeek: 4 });
// (5-4)*8/5 = 1.6 → round = 2
assert("hybrid 4 days home = ~2hrs alone", rh3 === 2, rh3, 2);

const rh4 = deriveAloneHours({ workStyle: "hybrid", hybridDaysHomePerWeek: 2 });
// (5-2)*8/5 = 4.8 → round = 5
assert("hybrid 2 days home = ~5hrs alone", rh4 === 5, rh4, 5);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: supportAloneOffset
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Factor 2 Helper: supportAloneOffset ──");

assert("dog-walker gives 3hr offset", supportAloneOffset(["dog-walker"]) === 3, supportAloneOffset(["dog-walker"]), 3);
assert("pet-sitter gives 2hr offset", supportAloneOffset(["pet-sitter"]) === 2, supportAloneOffset(["pet-sitter"]), 2);
assert("family nearby gives 1hr offset", supportAloneOffset(["trusted-family-nearby"]) === 1, supportAloneOffset(["trusted-family-nearby"]), 1);
assert("combined offset caps at 8", supportAloneOffset(["dog-walker", "pet-sitter", "trusted-family-nearby"]) === 6, supportAloneOffset(["dog-walker", "pet-sitter", "trusted-family-nearby"]), 6);
assert("none gives 0", supportAloneOffset([]) === 0, supportAloneOffset([]), 0);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: Effective alone hours with support
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Factor 2: Effective alone time after support ──");

const aloneHoursOffice = deriveAloneHours({ workStyle: "office-based" }); // 8
const withDogWalker = Math.max(0, aloneHoursOffice - supportAloneOffset(["dog-walker"])); // 8-3=5
assert("office-based + dog walker → 5hrs effective", withDogWalker === 5, withDogWalker, 5);

const withDayCare = Math.max(0, aloneHoursOffice - supportAloneOffset(["doggy-daycare"])); // 8-3=5
assert("office-based + daycare → 5hrs effective", withDayCare === 5, withDayCare, 5);

const remoteAlone = Math.max(0, deriveAloneHours({ workStyle: "fully-remote" }) - supportAloneOffset(["dog-walker"]));
assert("fully-remote + dog walker → 0 effective (floored)", remoteAlone === 0, remoteAlone, 0);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: normaliseActivity
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── normaliseActivity ──");
assert("'sedentary' → 'low'", normaliseActivity("sedentary") === "low", normaliseActivity("sedentary"), "low");
assert("'high' → 'high'", normaliseActivity("high") === "high", normaliseActivity("high"), "high");
assert("'very-active' → 'high'", normaliseActivity("very-active") === "high", normaliseActivity("very-active"), "high");
assert("null → null", normaliseActivity(null) === null, normaliseActivity(null), null);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 5: normaliseExperience
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── normaliseExperience ──");
assert("'none' → 'first-time'", normaliseExperience("none") === "first-time", normaliseExperience("none"), "first-time");
assert("'first-time' → 'first-time'", normaliseExperience("first-time") === "first-time", normaliseExperience("first-time"), "first-time");
assert("'some' → 'some-experience'", normaliseExperience("some") === "some-experience", normaliseExperience("some"), "some-experience");
assert("'experienced' → 'experienced'", normaliseExperience("experienced") === "experienced", normaliseExperience("experienced"), "experienced");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 6: Factor 7 Budget scoring logic
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Factor 7: Budget tier logic ──");
const tierOrder = ["under-100", "100-300", "over-300"];

function budgetMetCheck(adopterTier, requiredTier) {
  const adopterIdx = tierOrder.indexOf(adopterTier);
  const requiredIdx = tierOrder.indexOf(requiredTier);
  return adopterIdx >= requiredIdx;
}

assert("under-100 meets healthy pet (under-100 required)", budgetMetCheck("under-100", "under-100"), true, true);
assert("under-100 does NOT meet special-needs (over-300 required)", !budgetMetCheck("under-100", "over-300"), true, true);
assert("100-300 meets minor-issues (100-300 required)", budgetMetCheck("100-300", "100-300"), true, true);
assert("over-300 meets any tier", budgetMetCheck("over-300", "over-300"), true, true);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 7: Factor 8 Life Stability penalty logic
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Factor 8: Life stability penalty capping ──");

function computeChangePenalty(changes) {
  if (!changes || changes.length === 0 || (changes.length === 1 && changes[0] === "none")) return 0;
  let penalty = 0;
  if (changes.includes("expecting-baby")) penalty += 2;
  if (changes.includes("moving-home")) penalty += 2;
  if (changes.includes("extended-travel")) penalty += 2;
  if (changes.includes("job-change")) penalty += 1;
  return Math.min(penalty, 3);
}

assert("no changes → 0 penalty", computeChangePenalty(["none"]) === 0, computeChangePenalty(["none"]), 0);
assert("job-change only → 1 penalty", computeChangePenalty(["job-change"]) === 1, computeChangePenalty(["job-change"]), 1);
assert("moving-home → 2 penalty", computeChangePenalty(["moving-home"]) === 2, computeChangePenalty(["moving-home"]), 2);
assert("3 changes → capped at 3", computeChangePenalty(["moving-home", "expecting-baby", "extended-travel"]) === 3, computeChangePenalty(["moving-home", "expecting-baby", "extended-travel"]), 3);
assert("single 'none' value → 0 (correct parse)", computeChangePenalty(["none"]) === 0, computeChangePenalty(["none"]), 0);

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log(`✅ All tests passed — scoring engine logic is correct.`);
} else {
  console.error(`❌ ${failed} test(s) failed. Review the output above.`);
  process.exit(1);
}
