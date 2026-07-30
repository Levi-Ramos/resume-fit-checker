import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { FitReport, Verdict } from "@/lib/types";

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

export function FitReportView({ report }: { report: FitReport }) {
  return (
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
  );
}
