export type Verdict = "match" | "partial" | "gap";

export type RequirementScore = {
  requirement: { id: string; text: string };
  verdict: Verdict;
  evidenceQuote: string | null;
  rationale: string;
};

export type FitReport = {
  summary: { score: number; matchCount: number; partialCount: number; gapCount: number; total: number };
  results: RequirementScore[];
};
