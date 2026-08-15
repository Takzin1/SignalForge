# SignalForge three-minute demo script

Target runtime: **2:58**. Record at 1080p with browser zoom set so both result cards are readable. The deployed app now opens with the primary Fed exact-count pair preselected.

## 0:00–0:20 — Problem

> Prediction markets show individual probabilities, but related propositions can imply logical constraints that are difficult to monitor manually. Titles alone are not enough because resolution wording, sources, and dates matter.

Show the two preselected Fed markets.

## 0:20–0:40 — SignalForge

> SignalForge combines two kinds of reasoning. AI understands the semantic relationship. Deterministic TypeScript verifies the probability constraint. It is an analytical tool—not a trading bot or financial advice.

Point to the product tagline and **Live Polymarket data** badge. If the upstream is degraded, explicitly point to the snapshot badge and capture date.

## 0:40–1:25 — Live workflow

> This public Polymarket event resolves on the exact number of Fed cuts in 2026. Zero cuts and exactly one cut cannot both happen, so I will analyze this preselected pair.

Click **Analyze Relationship**. While it loads, point to the current Yes probabilities, event dates, and the fact that no wallet or trading API key is required.

When the result appears, show the verdict without promising a particular live value in advance.

## 1:25–1:55 — AI semantic classification

> Gemini receives both full market descriptions, resolution sources, time windows, and event context—not just their titles. It returns strict JSON containing the relationship, direction, comparable-scope decision, confidence, abstention flag, and reason. Zod validates that contract. Low confidence or mismatched scope forces ABSTAIN.

Point to **AI interpretation**, the confidence bar, direction, and comparable scope.

## 1:55–2:20 — Deterministic mathematics

> The LLM never decides whether this constraint passes or fails. A pure TypeScript engine applies the rule P of A plus P of B must be no greater than one, then returns PASS, WARNING, or ABSTAIN with the observed values and exact gap.

Point to **Mathematical check**, P(A), P(B), constraint gap, and the verdict. Then point to **Verdict locked by TypeScript**: a second Gemini pass explains the computed result but cannot alter it.

## 2:20–2:40 — Architecture and safeguards

Show the README architecture diagram.

> Raw Gamma responses are isolated behind a defensive adapter. Gemini stays server-side. Structured output crosses a Zod boundary before the math engine. Curated events fall back to an explicitly labelled snapshot, never fake live data.

## 2:40–2:55 — Reliability and solo execution

Show the test output or README test section.

> Built solo during Impact Forge Summer 2026, SignalForge has deterministic rule tests, PASS, WARNING and ABSTAIN coverage, malformed-model-output checks, defensive market parsing, snapshot integrity tests, CI, and zero production dependency vulnerabilities.

## 2:55–3:00 — Close

Return to the result screen.

> AI understands the relationship. Mathematics verifies the probability.

Stop immediately after the closing line; do not add a generic AI explanation or feature roadmap.

## Recording fallback order

1. Primary: Fed 0 cuts vs exactly 1 cut.
2. Backup: Putin out by August 31 vs September 30, 2026.
3. Last resort: rerun either curated scenario and clearly show the labelled snapshot state.
