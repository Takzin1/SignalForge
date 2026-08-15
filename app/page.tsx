const stages = [
  "Live market discovery",
  "Semantic relationship classification",
  "Deterministic probability verification",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08100d] px-5 py-8 text-[#f4f7f5] sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col rounded-[2rem] border border-white/10 bg-[#0d1713] shadow-2xl shadow-black/25">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#b8f35d] font-mono text-sm font-bold text-[#08100d]">
              SF
            </span>
            <span className="text-lg font-semibold tracking-tight">SignalForge</span>
          </div>
          <span className="rounded-full border border-[#b8f35d]/30 bg-[#b8f35d]/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c9f58a]">
            Stage A · Foundation
          </span>
        </header>

        <section className="grid flex-1 items-center gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-14 lg:py-20">
          <div>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.22em] text-[#8aa096]">
              Logical consistency for prediction markets
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              AI understands the relationship.
              <span className="mt-2 block text-[#b8f35d]">
                Mathematics verifies the probability.
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#aab9b2] sm:text-lg">
              SignalForge will inspect related Polymarket questions, classify
              their semantic relationship with Featherless, and verify the
              implied probability constraint with deterministic TypeScript.
            </p>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-[#111f19] p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8aa096]">
                Analysis pipeline
              </p>
              <span className="size-2 rounded-full bg-[#b8f35d] shadow-[0_0_18px_#b8f35d]" />
            </div>
            <ol className="mt-6 space-y-3">
              {stages.map((stage, index) => (
                <li
                  className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.025] p-4"
                  key={stage}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 font-mono text-xs text-[#c9f58a]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-[#dce5e0]">{stage}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-[#789087]">
              Analytical signals only. No trading, wallet connection, or
              financial advice.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
