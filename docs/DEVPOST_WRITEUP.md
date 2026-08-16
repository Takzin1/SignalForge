# SignalForge — Devpost Technical Writeup

## Inspiration

Prediction markets are good at showing the probability of one proposition at a time. The harder problem appears when several markets are logically related. An earlier deadline may imply a later deadline, two exact outcomes may be mutually exclusive, or two differently worded markets may be equivalent only if their resolution rules actually match.

Humans can reason about those relationships, but doing it reliably requires reading full descriptions, dates, event context, and resolution sources. SignalForge was built to automate that process without asking an LLM to do mathematics it cannot reliably guarantee.

**AI understands the relationship. Mathematics verifies the probability.**

## What it does

SignalForge is an AI-powered logical consistency engine for prediction markets.

A user selects a live public Polymarket event and two markets. SignalForge then:

1. fetches and normalizes public market data;
2. sends the full resolution evidence to Gemini for semantic relationship classification;
3. validates the model's structured response with Zod;
4. applies a deterministic probability constraint in TypeScript;
5. returns **PASS**, **WARNING**, or **ABSTAIN** with confidence, observed probabilities, the expected constraint, the gap, and a grounded explanation.

The supported relationship types include prerequisite, subset, mutually exclusive, equivalent, exhaustive pair, correlated only, independent, and unknown.

**The LLM never decides whether the probability constraint passes or fails.** The model interprets semantics; code owns the verdict.

## How we built it

SignalForge is a single Next.js App Router application written in TypeScript. A dedicated Polymarket adapter separates the dashboard from Gamma API response shapes. All Gemini calls run in server-side route handlers, so the API key never reaches the browser.

The semantic classifier receives both questions, descriptions, resolution sources, start and end dates, and the surrounding event context. It must return a strict JSON object containing the relationship, direction, same-resolution-scope decision, confidence, abstention flag, and reason. Zod validates that object before any mathematical rule can run.

The deterministic engine is a separate collection of pure TypeScript functions. It checks rules such as:

- prerequisite or subset: P(A) ≤ P(B);
- mutually exclusive: P(A) + P(B) ≤ 1;
- equivalent: |P(A) − P(B)| ≤ tolerance;
- exhaustive binary pair: |P(A) + P(B) − 1| ≤ tolerance.

A second Gemini call may turn the already-computed result into concise prose. That explanation step receives the locked verdict and cannot modify it. If the explanation call fails, SignalForge keeps the verdict and uses deterministic fallback copy.

For demo reliability, each curated scenario tries the live Polymarket API first and falls back to an explicitly labelled, source-controlled snapshot if the upstream service is unavailable. The interface clearly shows whether data is live or a snapshot.

## Challenges we ran into

### 1. Defensively normalizing real Polymarket data

The Gamma API is public and useful, but production payloads cannot be treated as perfectly typed application data. Fields such as `outcomes` and `outcomePrices` may arrive as stringified JSON. Numeric values may be strings. Optional dates or metadata may be missing, and malformed arrays can have mismatched lengths.

The dashboard therefore never consumes raw Polymarket objects. SignalForge first validates the outer event and market shapes, safely parses stringified arrays, converts only finite numeric values, rejects probabilities outside 0–1, checks that outcome and probability arrays have matching lengths, validates dates, and drops unusable markets instead of crashing the page. The rest of the application receives one normalized internal type.

This adapter boundary was essential: external schema drift becomes a contained data-quality problem instead of a UI failure or, worse, a misleading probability calculation.

### 2. Containing nondeterministic LLM output

Semantic interpretation is exactly where an LLM is useful, but unrestricted model output is unsafe for a logical checker. A model can return malformed JSON, choose an unsupported label, overstate confidence, or infer a relationship from similar titles even when dates and resolution scopes differ.

SignalForge contains that nondeterminism at several layers. The prompt provides full resolution evidence rather than titles alone. The model is limited to a small relationship enum and a strict structured response. Zod rejects malformed or incomplete output. A configurable confidence threshold and explicit scope checks force uncertain cases into **ABSTAIN**. Invalid structured output never reaches the probability engine.

Most importantly, the LLM never performs the pass/fail calculation. After validation, pure TypeScript applies the mathematical constraint. The optional explanation model receives the locked result and cannot change it. If that call fails, deterministic prose preserves the same verdict.

This separation creates a clear trust boundary: AI interprets language, while deterministic code verifies probability.

### 3. Keeping a live demo reliable

A hackathon demo should show real data, but it should not fail because an upstream API times out or a model returns an error. SignalForge uses bounded timeouts and retries, preserves fetched market data when AI analysis fails, exposes retryable user-facing errors, and includes three curated real-market scenarios with labelled snapshots. No fallback is presented as live, and no failed classification is disguised as a result.

## Accomplishments that we're proud of

- A complete one-screen workflow using real public prediction-market data.
- A meaningful AI integration with a narrow, auditable responsibility.
- A deterministic probability engine with explicit PASS, WARNING, and ABSTAIN states.
- Defensive data normalization, structured-output validation, graceful API failure handling, and snapshot fallback.
- Automated tests for the mathematical rules, schema failures, API error mapping, fallback integrity, and rendered behavior.
- A reproducible public repository, architecture diagram, citations, CI, and a sub-three-minute demo.

## What we learned

The most reliable AI systems do not ask the model to own every decision. SignalForge became stronger when the semantic task and the mathematical task were separated. The LLM handles ambiguous language, but deterministic code enforces invariants, and ABSTAIN is treated as a valid safety outcome rather than a failure.

## What's next for SignalForge

The next low-risk extensions would be batch consistency analysis within one event, a small relationship graph, price-history views showing when a warning emerged, and counterfactual consistency bounds. SignalForge will remain an analytical research tool—not a wallet, trading bot, order client, or source of financial advice.

## Built with

Next.js, React, TypeScript, Tailwind CSS, Gemini API, Zod, Vitest, GitHub Actions, the public Polymarket Gamma API, and Sites production hosting.

## Hackathon disclosure

**Core development was completed during Impact Forge Summer 2026.** SignalForge was built as a solo hackathon project.
