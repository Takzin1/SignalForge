"use client";

import { useMemo, useState } from "react";

import type {
  AnalysisResult,
  AnalyzeResponse,
} from "@/src/lib/analysis/types";
import type { DemoScenario } from "@/src/lib/demo/scenarios";
import type { EventSummary } from "@/src/lib/polymarket/types";
import type {
  DashboardEvent,
  DashboardMarket,
} from "@/src/lib/polymarket/public";
import { outcomeProbability } from "@/src/lib/polymarket/probability";

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

function formatProbability(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function titleCase(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function MarketCard({
  market,
  index,
  selection,
  onToggle,
}: {
  market: DashboardMarket;
  index: number;
  selection: "A" | "B" | null;
  onToggle: () => void;
}) {
  const probability = outcomeProbability(market, "Yes");
  const selected = selection !== null;

  return (
    <button
      aria-pressed={selected}
      className={
        "group rounded-2xl border p-5 text-left transition " +
        (selected
          ? "border-[#b8f35d]/70 bg-[#b8f35d]/8 shadow-[0_0_0_1px_rgba(184,243,93,0.08)]"
          : "border-white/10 bg-[#111f19] hover:border-white/25 hover:bg-[#14241d]")
      }
      onClick={onToggle}
      type="button"
    >
      <div className="flex items-start justify-between gap-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#758b81]">
          Market {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={
            "grid size-7 place-items-center rounded-full border font-mono text-[10px] " +
            (selected
              ? "border-[#b8f35d] bg-[#b8f35d] font-bold text-[#08100d]"
              : "border-white/15 text-[#758b81]")
          }
        >
          {selection ?? "＋"}
        </span>
      </div>
      <h3 className="mt-4 min-h-14 text-base font-medium leading-6 text-[#edf3ef]">
        {market.question}
      </h3>
      <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/8 pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#758b81]">
            Yes probability
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-[#b8f35d]">
            {probability === null ? "—" : formatProbability(probability)}
          </p>
        </div>
        <div className="text-right text-xs leading-5 text-[#8fa198]">
          <p>Ends {formatDate(market.endDate)}</p>
          <p>{formatUsd(market.volume)} volume</p>
        </div>
      </div>
    </button>
  );
}

function ResultPanel({ analysis }: { analysis: AnalysisResult }) {
  const verdictStyles = {
    pass: "border-[#b8f35d]/35 bg-[#b8f35d]/10 text-[#c9f58a]",
    warning: "border-[#ffb86b]/35 bg-[#ffb86b]/10 text-[#ffc98f]",
    abstain: "border-[#8fa198]/35 bg-[#8fa198]/10 text-[#c3d0ca]",
  };
  const { constraint, relationship } = analysis;

  return (
    <section
      aria-live="polite"
      className="mt-8 rounded-3xl border border-white/10 bg-[#0a1410] p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#758b81]">
            Completed analysis
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Relationship verification
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.13em] text-[#8fa198]">
            {analysis.dataSource === "live" ? "Live input" : "Snapshot input"}
          </span>
          <span
            className={
              "rounded-full border px-4 py-2 font-mono text-xs font-bold tracking-[0.16em] " +
              verdictStyles[constraint.status]
            }
          >
            {constraint.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa096]">
            AI interpretation
          </p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-xl font-semibold">
              {titleCase(relationship.relationship)}
            </p>
            <p className="font-mono text-sm text-[#c9f58a]">
              {formatProbability(relationship.confidence)}
            </p>
          </div>
          <div
            aria-label="Relationship confidence"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(relationship.confidence * 100)}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-[#b8f35d]"
              style={{ width: `${relationship.confidence * 100}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-[#a8b8b0]">
            {relationship.reason}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/8 pt-4 text-xs">
            <div>
              <dt className="text-[#758b81]">Direction</dt>
              <dd className="mt-1 text-[#d5dfda]">
                {titleCase(relationship.direction)}
              </dd>
            </div>
            <div>
              <dt className="text-[#758b81]">Comparable scope</dt>
              <dd className="mt-1 text-[#d5dfda]">
                {relationship.same_resolution_scope ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa096]">
            Mathematical check
          </p>
          <p className="mt-4 font-mono text-lg text-[#edf3ef]">
            {constraint.expectedConstraint}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/8 p-3">
              <dt className="font-mono text-[10px] uppercase text-[#758b81]">
                P(A)
              </dt>
              <dd className="mt-1 text-xl font-semibold">
                {formatProbability(analysis.marketA.probability)}
              </dd>
            </div>
            <div className="rounded-xl border border-white/8 p-3">
              <dt className="font-mono text-[10px] uppercase text-[#758b81]">
                P(B)
              </dt>
              <dd className="mt-1 text-xl font-semibold">
                {formatProbability(analysis.marketB.probability)}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
            <span className="text-sm text-[#8fa198]">Constraint gap</span>
            <span className="font-mono text-lg text-[#edf3ef]">
              {constraint.gap === null
                ? "Not applied"
                : (constraint.gap >= 0 ? "+" : "") +
                  constraint.gap.toFixed(3)}
            </span>
          </div>
        </article>
      </div>

      <article className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa096]">
            Grounded explanation
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-[#64786f]">
            Verdict locked by TypeScript
          </p>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#b7c5be]">
          {analysis.explanation}
        </p>
      </article>
    </section>
  );
}

export function AnalysisDashboard({
  initialEvent,
  eventOptions,
  demoScenarios,
  initialSelectedIds,
}: {
  initialEvent: DashboardEvent;
  eventOptions: EventSummary[];
  demoScenarios: DemoScenario[];
  initialSelectedIds: string[];
}) {
  const [event, setEvent] = useState(initialEvent);
  const [eventQuery, setEventQuery] = useState("");
  const [isEventLoading, setIsEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedIds.filter((id) =>
      initialEvent.markets.some((market) => market.id === id),
    ),
  );
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<{
    message: string;
    retryable: boolean;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const selectedMarkets = useMemo(
    () =>
      selectedIds
        .map((id) => event.markets.find((market) => market.id === id))
        .filter((market): market is DashboardMarket => Boolean(market)),
    [event.markets, selectedIds],
  );
  const filteredEventOptions = useMemo(() => {
    const query = eventQuery.trim().toLowerCase();
    const matches = query
      ? eventOptions.filter((option) =>
          option.title.toLowerCase().includes(query),
        )
      : eventOptions;
    const current = eventOptions.find((option) => option.slug === event.slug);
    return current && !matches.some((option) => option.slug === current.slug)
      ? [current, ...matches]
      : matches;
  }, [event.slug, eventOptions, eventQuery]);

  function toggleMarket(id: string) {
    setAnalysis(null);
    setError(null);
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((selectedId) => selectedId !== id);
      }
      if (current.length < 2) {
        return [...current, id];
      }
      return [current[0], id];
    });
  }

  async function changeEvent(
    slug: string,
    options: { curated?: boolean; preferredMarketIds?: string[] } = {},
  ) {
    if ((slug === event.slug && !options.curated) || isEventLoading) return;

    setIsEventLoading(true);
    setEventError(null);
    setError(null);
    setAnalysis(null);

    try {
      const query = options.curated ? "?curated=1" : "";
      const response = await fetch(
        "/api/events/" + encodeURIComponent(slug) + query,
      );
      const payload = (await response.json()) as {
        ok: boolean;
        event?: DashboardEvent;
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.event) {
        setEventError(payload.error ?? "This event could not be loaded.");
        return;
      }

      setEvent(payload.event);
      setSelectedIds(
        (options.preferredMarketIds ?? []).filter((id) =>
          payload.event?.markets.some((market) => market.id === id),
        ),
      );
    } catch {
      setEventError(
        "The event service could not be reached. The current event is preserved.",
      );
    } finally {
      setIsEventLoading(false);
    }
  }

  async function analyze() {
    if (selectedIds.length !== 2 || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: event.slug,
          marketAId: selectedIds[0],
          marketBId: selectedIds[1],
          dataSource: event.dataSource,
        }),
      });
      const payload = (await response.json()) as AnalyzeResponse;

      if (!payload.ok) {
        setError({
          message: payload.error.message,
          retryable: payload.error.retryable,
        });
        return;
      }
      setAnalysis(payload.analysis);
    } catch {
      setError({
        message:
          "The analysis service could not be reached. Your market selections are preserved.",
        retryable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <>
      <section className="border-b border-white/10 bg-[#0a1410] px-6 py-5 sm:px-8 lg:px-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#758b81]">
            Curated demo paths
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {demoScenarios.map((scenario) => {
              const active = scenario.eventSlug === event.slug;
              return (
                <button
                  className={
                    "rounded-xl border px-4 py-3 text-left transition disabled:opacity-60 " +
                    (active
                      ? "border-[#b8f35d]/45 bg-[#b8f35d]/8"
                      : "border-white/10 bg-[#111f19] hover:border-white/25")
                  }
                  disabled={isEventLoading}
                  key={scenario.id}
                  onClick={() =>
                    changeEvent(scenario.eventSlug, {
                      curated: true,
                      preferredMarketIds: scenario.preferredMarketIds,
                    })
                  }
                  type="button"
                >
                  <span className="block text-xs font-medium text-[#dce5e0]">
                    {scenario.label}
                  </span>
                  <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.11em] text-[#758b81]">
                    {scenario.relationshipHint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-5 grid gap-3 border-t border-white/8 pt-5 lg:grid-cols-[1fr_1.25fr]">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#758b81]">
              Search event list
            </span>
            <input
              className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#111f19] px-4 text-sm text-[#edf3ef] outline-none transition placeholder:text-[#5f746a] focus:border-[#b8f35d]/50"
              onChange={(event) => setEventQuery(event.target.value)}
              placeholder="Election, rates, company..."
              type="search"
              value={eventQuery}
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#758b81]">
              Live Polymarket event
            </span>
            <div className="relative mt-2">
              <select
                className="min-h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#111f19] px-4 pr-10 text-sm text-[#edf3ef] outline-none transition focus:border-[#b8f35d]/50 disabled:opacity-60"
                disabled={isEventLoading}
                onChange={(change) => changeEvent(change.target.value)}
                value={event.slug}
              >
                {filteredEventOptions.map((option) => (
                  <option key={option.id} value={option.slug}>
                    {option.title} · {option.marketCount} markets
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#758b81]">
                {isEventLoading ? "…" : "⌄"}
              </span>
            </div>
          </label>
        </div>
        {eventError ? (
          <p aria-live="polite" className="mt-3 text-xs text-amber-200">
            {eventError}
          </p>
        ) : null}
      </section>
      <section className="grid gap-8 border-b border-white/10 px-6 py-10 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#b8f35d]/25 bg-[#b8f35d]/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c9f58a]">
              {event.dataSource === "live"
                ? "Live Polymarket data"
                : "Polymarket snapshot"}
            </span>
            {event.capturedAt ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-amber-200">
                Captured {formatDate(event.capturedAt)} · degraded demo
              </span>
            ) : null}
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
            Select two propositions. Gemini interprets the resolution
            relationship; deterministic TypeScript verifies the probability
            rule.
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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#758b81]">
              Step 1 · Choose a pair
            </p>
            <h2 className="mt-2 text-xl font-semibold">Resolution candidates</h2>
            <p className="mt-2 text-sm text-[#758b81]">
              {selectedMarkets.length === 0
                ? "Choose Market A, then Market B."
                : selectedMarkets.length === 1
                  ? "Market A selected. Choose Market B."
                  : "Pair ready for semantic analysis."}
            </p>
          </div>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#b8f35d] px-6 py-3 text-sm font-semibold text-[#08100d] transition hover:bg-[#c9f58a] disabled:cursor-not-allowed disabled:bg-[#26352e] disabled:text-[#6f8379]"
            disabled={selectedIds.length !== 2 || isAnalyzing}
            onClick={analyze}
            type="button"
          >
            {isAnalyzing ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-[#08100d]/25 border-t-[#08100d]" />
                Analyzing relationship
              </>
            ) : (
              "Analyze Relationship"
            )}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {event.markets.map((market, index) => {
            const selectedIndex = selectedIds.indexOf(market.id);
            return (
              <MarketCard
                index={index}
                key={market.id}
                market={market}
                onToggle={() => toggleMarket(market.id)}
                selection={
                  selectedIndex === 0 ? "A" : selectedIndex === 1 ? "B" : null
                }
              />
            );
          })}
        </div>

        {error ? (
          <div
            aria-live="polite"
            className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-amber-300/20 bg-amber-200/[0.04] p-5"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-200">
                Analysis unavailable
              </p>
              <p className="mt-2 text-sm leading-6 text-[#c9d3ce]">
                {error.message}
              </p>
            </div>
            {error.retryable ? (
              <button
                className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-[#d5dfda] hover:border-white/25"
                onClick={analyze}
                type="button"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        {analysis ? <ResultPanel analysis={analysis} /> : null}
      </section>
    </>
  );
}
