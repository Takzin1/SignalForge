export type Market = {
  id: string;
  eventId: string;
  question: string;
  description: string;
  resolutionSource: string;
  startDate: string | null;
  endDate: string | null;
  outcomes: string[];
  probabilities: number[];
  liquidity: number | null;
  volume: number | null;
  slug: string;
  active: boolean;
  closed: boolean;
};

export type PredictionEvent = {
  id: string;
  title: string;
  description: string;
  resolutionSource: string;
  startDate: string | null;
  endDate: string | null;
  liquidity: number | null;
  volume: number | null;
  slug: string;
  negRisk: boolean;
  markets: Market[];
};

export type EventsPage = {
  events: PredictionEvent[];
  nextCursor: string | null;
};
