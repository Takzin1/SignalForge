import { z } from "zod";

import type { EventsPage, Market, PredictionEvent } from "./types";

const rawMarketSchema = z
  .object({
    id: z.unknown(),
    question: z.unknown(),
    description: z.unknown().optional(),
    resolutionSource: z.unknown().optional(),
    startDate: z.unknown().optional(),
    endDate: z.unknown().optional(),
    outcomes: z.unknown().optional(),
    outcomePrices: z.unknown().optional(),
    liquidity: z.unknown().optional(),
    volume: z.unknown().optional(),
    slug: z.unknown(),
    active: z.unknown().optional(),
    closed: z.unknown().optional(),
  })
  .passthrough();

const rawEventSchema = z
  .object({
    id: z.unknown(),
    title: z.unknown(),
    description: z.unknown().optional(),
    resolutionSource: z.unknown().optional(),
    startDate: z.unknown().optional(),
    endDate: z.unknown().optional(),
    liquidity: z.unknown().optional(),
    volume: z.unknown().optional(),
    slug: z.unknown(),
    negRisk: z.unknown().optional(),
    markets: z.unknown(),
  })
  .passthrough();

const eventsPageSchema = z
  .object({
    events: z.array(z.unknown()),
    next_cursor: z.unknown().optional(),
  })
  .passthrough();

function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalDate(value: unknown): string | null {
  const stringValue = requiredString(value);
  return stringValue && Number.isFinite(Date.parse(stringValue))
    ? stringValue
    : null;
}

function optionalNumber(value: unknown): number | null {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numberValue) ? numberValue : null;
}

function booleanWithDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parseStringArray(value: unknown): string[] {
  let candidate = value;

  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(candidate)) {
    return [];
  }

  return candidate
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProbabilityArray(value: unknown): number[] {
  let candidate = value;

  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(candidate)) {
    return [];
  }

  return candidate.map(optionalNumber).filter((item): item is number => {
    return item !== null && item >= 0 && item <= 1;
  });
}

export function normalizeMarket(
  value: unknown,
  eventId: string,
): Market | null {
  const parsed = rawMarketSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }

  const id = requiredString(parsed.data.id);
  const question = requiredString(parsed.data.question);
  const slug = requiredString(parsed.data.slug);

  if (!id || !question || !slug) {
    return null;
  }

  const outcomes = parseStringArray(parsed.data.outcomes);
  const probabilities = parseProbabilityArray(parsed.data.outcomePrices);

  if (outcomes.length < 2 || outcomes.length !== probabilities.length) {
    return null;
  }

  return {
    id,
    eventId,
    question,
    description: optionalString(parsed.data.description),
    resolutionSource: optionalString(parsed.data.resolutionSource),
    startDate: optionalDate(parsed.data.startDate),
    endDate: optionalDate(parsed.data.endDate),
    outcomes,
    probabilities,
    liquidity: optionalNumber(parsed.data.liquidity),
    volume: optionalNumber(parsed.data.volume),
    slug,
    active: booleanWithDefault(parsed.data.active, true),
    closed: booleanWithDefault(parsed.data.closed, false),
  };
}

export function normalizeEvent(value: unknown): PredictionEvent | null {
  const parsed = rawEventSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }

  const id = requiredString(parsed.data.id);
  const title = requiredString(parsed.data.title);
  const slug = requiredString(parsed.data.slug);

  if (!id || !title || !slug || !Array.isArray(parsed.data.markets)) {
    return null;
  }

  const markets = parsed.data.markets
    .map((market) => normalizeMarket(market, id))
    .filter((market): market is Market => market !== null)
    .filter((market) => market.active && !market.closed);

  return {
    id,
    title,
    description: optionalString(parsed.data.description),
    resolutionSource: optionalString(parsed.data.resolutionSource),
    startDate: optionalDate(parsed.data.startDate),
    endDate: optionalDate(parsed.data.endDate),
    liquidity: optionalNumber(parsed.data.liquidity),
    volume: optionalNumber(parsed.data.volume),
    slug,
    negRisk: booleanWithDefault(parsed.data.negRisk, false),
    markets,
  };
}

export function normalizeEventsPage(value: unknown): EventsPage {
  const parsed = eventsPageSchema.safeParse(value);
  if (!parsed.success) {
    return { events: [], nextCursor: null };
  }

  return {
    events: parsed.data.events
      .map(normalizeEvent)
      .filter((event): event is PredictionEvent => event !== null),
    nextCursor: requiredString(parsed.data.next_cursor),
  };
}
