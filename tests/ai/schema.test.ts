import { describe, expect, it } from "vitest";

import type { SemanticRelationship } from "../../src/lib/logic";
import {
  enforceSemanticAbstention,
  parseRelationshipClassification,
  relationshipClassificationSchema,
} from "../../src/lib/ai/schema";

const validClassification: SemanticRelationship = {
  relationship: "subset",
  direction: "A_requires_B",
  same_resolution_scope: true,
  confidence: 0.91,
  abstain: false,
  reason: "Every Yes outcome for A is also a Yes outcome for B.",
};

describe("relationship classification schema", () => {
  it("accepts the exact required shape", () => {
    expect(
      relationshipClassificationSchema.parse(validClassification),
    ).toEqual(validClassification);
  });

  it("rejects additional keys and out-of-range confidence", () => {
    expect(() =>
      relationshipClassificationSchema.parse({
        ...validClassification,
        confidence: 1.2,
        mathematical_verdict: "warning",
      }),
    ).toThrow();
  });

  it("parses plain and fenced JSON", () => {
    const json = JSON.stringify(validClassification);

    expect(parseRelationshipClassification(json)).toEqual(validClassification);
    expect(
      parseRelationshipClassification("~~~".replaceAll("~", "`") + "json\n" + json + "\n" + "~~~".replaceAll("~", "`")),
    ).toEqual(validClassification);
  });

  it("rejects malformed model output", () => {
    expect(() => parseRelationshipClassification("not json")).toThrow(
      "invalid JSON",
    );
    expect(() =>
      parseRelationshipClassification(
        JSON.stringify({ relationship: "equivalent" }),
      ),
    ).toThrow("schema validation");
  });
});

describe("semantic abstention guard", () => {
  it.each([
    {
      name: "low confidence",
      value: { ...validClassification, confidence: 0.6 },
    },
    {
      name: "different resolution scope",
      value: { ...validClassification, same_resolution_scope: false },
    },
    {
      name: "correlation without a hard rule",
      value: {
        ...validClassification,
        relationship: "correlated_only" as const,
        direction: "none" as const,
      },
    },
  ])("forces abstention for $name", ({ value }) => {
    expect(enforceSemanticAbstention(value, 0.75).abstain).toBe(true);
  });

  it("preserves a high-confidence scoped relationship", () => {
    expect(
      enforceSemanticAbstention(validClassification, 0.75).abstain,
    ).toBe(false);
  });
});
