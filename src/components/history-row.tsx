"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { scoreColorVar } from "@/components/fit-report";
import { HistoryDeleteButton } from "@/components/history-delete-button";
import { updateFitCheckTitle } from "@/lib/history-actions";
import { MAX_TITLE_LENGTH } from "@/lib/constants";

export function HistoryRow({
  id,
  title,
  score,
  createdAt,
}: {
  id: string;
  title: string;
  score: number;
  createdAt: Date;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextBlurRef = useRef(false);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit() {
    if (skipNextBlurRef.current) {
      skipNextBlurRef.current = false;
      return;
    }
    const trimmed = value.trim();
    setEditing(false);
    if (!trimmed || trimmed === title) {
      setValue(title);
      return;
    }
    startTransition(async () => {
      try {
        await updateFitCheckTitle(id, trimmed);
      } catch {
        setValue(title);
        setRenameError("Couldn't rename — try again.");
      }
    });
  }

  function cancel() {
    skipNextBlurRef.current = true;
    setValue(title);
    setEditing(false);
  }

  return (
    <li className="group/row relative flex flex-col gap-1 rounded-lg px-2 py-2 hover:bg-muted">
      <div className="flex items-start gap-1">
        {editing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") cancel();
            }}
            disabled={isPending}
            maxLength={MAX_TITLE_LENGTH}
            aria-label="Rename this fit check"
            className="min-w-0 flex-1 rounded-md border border-ring bg-transparent px-1.5 py-0.5 text-sm outline-none ring-3 ring-ring/50 disabled:opacity-50"
          />
        ) : (
          <Link href={`/history/${id}`} className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="truncate text-sm" title={title}>
              {title}
            </span>
            <span className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 font-mono" style={{ color: scoreColorVar(score) }}>
                {Math.round(score * 100)}%
              </Badge>
              <span className="text-xs text-muted-foreground">
                {createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </span>
          </Link>
        )}

        {!editing && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Rename this fit check"
            disabled={isPending}
            className="shrink-0 opacity-0 pointer-coarse:opacity-100 group-hover/row:opacity-100 focus-visible:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              setRenameError(null);
              setEditing(true);
            }}
          >
            <Pencil />
          </Button>
        )}
        {!editing && <HistoryDeleteButton id={id} />}
      </div>
      {renameError && (
        <p className="px-1 text-xs text-destructive" role="alert">
          {renameError}
        </p>
      )}
    </li>
  );
}
