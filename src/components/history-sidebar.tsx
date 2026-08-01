import { desc, eq } from "drizzle-orm";
import { FileText, LogIn } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { fitChecks } from "@/db/schema";
import { HistorySidebarShell } from "@/components/history-sidebar-shell";
import { HistoryRow } from "@/components/history-row";
import { HistoryClearButton } from "@/components/history-clear-button";

function jdPreview(jdText: string) {
  const firstLine = jdText.split("\n").find((line) => line.trim().length > 0) ?? jdText;
  return firstLine.length > 60 ? `${firstLine.slice(0, 60)}...` : firstLine;
}

export async function HistorySidebar() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <HistorySidebarShell>
        <div className="flex flex-col gap-3 px-2 py-4">
          <LogIn className="size-4 text-muted-foreground/50" />
          <p className="text-sm leading-snug text-muted-foreground">
            Sign in to save every check — scores, requirement breakdowns, and evidence citations from your resume.
          </p>
        </div>
      </HistorySidebarShell>
    );
  }

  const checks = await getDb()
    .select()
    .from(fitChecks)
    .where(eq(fitChecks.userId, userId))
    .orderBy(desc(fitChecks.createdAt))
    .limit(50);

  return (
    <HistorySidebarShell headerAction={checks.length > 0 ? <HistoryClearButton /> : undefined}>
      {checks.length === 0 ? (
        <div className="flex flex-col gap-3 px-2 py-4">
          <FileText className="size-4 text-muted-foreground/50" />
          <p className="text-sm leading-snug text-muted-foreground">
            Run a check to see your first result here — full breakdown with grounded evidence.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {checks.map((check) => (
            <HistoryRow
              key={check.id}
              id={check.id}
              title={check.title?.trim() || jdPreview(check.jdText)}
              score={check.score}
              createdAt={check.createdAt}
            />
          ))}
        </ul>
      )}
    </HistorySidebarShell>
  );
}
