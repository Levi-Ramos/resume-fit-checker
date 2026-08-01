"use client";

import { useState } from "react";
import { ChevronRight, CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CategorySummary, FitReport, Verdict } from "@/lib/types";

export const VERDICT_META: Record<
  Verdict,
  { label: string; icon: typeof CircleCheck; colorVar: string }
> = {
  match: { label: "Match", icon: CircleCheck, colorVar: "var(--status-good)" },
  partial: { label: "Partial", icon: CircleAlert, colorVar: "var(--status-warning)" },
  gap: { label: "Gap", icon: CircleX, colorVar: "var(--status-critical)" },
};

export function scoreColorVar(score: number) {
  if (score >= 0.7) return "var(--status-good)";
  if (score >= 0.4) return "var(--status-warning)";
  return "var(--status-critical)";
}

const VERDICT_ORDER: Record<Verdict, number> = { gap: 0, partial: 1, match: 2 };

function CategoryBar({ label, summary }: { label: string; summary: CategorySummary }) {
  const color = scoreColorVar(summary.score);
  const pct = Math.round(summary.score * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-xs font-medium tracking-wide text-muted-foreground">{label}</span>
        <span className="font-mono text-sm font-semibold tabular-nums" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: `color-mix(in oklch, ${color} 18%, transparent)` }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex gap-2">
        {([["match", summary.matchCount], ["partial", summary.partialCount], ["gap", summary.gapCount]] as const).map(
          ([verdict, count]) => {
            const meta = VERDICT_META[verdict];
            const Icon = meta.icon;
            return (
              <Badge key={verdict} variant="outline" className="gap-1 px-2 py-0.5 font-mono text-xs">
                <Icon aria-hidden="true" className="size-3" style={{ color: meta.colorVar }} />
                {count}
              </Badge>
            );
          },
        )}
      </div>
    </div>
  );
}

export function FitReportView({ report }: { report: FitReport }) {
  const [filter, setFilter] = useState<Verdict | null>(null);
  const { hard, soft } = report.summary;
  const pct = Math.round(report.summary.score * 100);
  const color = scoreColorVar(report.summary.score);

  const sorted = [...report.results].sort(
    (a, b) => VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict],
  );
  const visible = filter ? sorted.filter((r) => r.verdict === filter) : sorted;

  const tabs: { key: Verdict | null; label: string; count: number }[] = [
    { key: null, label: "All", count: report.summary.total },
    { key: "gap", label: "Gaps", count: report.summary.gapCount },
    { key: "partial", label: "Partial", count: report.summary.partialCount },
    { key: "match", label: "Matches", count: report.summary.matchCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall fit</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-mono text-5xl font-semibold tabular-nums" style={{ color }}>
              {pct}%
            </span>
            <span className="text-sm text-muted-foreground">
              {report.summary.total} requirements checked
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Overall fit score"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: `color-mix(in oklch, ${color} 18%, transparent)` }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: color }}
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
                  <Icon aria-hidden="true" className="size-3.5" style={{ color: meta.colorVar }} />
                  {count} {meta.label}
                </Badge>
              );
            })}
          </div>
          {(hard || soft) && (
            <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
              {hard && <CategoryBar label="Hard skills" summary={hard} />}
              {soft && <CategoryBar label="Soft skills" summary={soft} />}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Requirement breakdown</CardTitle>
          <div role="tablist" aria-label="Filter requirements by verdict" className="flex gap-1">
            {tabs.map(({ key, label, count }) => (
              <button
                key={String(key)}
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={[
                  "rounded-md px-2.5 py-1 font-mono text-xs tabular-nums transition-colors",
                  filter === key
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {label}{" "}
                <span className="opacity-60">{count}</span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col">
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requirements in this category.</p>
          ) : (
            <ul className="flex flex-col">
              {visible.map((item, i) => {
                const meta = VERDICT_META[item.verdict];
                const Icon = meta.icon;
                return (
                  <li key={item.requirement.id} className="list-none">
                    {i > 0 && <Separator className="my-4" />}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-col gap-1">
                          <p className="break-words font-medium">{item.requirement.text}</p>
                          {item.requirement.category && (
                            <span className="text-xs text-muted-foreground">
                              {item.requirement.category === "hard" ? "Hard skill" : "Soft skill"}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0 gap-1.5 font-mono">
                          <Icon aria-hidden="true" className="size-3.5" style={{ color: meta.colorVar }} />
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="break-words text-sm text-muted-foreground">{item.rationale}</p>
                      {item.evidenceQuote && (
                        <details className="group">
                          <summary className="flex cursor-pointer list-none select-none items-center gap-1 text-xs text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                            <ChevronRight
                              aria-hidden="true"
                              className="size-3 transition-transform group-open:rotate-90"
                            />
                            View evidence
                          </summary>
                          <blockquote className="mt-1.5 break-words border-l-2 border-muted-foreground/30 pl-3 text-sm italic text-muted-foreground">
                            &ldquo;{item.evidenceQuote}&rdquo;
                          </blockquote>
                        </details>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
