import { describe, expect, it } from "vitest";

import { fetchEventBySlug } from "../src/lib/polymarket/client";

const runLiveTests = process.env.RUN_LIVE_TESTS === "1";

describe.skipIf(!runLiveTests)("Polymarket live integration", () => {
  it("fetches and normalizes a multi-market event", async () => {
    const event = await fetchEventBySlug("putin-out-before-2027");

    expect(event.title).toContain("Putin");
    expect(event.markets.length).toBeGreaterThanOrEqual(2);
    expect(event.markets.every((market) => market.eventId === event.id)).toBe(
      true,
    );
    expect(
      event.markets.every(
        (market) => market.outcomes.length === market.probabilities.length,
      ),
    ).toBe(true);
  });
});
