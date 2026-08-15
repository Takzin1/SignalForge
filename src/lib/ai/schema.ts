import { z } from "zod";

import {
  RELATIONSHIP_DIRECTIONS,
  RELATIONSHIP_TYPES,
  type SemanticRelationship,
} from "../logic";

export const relationshipClassificationSchema = z
  .object({
    relationship: z.enum(RELATIONSHIP_TYPES),
    direction: z.enum(RELATIONSHIP_DIRECTIONS),
    same_resolution_scope: z.boolean(),
    confidence: z.number().min(0).max(1),
    abstain: z.boolean(),
    reason: z.string().trim().min(1).max(800),
  })
  .strict();

function extractJsonObject(content: string): string {
  const trimmed = content.trim();
  const withoutFence = trimmed
    .replace(/^\`\`\`(?:json)?\s*/i, "")
    .replace(/\s*\`\`\`$/i, "");
  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");

  if (firstBrace < 0 || lastBrace <= firstBrace) {
    throw new Error("The model response did not contain a JSON object.");
  }

  return withoutFence.slice(firstBrace, lastBrace + 1);
}

export function parseRelationshipClassification(
  content: string,
): SemanticRelationship {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(extractJsonObject(content));
  } catch (error) {
    throw new Error("The model returned invalid JSON.", { cause: error });
  }

  const parsed = relationshipClassificationSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error("The model response failed relationship schema validation.", {
      cause: parsed.error,
    });
  }

  return parsed.data;
}

export function enforceSemanticAbstention(
  classification: SemanticRelationship,
  confidenceThreshold: number,
): SemanticRelationship {
  const hasNoDeterministicRule = [
    "correlated_only",
    "independent",
    "unknown",
  ].includes(classification.relationship);
  const mustAbstain =
    classification.abstain ||
    classification.confidence < confidenceThreshold ||
    !classification.same_resolution_scope ||
    hasNoDeterministicRule;

  return mustAbstain
    ? {
        ...classification,
        abstain: true,
      }
    : classification;
}
