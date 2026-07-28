"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CircleAlert, CircleCheck, CircleX, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Verdict = "match" | "partial" | "gap";

type RequirementScore = {
  requirement: { id: string; text: string };
  verdict: Verdict;
  evidenceQuote: string | null;
  rationale: string;
};

type FitReport = {
  summary: { score: number; matchCount: number; partialCount: number; gapCount: number; total: number };
  results: RequirementScore[];
};

const VERDICT_META: Record<
  Verdict,
  { label: string; icon: typeof CircleCheck; colorVar: string }
> = {
  match: { label: "Match", icon: CircleCheck, colorVar: "var(--status-good)" },
  partial: { label: "Partial", icon: CircleAlert, colorVar: "var(--status-warning)" },
  gap: { label: "Gap", icon: CircleX, colorVar: "var(--status-critical)" },
};

function scoreColorVar(score: number) {
  if (score >= 0.7) return "var(--status-good)";
  if (score >= 0.4) return "var(--status-warning)";
  return "var(--status-critical)";
}

export default function Home() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [report, setReport] = useState<FitReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/fit-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jd }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      setReport(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12 md:py-16">
        <header className="relative flex flex-col gap-3 overflow-hidden">
          <div className="aurora aurora-a" aria-hidden="true" />
          <div className="aurora aurora-b" aria-hidden="true" />
          <div className="relative z-10 flex flex-col gap-3">
            <span className="flex w-fit items-center gap-2 font-mono text-xs tracking-wide text-primary">
              <span className="kicker-pulse" aria-hidden="true" />
              <Sparkles className="size-3.5" />
              Gemini · grounded RAG
            </span>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Resume{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Fit Checker
              </span>
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Paste a resume and a job description. Each requirement is checked against
              evidence retrieved from the resume — grounded, cited, and honest about gaps
              instead of inventing a match.
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Check a fit</CardTitle>
            <CardDescription>Nothing is stored — this runs once per request.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="resume">Resume</Label>
                <Textarea
                  id="resume"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  required
                  placeholder="Paste resume text..."
                  className="h-56 field-sizing-fixed resize-none font-mono text-sm md:h-80"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="jd">Job description</Label>
                <Textarea
                  id="jd"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  required
                  placeholder="Paste job description text..."
                  className="h-56 field-sizing-fixed resize-none font-mono text-sm md:h-80"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="gap-2 font-mono">
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "Checking fit..." : "Check fit"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {report && (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall fit</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span
                    className="font-mono text-5xl font-semibold tabular-nums"
                    style={{ color: scoreColorVar(report.summary.score) }}
                  >
                    {Math.round(report.summary.score * 100)}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {report.summary.total} requirements checked
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: `color-mix(in oklch, ${scoreColorVar(report.summary.score)} 18%, transparent)` }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round(report.summary.score * 100)}%`,
                      backgroundColor: scoreColorVar(report.summary.score),
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["match", report.summary.matchCount],
                      ["partial", report.summary.partialCount],
                      ["gap", report.summary.gapCount],
                    ] as const
                  ).map(([verdict, count]) => {
                    const meta = VERDICT_META[verdict];
                    const Icon = meta.icon;
                    return (
                      <Badge key={verdict} variant="outline" className="gap-1.5 font-mono">
                        <Icon className="size-3.5" style={{ color: meta.colorVar }} />
                        {count} {meta.label}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirement breakdown</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col">
                {report.results.map((item, i) => {
                  const meta = VERDICT_META[item.verdict];
                  const Icon = meta.icon;
                  return (
                    <div key={item.requirement.id}>
                      {i > 0 && <Separator className="my-4" />}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium">{item.requirement.text}</p>
                          <Badge variant="outline" className="shrink-0 gap-1.5 font-mono">
                            <Icon className="size-3.5" style={{ color: meta.colorVar }} />
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.rationale}</p>
                        {item.evidenceQuote && (
                          <p className="border-l-2 border-muted-foreground/30 pl-3 text-sm italic text-muted-foreground">
                            &ldquo;{item.evidenceQuote}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
