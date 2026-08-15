export function outcomeProbability(
  market: { outcomes: string[]; probabilities: number[] },
  outcomeName: string,
): number | null {
  const outcomeIndex = market.outcomes.findIndex(
    (outcome) => outcome.toLowerCase() === outcomeName.toLowerCase(),
  );
  return outcomeIndex >= 0
    ? (market.probabilities[outcomeIndex] ?? null)
    : null;
}
