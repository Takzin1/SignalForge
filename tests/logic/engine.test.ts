import { describe, expect, it } from "vitest";

import {
  evaluateProbabilityConstraint,
  type SemanticRelationship,
} from "../../src/lib/logic";

const baseRelationship: SemanticRelationship = {
  relationship: "prerequisite",
  direction: "A_requires_B",
  same_resolution_scope: true,
  confidence: 0.94,
  abstain: false,
  reason: "A can only resolve Yes if B also resolves Yes.",
};

function relationship(
  overrides: Partial<SemanticRelationship> = {},
): SemanticRelationship {
  return { ...baseRelationship, ...overrides };
}

describe("evaluateProbabilityConstraint", () => {
  it("warns when A exceeds its prerequisite bound beyond tolerance", () => {
    const result = evaluateProbabilityConstraint({
      relationship: relationship(),
      probabilityA: 0.62,
      probabilityB: 0.58,
    });

    expect(result.status).toBe("warning");
    expect(result.rule).toBe("requires");
    expect(result.expectedConstraint).toBe("P(A) ≤ P(B)");
    expect(result.gap).toBe(0.04);
  });

  it("passes a prerequisite difference inside tolerance", () => {
    const result = evaluateProbabilityConstraint({
      relationship: relationship(),
      probabilityA: 0.6,
      probabilityB: 0.58,
    });

    expect(result.status).toBe("pass");
    expect(result.gap).toBe(0.02);
  });

  it("applies a reverse prerequisite direction", () => {
    const result = evaluateProbabilityConstraint({
      relationship: relationship({ direction: "B_requires_A" }),
      probabilityA: 0.4,
      probabilityB: 0.8,
    });

    expect(result.status).toBe("warning");
    expect(result.expectedConstraint).toBe("P(B) ≤ P(A)");
    expect(result.gap).toBe(0.4);
  });

  it("warns when mutually exclusive probabilities exceed one", () => {
    const result = evaluateProbabilityConstraint({
      relationship: relationship({
        relationship: "mutually_exclusive",
        direction: "symmetric",
      }),
      probabilityA: 0.6,
      probabilityB: 0.45,
    });

    expect(result.status).toBe("warning");
    expect(result.observedValues.combinedProbability).toBe(1.05);
    expect(result.gap).toBe(0.05);
  });

  it("checks equivalent probabilities with tolerance", () => {
    const pass = evaluateProbabilityConstraint({
      relationship: relationship({
        relationship: "equivalent",
        direction: "symmetric",
      }),
      probabilityA: 0.5,
      probabilityB: 0.52,
    });
    const warning = evaluateProbabilityConstraint({
      relationship: relationship({
        relationship: "equivalent",
        direction: "symmetric",
      }),
      probabilityA: 0.5,
      probabilityB: 0.6,
    });

    expect(pass.status).toBe("pass");
    expect(warning.status).toBe("warning");
    expect(warning.gap).toBe(0.1);
  });

  it("checks whether an exhaustive pair sums to one", () => {
    const pass = evaluateProbabilityConstraint({
      relationship: relationship({
        relationship: "exhaustive_pair",
        direction: "symmetric",
      }),
      probabilityA: 0.4,
      probabilityB: 0.61,
    });
    const warning = evaluateProbabilityConstraint({
      relationship: relationship({
        relationship: "exhaustive_pair",
        direction: "symmetric",
      }),
      probabilityA: 0.65,
      probabilityB: 0.45,
    });

    expect(pass.status).toBe("pass");
    expect(warning.status).toBe("warning");
    expect(warning.gap).toBe(0.1);
  });

  it.each([
    {
      name: "classifier abstention",
      value: relationship({ abstain: true }),
      reason: "classifier abstained",
    },
    {
      name: "low confidence",
      value: relationship({ confidence: 0.7 }),
      reason: "below the configured threshold",
    },
    {
      name: "scope mismatch",
      value: relationship({ same_resolution_scope: false }),
      reason: "comparable resolution scope",
    },
    {
      name: "non-logical correlation",
      value: relationship({
        relationship: "correlated_only",
        direction: "none",
      }),
      reason: "does not imply a deterministic",
    },
  ])("abstains for $name", ({ value, reason }) => {
    const result = evaluateProbabilityConstraint({
      relationship: value,
      probabilityA: 0.5,
      probabilityB: 0.5,
    });

    expect(result.status).toBe("abstain");
    expect(result.rule).toBe("none");
    expect(result.gap).toBeNull();
    expect(result.explanationData.abstainReason).toContain(reason);
  });

  it("abstains for an invalid probability", () => {
    const result = evaluateProbabilityConstraint({
      relationship: relationship(),
      probabilityA: 1.2,
      probabilityB: 0.5,
    });

    expect(result.status).toBe("abstain");
    expect(result.explanationData.abstainReason).toContain("between 0 and 1");
  });

  it("honors configurable tolerance and confidence thresholds", () => {
    const result = evaluateProbabilityConstraint(
      {
        relationship: relationship({ confidence: 0.7 }),
        probabilityA: 0.62,
        probabilityB: 0.58,
      },
      { confidenceThreshold: 0.65, tolerance: 0.05 },
    );

    expect(result.status).toBe("pass");
    expect(result.explanationData.tolerance).toBe(0.05);
  });
});
