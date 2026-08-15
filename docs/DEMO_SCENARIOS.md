# Curated demo scenarios

SignalForge provides three reliable paths for a short demonstration. Every path uses a real Polymarket event slug and attempts a current Gamma API fetch first.

If that fetch fails, SignalForge loads a source-controlled snapshot captured on **2026-08-14 UTC**. The dashboard changes its badge from **Live Polymarket data** to **Polymarket snapshot**, displays the capture date, and labels the state **degraded demo**.

## Primary — Mutually exclusive exact counts

- Event: `how-many-fed-rate-cuts-in-2026`
- Market A: no Fed cuts in 2026
- Market B: exactly one Fed rate cut in 2026
- Relationship to inspect: mutually exclusive
- Mathematical rule: `P(A) + P(B) <= 1`

This is the primary recording path: the propositions are intuitive, share one exact-count resolution definition and window, and the event remains open through the end of 2026.

## Backup — Timeline prerequisite

- Event: `putin-out-before-2027`
- Market A: Putin out by August 31, 2026
- Market B: Putin out by September 30, 2026
- Relationship to inspect: A should require B
- Mathematical rule: `P(A) <= P(B)`

This demonstrates why titles are insufficient: the classifier must inspect that the subject and resolution condition match while the deadlines create a directional implication.

## Additional — Mutually exclusive nominees

- Event: `democratic-presidential-nominee-2028`
- Market A: Kamala Harris wins the nomination
- Market B: Gavin Newsom wins the nomination
- Relationship to inspect: mutually exclusive
- Mathematical rule: `P(A) + P(B) <= 1`

This demonstrates the same mathematical rule applied to a different semantic domain.

## Reliability notes

- Probabilities are intentionally not described as guaranteed demo outcomes because live values change.
- The model may abstain if it finds ambiguous scope. That is a valid safety result, not an application failure.
- Snapshot mode protects the market-data part of the demo, not the Featherless dependency.
- Recovery order for recording is **Primary → Backup → labelled snapshot**.
- If Featherless is unavailable, show the friendly preserved-selection error, then use the architecture and passing deterministic tests to explain the boundary.
- Never describe a warning as an arbitrage opportunity or trading signal.
