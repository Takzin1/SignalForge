import { AnalysisDashboard } from "@/src/components/analysis-dashboard";
import { fetchEventBySlug } from "@/src/lib/polymarket/client";
import type { PredictionEvent } from "@/src/lib/polymarket/types";

export const dynamic = "force-dynamic";

const DEMO_EVENT_SLUG = "putin-out-before-2027";

function DataError() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-6 py-20 text-center">
      <div className="max-w-lg rounded-3xl border border-amber-300/20 bg-amber-200/[0.04] p-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-200">
          Polymarket unavailable
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Live data could not be loaded.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#9dafa6]">
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
            Live analysis
          </span>
        </header>
        {event ? <AnalysisDashboard event={event} /> : <DataError />}
        <footer className="border-t border-white/10 px-6 py-5 text-xs leading-5 text-[#758b81] sm:px-8">
          Analytical signals only. No trading, wallet connection, or financial
          advice.
        </footer>
      </div>
    </main>
  );
}
