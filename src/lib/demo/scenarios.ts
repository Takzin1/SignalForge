import { fetchEventBySlug } from "../polymarket/client";
import type { Market, PredictionEvent } from "../polymarket/types";

export const DEMO_CAPTURED_AT = "2026-08-14T00:00:00.000Z";

export type DemoScenario = {
  id: string;
  label: string;
  relationshipHint: string;
  eventSlug: string;
  preferredMarketIds: [string, string];
};

export type ResolvedDemoEvent = {
  event: PredictionEvent;
  dataSource: "live" | "snapshot";
  capturedAt: string | null;
};

const PUTIN_DESCRIPTION =
  "This market will resolve to ‘Yes’ if Vladimir Putin ceases to be President of Russia for any period of time between market creation and the specified date (ET). Otherwise, this market will resolve to ‘No’. An announcement of Vladimir Putin's resignation or removal before this market's end date will immediately resolve this market to Yes, regardless of when it takes effect. Official information from Vladimir Putin and the government of Russia is the primary resolution source; a consensus of credible reporting may also be used.";

const FED_DESCRIPTION =
  "This market resolves according to the exact number of 25-basis-point-equivalent Fed rate cuts in 2026, including emergency cuts and any cuts made during the December meeting. A 50 bps cut counts as two cuts. The market remains open through December 31, 2026, 11:59 PM ET. The resolution sources are official FOMC statements and Federal Reserve target-rate publications.";

const NOMINEE_DESCRIPTION =
  "This market will resolve to Yes if the named individual wins and accepts the 2028 nomination of the Democratic Party for U.S. president. Otherwise, it resolves to No. The resolution source is a consensus of official Democratic Party sources. Replacement of the nominee before election day does not change resolution.";

function binaryMarket(
  eventId: string,
  values: Omit<
    Market,
    "eventId" | "outcomes" | "probabilities" | "active" | "closed"
  > & {
    yes: number;
  },
): Market {
  return {
    id: values.id,
    eventId,
    question: values.question,
    description: values.description,
    resolutionSource: values.resolutionSource,
    startDate: values.startDate,
    endDate: values.endDate,
    outcomes: ["Yes", "No"],
    probabilities: [values.yes, 1 - values.yes],
    liquidity: values.liquidity,
    volume: values.volume,
    slug: values.slug,
    active: true,
    closed: false,
  };
}

const SNAPSHOTS: Record<string, PredictionEvent> = {
  "putin-out-before-2027": {
    id: "31195",
    title: "Putin out as President of Russia by...?",
    description: PUTIN_DESCRIPTION,
    resolutionSource: "",
    startDate: "2025-07-06T22:30:10.584Z",
    endDate: "2027-06-30T18:30:00Z",
    liquidity: 933990.40845,
    volume: 20634824.708439,
    slug: "putin-out-before-2027",
    negRisk: false,
    markets: [
      binaryMarket("31195", {
        id: "2822003",
        question: "Putin out as President of Russia by August 31, 2026?",
        description: PUTIN_DESCRIPTION,
        resolutionSource: "",
        startDate: "2026-07-06T21:34:25.571703Z",
        endDate: "2026-08-31T18:30:00Z",
        liquidity: 123073.4711,
        volume: 645990.4051270001,
        slug: "putin-out-as-president-of-russia-by-august-31-2026",
        yes: 0.0095,
      }),
      binaryMarket("31195", {
        id: "2822005",
        question: "Putin out as President of Russia by September 30, 2026?",
        description: PUTIN_DESCRIPTION,
        resolutionSource: "",
        startDate: "2026-07-06T21:34:47.71577Z",
        endDate: "2026-09-30T18:30:00Z",
        liquidity: 65690.85155,
        volume: 461014.7310889999,
        slug: "putin-out-as-president-of-russia-by-september-30-2026",
        yes: 0.024,
      }),
    ],
  },
  "how-many-fed-rate-cuts-in-2026": {
    id: "51456",
    title: "How many Fed rate cuts in 2026?",
    description: FED_DESCRIPTION,
    resolutionSource: "",
    startDate: "2025-09-29T22:24:45.988997Z",
    endDate: "2026-12-31T00:00:00Z",
    liquidity: 3186732.23034,
    volume: 48448619.29424,
    slug: "how-many-fed-rate-cuts-in-2026",
    negRisk: true,
    markets: [
      binaryMarket("51456", {
        id: "616902",
        question: "Will no Fed rate cuts happen in 2026?",
        description: FED_DESCRIPTION,
        resolutionSource: "",
        startDate: "2025-09-29T22:24:45.988997Z",
        endDate: "2026-12-31T00:00:00Z",
        liquidity: 109766.2839,
        volume: 7249336.831572,
        slug: "will-no-fed-rate-cuts-happen-in-2026",
        yes: 0.8525,
      }),
      binaryMarket("51456", {
        id: "616903",
        question: "Will 1 Fed rate cut happen in 2026?",
        description: FED_DESCRIPTION,
        resolutionSource: "",
        startDate: "2025-09-29T22:24:47.834711Z",
        endDate: "2026-12-31T00:00:00Z",
        liquidity: 180552.7918,
        volume: 2528801.133695999,
        slug: "will-1-fed-rate-cut-happen-in-2026",
        yes: 0.095,
      }),
    ],
  },
  "democratic-presidential-nominee-2028": {
    id: "30829",
    title: "Democratic Presidential Nominee 2028",
    description: NOMINEE_DESCRIPTION,
    resolutionSource: "",
    startDate: "2025-07-11T18:35:56.805Z",
    endDate: "2028-11-07T00:00:00Z",
    liquidity: 80046363.07823,
    volume: 1258168706.3533642,
    slug: "democratic-presidential-nominee-2028",
    negRisk: true,
    markets: [
      binaryMarket("30829", {
        id: "559658",
        question: "Will Kamala Harris win the 2028 Democratic presidential nomination?",
        description: NOMINEE_DESCRIPTION,
        resolutionSource: "",
        startDate: "2025-07-11T18:36:03.15Z",
        endDate: "2028-11-07T00:00:00Z",
        liquidity: 334844.01026,
        volume: 12923402.269566,
        slug: "will-kamala-harris-win-the-2028-democratic-presidential-nomination-641",
        yes: 0.0745,
      }),
      binaryMarket("30829", {
        id: "559652",
        question: "Will Gavin Newsom win the 2028 Democratic presidential nomination?",
        description: NOMINEE_DESCRIPTION,
        resolutionSource: "",
        startDate: "2025-07-11T18:35:56.805Z",
        endDate: "2028-11-07T00:00:00Z",
        liquidity: 355263.72429,
        volume: 26727944.16633999,
        slug: "will-gavin-newsom-win-the-2028-democratic-presidential-nomination-568",
        yes: 0.1655,
      }),
    ],
  },
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "exclusive-count",
    label: "Mutually exclusive counts",
    relationshipHint: "0 cuts and exactly 1 cut",
    eventSlug: "how-many-fed-rate-cuts-in-2026",
    preferredMarketIds: ["616902", "616903"],
  },
  {
    id: "timeline",
    label: "Timeline prerequisite",
    relationshipHint: "Earlier deadline ⇒ later deadline",
    eventSlug: "putin-out-before-2027",
    preferredMarketIds: ["2822003", "2822005"],
  },
  {
    id: "exclusive-nominee",
    label: "Mutually exclusive nominees",
    relationshipHint: "Only one nominee can win",
    eventSlug: "democratic-presidential-nominee-2028",
    preferredMarketIds: ["559658", "559652"],
  },
];

export function findDemoScenario(slug: string): DemoScenario | null {
  return DEMO_SCENARIOS.find((scenario) => scenario.eventSlug === slug) ?? null;
}

export function getDemoSnapshot(slug: string): PredictionEvent | null {
  return SNAPSHOTS[slug] ?? null;
}

export async function resolveDemoEvent(slug: string): Promise<ResolvedDemoEvent> {
  const snapshot = getDemoSnapshot(slug);
  if (!snapshot) {
    throw new Error("No curated demo scenario exists for this event.");
  }

  try {
    return {
      event: await fetchEventBySlug(slug),
      dataSource: "live",
      capturedAt: null,
    };
  } catch {
    return {
      event: snapshot,
      dataSource: "snapshot",
      capturedAt: DEMO_CAPTURED_AT,
    };
  }
}
