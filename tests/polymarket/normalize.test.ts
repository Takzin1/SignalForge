import { describe, expect, it } from "vitest";

import {
  normalizeEvent,
  normalizeEventsPage,
  parseStringArray,
} from "../../src/lib/polymarket/normalize";

const rawMarket = {
  id: "market-1",
  question: "Will A happen?",
  description: "Resolution terms",
  resolutionSource: "Official source",
  startDate: "2026-01-01T00:00:00Z",
  endDate: "2026-12-31T00:00:00Z",
  outcomes: '["Yes", "No"]',
  outcomePrices: '["0.42", "0.58"]',
  liquidity: "1200.5",
  volume: "9800",
  slug: "will-a-happen",
  active: true,
  closed: false,
};

const rawEvent = {
  id: "event-1",
  title: "Event one",
  description: "Event context",
  resolutionSource: "",
  startDate: "2026-01-01T00:00:00Z",
  endDate: "2026-12-31T00:00:00Z",
  liquidity: 2500,
  volume: "12000",
  slug: "event-one",
  negRisk: false,
  markets: [rawMarket],
};

describe("Polymarket normalization", () => {
  it("parses arrays and stringified JSON arrays", () => {
    expect(parseStringArray('["Yes", "No"]')).toEqual(["Yes", "No"]);
    expect(parseStringArray([" A ", "B", 3])).toEqual(["A", "B"]);
    expect(parseStringArray("not-json")).toEqual([]);
  });

  it("normalizes numeric strings and outcome probabilities", () => {
    const event = normalizeEvent(rawEvent);

    expect(event?.volume).toBe(12000);
    expect(event?.markets[0].liquidity).toBe(1200.5);
    expect(event?.markets[0].outcomes).toEqual(["Yes", "No"]);
    expect(event?.markets[0].probabilities).toEqual([0.42, 0.58]);
  });

  it("drops malformed and closed child markets", () => {
    const event = normalizeEvent({
      ...rawEvent,
      markets: [
        rawMarket,
        { ...rawMarket, id: "closed", closed: true },
        { ...rawMarket, id: "bad", outcomePrices: "[0.5]" },
      ],
    });

    expect(event?.markets.map((market) => market.id)).toEqual(["market-1"]);
  });

  it("fails closed for malformed event payloads", () => {
    expect(normalizeEvent({ title: "Missing identity" })).toBeNull();
    expect(normalizeEventsPage({ wrong: [] })).toEqual({
      events: [],
      nextCursor: null,
    });
  });
});
