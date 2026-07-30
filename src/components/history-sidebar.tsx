import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/badge";
import { getDb } from "@/db";
import { fitChecks } from "@/db/schema";
import { scoreColorVar } from "@/components/fit-report";
import { HistorySidebarShell } from "@/components/history-sidebar-shell";
import { HistoryDeleteButton } from "@/components/history-delete-button";
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
            <li key={check.id} className="group/row relative flex items-start gap-1 rounded-lg px-2 py-2 hover:bg-muted">
              <Link href={`/history/${check.id}`} className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-sm" title={jdPreview(check.jdText)}>
                  {jdPreview(check.jdText)}
                </span>
                <span className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="gap-1 font-mono"
                    style={{ color: scoreColorVar(check.score) }}
                  >
                    {Math.round(check.score * 100)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(check.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </span>
              </Link>
              <HistoryDeleteButton id={check.id} />
            </li>
          ))}
        </ul>
      )}
    </HistorySidebarShell>
  );
}
