export type Verdict = "match" | "partial" | "gap";

export type SkillCategory = "hard" | "soft";

export type RequirementScore = {
  requirement: { id: string; text: string; category?: SkillCategory };
  verdict: Verdict;
  evidenceQuote: string | null;
  rationale: string;
};

export type CategorySummary = {
  score: number;
  matchCount: number;
  partialCount: number;
  gapCount: number;
  total: number;
};

export type FitReport = {
  summary: {
    score: number;
    matchCount: number;
    partialCount: number;
    gapCount: number;
    total: number;
    hard?: CategorySummary;
    soft?: CategorySummary;
  };
  results: RequirementScore[];
};
