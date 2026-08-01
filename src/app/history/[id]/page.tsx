import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/db";
import { fitChecks } from "@/db/schema";
import { FitReportView } from "@/components/fit-report";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [check] = await getDb()
    .select()
    .from(fitChecks)
    .where(and(eq(fitChecks.id, id), eq(fitChecks.userId, userId)))
    .limit(1);

  if (!check) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12 md:py-16">
        <Link
          href="/"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Job description</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words font-mono text-sm text-muted-foreground">
              {check.jdText}
            </pre>
          </CardContent>
        </Card>

        <FitReportView
          report={{
            summary: {
              score: check.score,
              matchCount: check.matchCount,
              partialCount: check.partialCount,
              gapCount: check.gapCount,
              total: check.total,
              hard: check.hardTotal != null ? {
                score: check.hardScore!,
                matchCount: check.hardMatchCount!,
                partialCount: check.hardPartialCount!,
                gapCount: check.hardGapCount!,
                total: check.hardTotal,
              } : undefined,
              soft: check.softTotal != null ? {
                score: check.softScore!,
                matchCount: check.softMatchCount!,
                partialCount: check.softPartialCount!,
                gapCount: check.softGapCount!,
                total: check.softTotal,
              } : undefined,
            },
            results: check.results,
          }}
        />
      </div>
    </div>
  );
}
