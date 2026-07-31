"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        An unexpected error stopped this page from loading. Try again, or head back and start a new check.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button render={<Link href="/">Back to Resume Fit Checker</Link>} />
      </div>
    </div>
  );
}
