import { z } from "zod";

import {
  classifyRelationship,
  explainAnalysis,
  featherlessModel,
  FeatherlessServiceError,
} from "@/src/lib/ai";
import type {
  AnalysisErrorResponse,
  AnalysisSuccessResponse,
} from "@/src/lib/analysis/types";
import { evaluateProbabilityConstraint } from "@/src/lib/logic";
import { fetchEventBySlug, PolymarketApiError } from "@/src/lib/polymarket/client";
import { outcomeProbability } from "@/src/lib/polymarket/probability";

const analyzeRequestSchema = z
  .object({
    eventSlug: z.string().trim().min(1).max(240),
    marketAId: z.string().trim().min(1).max(160),
    marketBId: z.string().trim().min(1).max(160),
  })
  .strict()
  .refine((value) => value.marketAId !== value.marketBId, {
    message: "Select two different markets.",
  });

function configuredNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 && value <= 1 ? value : fallback;
}

function errorResponse(
  code: string,
  message: string,
  retryable: boolean,
  status: number,
) {
  const body: AnalysisErrorResponse = {
    ok: false,
    error: { code, message, retryable },
  };
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function deterministicExplanation(
  status: "pass" | "warning" | "abstain",
  expectedConstraint: string,
  gap: number | null,
): string {
  if (status === "abstain") {
    return "SignalForge abstained because the semantic evidence was not strong enough to apply a deterministic probability constraint.";
  }
  if (status === "warning") {
    return `The selected markets violate the expected constraint (${expectedConstraint}) beyond the configured tolerance. The measured constraint gap is ${gap?.toFixed(3) ?? "unavailable"}.`;
  }
  return `The selected probabilities satisfy the expected constraint (${expectedConstraint}) within the configured tolerance.`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "invalid_request",
      "The analysis request was not valid JSON.",
      false,
      400,
    );
  }

  const parsedRequest = analyzeRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return errorResponse(
      "invalid_request",
      parsedRequest.error.issues[0]?.message ?? "Invalid analysis request.",
      false,
      400,
    );
  }

  try {
    const event = await fetchEventBySlug(parsedRequest.data.eventSlug);
    const marketA = event.markets.find(
      (market) => market.id === parsedRequest.data.marketAId,
    );
    const marketB = event.markets.find(
      (market) => market.id === parsedRequest.data.marketBId,
    );

    if (!marketA || !marketB) {
      return errorResponse(
        "market_not_found",
        "One of the selected markets is no longer active.",
        true,
        404,
      );
    }

    const probabilityA = outcomeProbability(marketA, "Yes");
    const probabilityB = outcomeProbability(marketB, "Yes");
    if (probabilityA === null || probabilityB === null) {
      return errorResponse(
        "probability_unavailable",
        "A current Yes probability was unavailable for one selected market.",
        true,
        422,
      );
    }

    const relationship = await classifyRelationship(marketA, marketB, event);
    const constraint = evaluateProbabilityConstraint(
      {
        relationship,
        probabilityA,
        probabilityB,
        marketALabel: marketA.question,
        marketBLabel: marketB.question,
      },
      {
        confidenceThreshold: configuredNumber(
          "SIGNALFORGE_CONFIDENCE_THRESHOLD",
          0.75,
        ),
        tolerance: configuredNumber(
          "SIGNALFORGE_PROBABILITY_TOLERANCE",
          0.03,
        ),
      },
    );

    let explanation = deterministicExplanation(
      constraint.status,
      constraint.expectedConstraint,
      constraint.gap,
    );
    let explanationSource: "featherless" | "deterministic_fallback" =
      "deterministic_fallback";

    try {
      explanation = await explainAnalysis({
        marketA,
        marketB,
        relationship,
        constraint,
      });
      explanationSource = "featherless";
    } catch {
      // The deterministic result remains useful if the optional prose pass fails.
    }

    const response: AnalysisSuccessResponse = {
      ok: true,
      analysis: {
        model: featherlessModel(),
        relationship,
        constraint,
        explanation,
        explanationSource,
        marketA: {
          id: marketA.id,
          question: marketA.question,
          probability: probabilityA,
        },
        marketB: {
          id: marketB.id,
          question: marketB.question,
          probability: probabilityB,
        },
        analyzedAt: new Date().toISOString(),
      },
    };

    return Response.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof FeatherlessServiceError) {
      const status =
        error.code === "rate_limited"
          ? 429
          : error.code === "unauthorized"
            ? 502
            : 503;
      return errorResponse(error.code, error.message, error.retryable, status);
    }
    if (error instanceof PolymarketApiError) {
      return errorResponse("market_data_error", error.message, true, 502);
    }
    return errorResponse(
      "analysis_failed",
      "SignalForge could not complete this analysis.",
      true,
      500,
    );
  }
}
