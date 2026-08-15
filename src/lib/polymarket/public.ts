import type { Market, PredictionEvent } from "./types";

export type DashboardMarket = Pick<
  Market,
  | "id"
  | "eventId"
  | "question"
  | "endDate"
  | "outcomes"
  | "probabilities"
  | "volume"
  | "slug"
>;

export type DashboardEvent = Pick<
  PredictionEvent,
  | "id"
  | "title"
  | "startDate"
  | "endDate"
  | "liquidity"
  | "volume"
  | "slug"
  | "negRisk"
> & {
  markets: DashboardMarket[];
};

export function toDashboardEvent(event: PredictionEvent): DashboardEvent {
  return {
    id: event.id,
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    liquidity: event.liquidity,
    volume: event.volume,
    slug: event.slug,
    negRisk: event.negRisk,
    markets: event.markets.map((market) => ({
      id: market.id,
      eventId: market.eventId,
      question: market.question,
      endDate: market.endDate,
      outcomes: market.outcomes,
      probabilities: market.probabilities,
      volume: market.volume,
      slug: market.slug,
    })),
  };
}
