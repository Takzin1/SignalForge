import { normalizeEvent, normalizeEventsPage } from "./normalize";
import type { EventsPage, PredictionEvent } from "./types";

const GAMMA_API_BASE_URL = "https://gamma-api.polymarket.com";
const REQUEST_TIMEOUT_MS = 8_000;

export class PolymarketApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "PolymarketApiError";
  }
}

async function fetchGammaJson(path: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GAMMA_API_BASE_URL + path, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new PolymarketApiError(
        "Polymarket returned HTTP " + response.status + ".",
        response.status,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof PolymarketApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new PolymarketApiError("Polymarket did not respond in time.");
    }

    throw new PolymarketApiError("Could not reach Polymarket.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchEventBySlug(
  slug: string,
): Promise<PredictionEvent> {
  const rawEvent = await fetchGammaJson(
    "/events/slug/" + encodeURIComponent(slug),
  );
  const event = normalizeEvent(rawEvent);

  if (!event || event.markets.length < 2) {
    throw new PolymarketApiError(
      "The event did not contain two comparable active markets.",
    );
  }

  return event;
}

export async function fetchLiveEvents(limit = 20): Promise<EventsPage> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const rawPage = await fetchGammaJson(
    "/events/keyset?closed=false&limit=" + safeLimit,
  );
  const page = normalizeEventsPage(rawPage);

  return {
    ...page,
    events: page.events.filter((event) => event.markets.length >= 2),
  };
}
