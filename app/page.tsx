import { fetchEventBySlug } from "@/src/lib/polymarket/client";
import type { Market, PredictionEvent } from "@/src/lib/polymarket/types";

export const dynamic = "force-dynamic";

const DEMO_EVENT_SLUG = "putin-out-before-2027";

function formatUsd(value: number | null): string {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return "No end date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function yesProbability(market: Market): number | null {
  const yesIndex = market.outcomes.findIndex(
    (outcome) => outcome.toLowerCase() === "yes",
  );
  return yesIndex >= 0 ? (market.probabilities[yesIndex] ?? null) : null;
}

function MarketCard({ market, index }: { market: Market; index: number }) {
  const probability = yesProbability(market);

  return (
    <article className="rounded-2xl border border-white/10 bg-[#111f19] p-5">
      <div className="flex items-start justify-between gap-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#758b81]">
          Market {String(index + 1).padStart(2, "0")}
        </span>
        <span className="rounded-full border border-[#b8f35d]/25 bg-[#b8f35d]/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#c9f58a]">
          Live
        </span>
      </div>
      <h2 className="mt-4 min-h-14 text-base font-medium leading-6 text-[#edf3ef]">
        {market.question}
      </h2>
      <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/8 pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#758b81]">
            Yes probability
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-[#b8f35d]">
            {probability === null
              ? "—"
              : new Intl.NumberFormat("en-US", {
                  style: "percent",
                  maximumFractionDigits: 1,
                }).format(probability)}
          </p>
        </div>
        <div className="text-right text-xs leading-5 text-[#8fa198]">
          <p>Ends {formatDate(market.endDate)}</p>
          <p>{formatUsd(market.volume)} volume</p>
        </div>
      </div>
    </article>
  );
}

function EventDashboard({ event }: { event: PredictionEvent }) {
  return (
    <>
      <section className="grid gap-8 border-b border-white/10 px-6 py-10 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#b8f35d]/25 bg-[#b8f35d]/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c9f58a]">
              Live Polymarket data
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#758b81]">
              {event.markets.length} active markets
            </span>
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-[#8aa096]">
            Selected event
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {event.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#91a39a]">
            Select two related propositions in the next stage. SignalForge will
            interpret their resolution scopes before applying a deterministic
            probability rule.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 lg:min-w-72">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#758b81]">
              Volume
            </dt>
            <dd className="mt-1 text-lg font-medium">{formatUsd(event.volume)}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#758b81]">
              Liquidity
            </dt>
            <dd className="mt-1 text-lg font-medium">
              {formatUsd(event.liquidity)}
            </dd>
          </div>
          <div className="col-span-2 border-t border-white/8 pt-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#758b81]">
              Event window
            </dt>
            <dd className="mt-1 text-sm text-[#c3d0ca]">
              {formatDate(event.startDate)} → {formatDate(event.endDate)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="px-6 py-8 sm:px-8 lg:px-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#758b81]">
              Normalized market objects
            </p>
            <h2 className="mt-2 text-xl font-semibold">Resolution candidates</h2>
          </div>
          <p className="hidden text-xs text-[#758b81] sm:block">
            Refreshed at most once per minute
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {event.markets.map((market, index) => (
            <MarketCard index={index} key={market.id} market={market} />
          ))}
        </div>
      </section>
    </>
  );
}

function DataError() {
  return (
    <section className="grid flex-1 place-items-center px-6 py-20 text-center">
      <div className="max-w-lg rounded-3xl border border-amber-300/20 bg-amber-200/[0.04] p-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-200">
          Polymarket unavailable
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Live data could not be loaded.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#9dafA6]">
          The dashboard is still healthy. Refresh in a moment to retry the
          public market-data request.
        </p>
      </div>
    </section>
  );
}

export default async function Home() {
  let event: PredictionEvent | null = null;

  try {
    event = await fetchEventBySlug(DEMO_EVENT_SLUG);
  } catch {
    event = null;
  }

  return (
    <main className="min-h-screen bg-[#08100d] px-4 py-5 text-[#f4f7f5] sm:px-7 sm:py-7">
      <div className="mx-auto min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1713] shadow-2xl shadow-black/25 sm:min-h-[calc(100vh-3.5rem)]">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#b8f35d] font-mono text-sm font-bold text-[#08100d]">
              SF
            </span>
            <div>
              <p className="text-lg font-semibold leading-none tracking-tight">
                SignalForge
              </p>
              <p className="mt-1 hidden text-[10px] text-[#758b81] sm:block">
                AI interprets semantics. Code validates constraints.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-[#b8f35d]/30 bg-[#b8f35d]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c9f58a]">
            Stage B · Live data
          </span>
        </header>
        {event ? <EventDashboard event={event} /> : <DataError />}
        <footer className="border-t border-white/10 px-6 py-5 text-xs leading-5 text-[#758b81] sm:px-8">
          Analytical signals only. No trading, wallet connection, or financial
          advice.
        </footer>
      </div>
    </main>
  );
}
