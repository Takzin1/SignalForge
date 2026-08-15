export const RELATIONSHIP_TYPES = [
  "prerequisite",
  "subset",
  "mutually_exclusive",
  "equivalent",
  "exhaustive_pair",
  "correlated_only",
  "independent",
  "unknown",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const RELATIONSHIP_DIRECTIONS = [
  "A_requires_B",
  "B_requires_A",
  "symmetric",
  "none",
] as const;

export type RelationshipDirection =
  (typeof RELATIONSHIP_DIRECTIONS)[number];

export type SemanticRelationship = {
  relationship: RelationshipType;
  direction: RelationshipDirection;
  same_resolution_scope: boolean;
  confidence: number;
  abstain: boolean;
  reason: string;
};

export type ConstraintStatus = "pass" | "warning" | "abstain";

export type ConstraintRule =
  | "requires"
  | "mutually_exclusive"
  | "equivalent"
  | "exhaustive_pair"
  | "none";

export type ProbabilityConstraintInput = {
  relationship: SemanticRelationship;
  probabilityA: number;
  probabilityB: number;
  marketALabel?: string;
  marketBLabel?: string;
};

export type ConstraintEngineOptions = {
  confidenceThreshold?: number;
  tolerance?: number;
};

export type ConstraintResult = {
  status: ConstraintStatus;
  rule: ConstraintRule;
  expectedConstraint: string;
  observedValues: {
    probabilityA: number;
    probabilityB: number;
    combinedProbability?: number;
  };
  gap: number | null;
  explanationData: {
    marketALabel: string;
    marketBLabel: string;
    confidence: number;
    tolerance: number;
    sameResolutionScope: boolean;
    abstainReason?: string;
  };
};
