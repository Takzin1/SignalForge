import type { Market } from "./types";

export function outcomeProbability(
  market: Market,
  outcomeName: string,
): number | null {
  const outcomeIndex = market.outcomes.findIndex(
    (outcome) => outcome.toLowerCase() === outcomeName.toLowerCase(),
  );
  return outcomeIndex >= 0
    ? (market.probabilities[outcomeIndex] ?? null)
    : null;
}
