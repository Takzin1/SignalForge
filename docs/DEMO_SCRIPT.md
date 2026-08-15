# SignalForge three-minute demo script

Target runtime: **2:55**. Record at 1080p with browser zoom set so the full result panels are readable. Open the deployed app and preload the timeline scenario before recording.

## 0:00–0:20 — Problem

> Prediction markets show individual probabilities, but related questions imply logical constraints that are hard to monitor manually. Titles alone are not enough because deadlines and resolution rules matter.

Show the event title and two preselected markets.

## 0:20–0:40 — Live data

> SignalForge starts with public Polymarket event data. These probabilities are live, normalized server-side, and require no wallet or trading API key.

Point to the **Live Polymarket data** badge, probabilities, event volume, and dates. If the upstream is degraded, point to the explicit snapshot badge and capture date instead.

## 0:40–1:20 — Analyze a relationship

Click **Analyze Relationship**.

> Featherless receives both full descriptions, resolution sources, time windows, and event context—not just the titles. Here it identifies the semantic relationship, direction, comparable scope, confidence, and reason.

Point to **AI interpretation**, relationship type, confidence bar, direction, and scope.

## 1:20–1:50 — Deterministic verification

> The model does not do this math. A pure TypeScript engine takes the validated relationship and applies the corresponding probability constraint. It returns PASS, WARNING, or ABSTAIN, the expected rule, observed values, and exact gap.

Point to the verdict, expected constraint, P(A), P(B), and gap. Describe the displayed result; do not promise a specific live verdict before recording.

## 1:50–2:15 — Advanced inference pipeline

> There are two bounded AI passes. The first emits strict JSON validated by Zod. The deterministic engine locks the verdict. A second Featherless pass explains only that computed result and cannot alter it. Low confidence or mismatched scope forces ABSTAIN.

Point to **Verdict locked by TypeScript** and the explanation.

## 2:15–2:35 — Architecture

Show the README architecture diagram.

> The data adapter isolates raw Gamma responses, Featherless stays server-side, Zod protects the model boundary, and the constraint engine has no API or LLM dependencies.

## 2:35–2:50 — Reliability and quality

Show the terminal with:

```text
30 tests passed
npm run lint
npm run vercel-build
```

> Tests cover every rule, PASS, WARNING, ABSTAIN, malformed model JSON, defensive market parsing, and curated fallback integrity. Upstream errors preserve user selections and return friendly retry states.

## 2:50–3:00 — Close

Return to the result screen.

> SignalForge turns semantic market relationships into verifiable analytical signals. AI understands the relationship. Mathematics verifies the probability.

Stop recording by 2:58 to leave upload-platform timing margin.
