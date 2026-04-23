import assert from "node:assert/strict";
import test from "node:test";
import { generatePlan } from "../src/generate.js";

test("generatePlan creates summary tasks and open questions", () => {
  const plan = generatePlan("Improve onboarding flow\nLink notes to tasks");
  assert.equal(plan.summary, "Improve onboarding flow");
  assert.equal(plan.tasks.length, 2);
  assert.ok(plan.openQuestions.length >= 1);
});
