import type {
  ConstraintEngineOptions,
  ConstraintResult,
  ProbabilityConstraintInput,
} from "./types";

const DEFAULT_CONFIDENCE_THRESHOLD = 0.75;
const DEFAULT_TOLERANCE = 0.03;

function clampSetting(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(value, 0), 1)
    : fallback;
}

function round(value: number): number {
  return Number(value.toFixed(6));
}

function probabilitiesAreValid(probabilityA: number, probabilityB: number) {
  return (
    Number.isFinite(probabilityA) &&
    Number.isFinite(probabilityB) &&
    probabilityA >= 0 &&
    probabilityA <= 1 &&
    probabilityB >= 0 &&
    probabilityB <= 1
  );
}

function abstain(
  input: ProbabilityConstraintInput,
  tolerance: number,
  reason: string,
): ConstraintResult {
  return {
    status: "abstain",
    rule: "none",
    expectedConstraint: "No deterministic constraint applied",
    observedValues: {
      probabilityA: input.probabilityA,
      probabilityB: input.probabilityB,
    },
    gap: null,
    explanationData: {
      marketALabel: input.marketALabel ?? "Market A",
      marketBLabel: input.marketBLabel ?? "Market B",
      confidence: input.relationship.confidence,
      tolerance,
      sameResolutionScope: input.relationship.same_resolution_scope,
      abstainReason: reason,
    },
  };
}

function baseExplanation(
  input: ProbabilityConstraintInput,
  tolerance: number,
) {
  return {
    marketALabel: input.marketALabel ?? "Market A",
    marketBLabel: input.marketBLabel ?? "Market B",
    confidence: input.relationship.confidence,
    tolerance,
    sameResolutionScope: input.relationship.same_resolution_scope,
  };
}

export function evaluateProbabilityConstraint(
  input: ProbabilityConstraintInput,
  options: ConstraintEngineOptions = {},
): ConstraintResult {
  const confidenceThreshold = clampSetting(
    options.confidenceThreshold,
    DEFAULT_CONFIDENCE_THRESHOLD,
  );
  const tolerance = clampSetting(options.tolerance, DEFAULT_TOLERANCE);
  const { relationship, probabilityA, probabilityB } = input;

  if (!probabilitiesAreValid(probabilityA, probabilityB)) {
    return abstain(input, tolerance, "Probability values must be between 0 and 1.");
  }

  if (relationship.abstain) {
    return abstain(input, tolerance, "The semantic classifier abstained.");
  }

  if (relationship.confidence < confidenceThreshold) {
    return abstain(
      input,
      tolerance,
      "Relationship confidence is below the configured threshold.",
    );
  }

  if (!relationship.same_resolution_scope) {
    return abstain(
      input,
      tolerance,
      "The markets do not share a sufficiently comparable resolution scope.",
    );
  }

  const explanationData = baseExplanation(input, tolerance);

  if (
    relationship.relationship === "prerequisite" ||
    relationship.relationship === "subset"
  ) {
    if (
      relationship.direction !== "A_requires_B" &&
      relationship.direction !== "B_requires_A"
    ) {
      return abstain(
        input,
        tolerance,
        "A directional relationship is required for this rule.",
      );
    }

    const aRequiresB = relationship.direction === "A_requires_B";
    const left = aRequiresB ? probabilityA : probabilityB;
    const right = aRequiresB ? probabilityB : probabilityA;
    const gap = round(left - right);

    return {
      status: gap <= tolerance ? "pass" : "warning",
      rule: "requires",
      expectedConstraint: aRequiresB ? "P(A) ≤ P(B)" : "P(B) ≤ P(A)",
      observedValues: { probabilityA, probabilityB },
      gap,
      explanationData,
    };
  }

  if (relationship.relationship === "mutually_exclusive") {
    const combinedProbability = round(probabilityA + probabilityB);
    const gap = round(combinedProbability - 1);

    return {
      status: gap <= tolerance ? "pass" : "warning",
      rule: "mutually_exclusive",
      expectedConstraint: "P(A) + P(B) ≤ 1",
      observedValues: {
        probabilityA,
        probabilityB,
        combinedProbability,
      },
      gap,
      explanationData,
    };
  }

  if (relationship.relationship === "equivalent") {
    const gap = round(Math.abs(probabilityA - probabilityB));

    return {
      status: gap <= tolerance ? "pass" : "warning",
      rule: "equivalent",
      expectedConstraint: "|P(A) − P(B)| ≤ tolerance",
      observedValues: { probabilityA, probabilityB },
      gap,
      explanationData,
    };
  }

  if (relationship.relationship === "exhaustive_pair") {
    const combinedProbability = round(probabilityA + probabilityB);
    const gap = round(Math.abs(combinedProbability - 1));

    return {
      status: gap <= tolerance ? "pass" : "warning",
      rule: "exhaustive_pair",
      expectedConstraint: "|P(A) + P(B) − 1| ≤ tolerance",
      observedValues: {
        probabilityA,
        probabilityB,
        combinedProbability,
      },
      gap,
      explanationData,
    };
  }

  return abstain(
    input,
    tolerance,
    "This relationship does not imply a deterministic probability constraint.",
  );
}
