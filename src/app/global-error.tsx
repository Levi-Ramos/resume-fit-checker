"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled global error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="flex min-h-full items-center justify-center bg-background px-6 text-foreground">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-mono text-sm text-muted-foreground">Error</p>
          <h1 className="text-2xl font-semibold tracking-tight">Resume Fit Checker crashed</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Something broke at the top level. Reloading usually fixes it.
          </p>
          <button
            onClick={reset}
            className="mt-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
