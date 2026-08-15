import { describe, expect, it } from "vitest";

import {
  DEMO_CAPTURED_AT,
  DEMO_SCENARIOS,
  findDemoScenario,
  getDemoSnapshot,
} from "../../src/lib/demo/scenarios";
import { outcomeProbability } from "../../src/lib/polymarket/probability";

describe("curated demo scenarios", () => {
  it("defines three distinct real-market scenarios", () => {
    expect(DEMO_SCENARIOS).toHaveLength(3);
    expect(new Set(DEMO_SCENARIOS.map((scenario) => scenario.eventSlug)).size).toBe(
      3,
    );
  });

  it.each(DEMO_SCENARIOS)(
    "$label has a traceable snapshot and valid preferred pair",
    (scenario) => {
      const snapshot = getDemoSnapshot(scenario.eventSlug);

      expect(snapshot).not.toBeNull();
      expect(snapshot?.slug).toBe(scenario.eventSlug);
      expect(findDemoScenario(scenario.eventSlug)).toEqual(scenario);

      for (const marketId of scenario.preferredMarketIds) {
        const market = snapshot?.markets.find((item) => item.id === marketId);
        expect(market).toBeDefined();
        expect(market && outcomeProbability(market, "Yes")).toBeTypeOf("number");
      }
    },
  );

  it("records an explicit UTC capture time", () => {
    expect(new Date(DEMO_CAPTURED_AT).toISOString()).toBe(DEMO_CAPTURED_AT);
  });
});
