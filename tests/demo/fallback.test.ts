import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/polymarket/client", () => ({
  fetchEventBySlug: vi.fn(),
}));

import {
  DEMO_CAPTURED_AT,
  getDemoSnapshot,
  resolveDemoEvent,
} from "../../src/lib/demo/scenarios";
import { fetchEventBySlug } from "../../src/lib/polymarket/client";
import { toDashboardEvent } from "../../src/lib/polymarket/public";

const EVENT_SLUG = "how-many-fed-rate-cuts-in-2026";
const snapshot = getDemoSnapshot(EVENT_SLUG);

describe("curated event fallback", () => {
  beforeEach(() => {
    vi.mocked(fetchEventBySlug).mockReset();
  });

  it("prefers current Polymarket data when the upstream succeeds", async () => {
    expect(snapshot).not.toBeNull();
    vi.mocked(fetchEventBySlug).mockResolvedValue(snapshot!);

    const resolved = await resolveDemoEvent(EVENT_SLUG);

    expect(resolved.dataSource).toBe("live");
    expect(resolved.capturedAt).toBeNull();
  });

  it("returns a labelled snapshot when the upstream fails", async () => {
    vi.mocked(fetchEventBySlug).mockRejectedValue(
      new Error("simulated upstream failure"),
    );

    const resolved = await resolveDemoEvent(EVENT_SLUG);
    const dashboardEvent = toDashboardEvent(resolved.event, {
      dataSource: resolved.dataSource,
      capturedAt: resolved.capturedAt,
    });

    expect(resolved.dataSource).toBe("snapshot");
    expect(resolved.capturedAt).toBe(DEMO_CAPTURED_AT);
    expect(dashboardEvent.dataSource).toBe("snapshot");
    expect(dashboardEvent.capturedAt).toBe(DEMO_CAPTURED_AT);
    expect(dashboardEvent.markets).toHaveLength(2);
  });
});
