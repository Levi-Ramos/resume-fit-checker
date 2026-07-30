import { desc, eq } from "drizzle-orm";
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
        <p className="px-2 py-4 text-sm text-muted-foreground">
          Sign in to save and browse your fit-check history.
        </p>
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
        <p className="px-2 py-4 text-sm text-muted-foreground">
          No history yet. Run a check to get started.
        </p>
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
