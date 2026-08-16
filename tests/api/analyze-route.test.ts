import { beforeEach, describe, expect, it, vi } from "vitest";

const ai = vi.hoisted(() => {
  class MockGeminiServiceError extends Error {
    constructor(
      message: string,
      public readonly code: string,
      public readonly retryable: boolean,
      public readonly status?: number,
    ) {
      super(message);
      this.name = "GeminiServiceError";
    }
  }

  return {
    classifyRelationship: vi.fn(),
    explainAnalysis: vi.fn(),
    geminiModel: vi.fn(() => "gemini-3.6-flash"),
    MockGeminiServiceError,
  };
});

vi.mock("@/src/lib/ai", () => ({
  classifyRelationship: ai.classifyRelationship,
  explainAnalysis: ai.explainAnalysis,
  geminiModel: ai.geminiModel,
  GeminiServiceError: ai.MockGeminiServiceError,
}));

import { POST } from "../../app/api/analyze/route";

const relationship = {
  relationship: "mutually_exclusive" as const,
  direction: "symmetric" as const,
  same_resolution_scope: true,
  confidence: 0.95,
  abstain: false,
  reason: "The exact cut counts cannot both occur.",
};

function request(body: unknown): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validRequest = {
  eventSlug: "how-many-fed-rate-cuts-in-2026",
  marketAId: "616902",
  marketBId: "616903",
  dataSource: "snapshot" as const,
};

describe("POST /api/analyze failure boundaries", () => {
  beforeEach(() => {
    ai.classifyRelationship.mockReset();
    ai.explainAnalysis.mockReset();
    ai.geminiModel.mockClear();
  });

  it.each([
    {
      code: "unauthorized",
      retryable: false,
      upstreamStatus: 401,
      responseStatus: 502,
    },
    {
      code: "rate_limited",
      retryable: true,
      upstreamStatus: 429,
      responseStatus: 429,
    },
    {
      code: "upstream",
      retryable: true,
      upstreamStatus: 503,
      responseStatus: 503,
    },
    {
      code: "timeout",
      retryable: true,
      upstreamStatus: undefined,
      responseStatus: 503,
    },
  ])(
    "maps Gemini $code without crashing the route",
    async ({ code, retryable, upstreamStatus, responseStatus }) => {
      ai.classifyRelationship.mockRejectedValueOnce(
        new ai.MockGeminiServiceError(
          `Simulated ${code} failure.`,
          code,
          retryable,
          upstreamStatus,
        ),
      );

      const response = await POST(request(validRequest));
      const body = await response.json();

      expect(response.status).toBe(responseStatus);
      expect(body).toEqual({
        ok: false,
        error: {
          code,
          message: `Simulated ${code} failure.`,
          retryable,
        },
      });
    },
  );

  it("keeps the locked verdict when the explanation model fails", async () => {
    ai.classifyRelationship.mockResolvedValueOnce(relationship);
    ai.explainAnalysis.mockRejectedValueOnce(
      new ai.MockGeminiServiceError(
        "Malformed explanation.",
        "invalid_response",
        true,
      ),
    );

    const response = await POST(request(validRequest));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.analysis.constraint.status).toBe("pass");
    expect(body.analysis.explanationSource).toBe("deterministic_fallback");
    expect(body.analysis.explanation).toContain("satisfy the expected constraint");
  });
});
