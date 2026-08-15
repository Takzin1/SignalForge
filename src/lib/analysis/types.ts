import type { ConstraintResult, SemanticRelationship } from "../logic";

export type AnalyzedMarket = {
  id: string;
  question: string;
  probability: number;
};

export type AnalysisResult = {
  model: string;
  dataSource: "live" | "snapshot";
  capturedAt: string | null;
  relationship: SemanticRelationship;
  constraint: ConstraintResult;
  explanation: string;
  explanationSource: "gemini" | "deterministic_fallback";
  marketA: AnalyzedMarket;
  marketB: AnalyzedMarket;
  analyzedAt: string;
};

export type AnalysisSuccessResponse = {
  ok: true;
  analysis: AnalysisResult;
};

export type AnalysisErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
};

export type AnalyzeResponse = AnalysisSuccessResponse | AnalysisErrorResponse;
