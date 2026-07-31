"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FitReportView } from "@/components/fit-report";
import type { FitReport } from "@/lib/types";
import { MAX_TEXT_LENGTH } from "@/lib/constants";

export function FitCheckForm({ initialResume = "" }: { initialResume?: string }) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [resume, setResume] = useState(initialResume);
  const [jd, setJd] = useState("");
  const [report, setReport] = useState<FitReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (report) reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [report]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setReport(null);

    if (resume.length > MAX_TEXT_LENGTH || jd.length > MAX_TEXT_LENGTH) {
      setError(
        `Resume and job description must each be under ${MAX_TEXT_LENGTH.toLocaleString()} characters — trim the text and try again.`,
      );
      return;
    }

    setLoading(true);

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
      if (isSignedIn) router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12 md:py-16">
        <header className="relative flex flex-col gap-3 overflow-hidden px-4 pt-6 md:pt-8">
          <div className="aurora aurora-a" aria-hidden="true" />
          <div className="aurora aurora-b" aria-hidden="true" />
          <div className="relative z-10 flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Resume <span className="text-primary">Fit Checker</span>
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Paste a resume and a job description. Each requirement is checked via Gemini
              against evidence retrieved from the resume — grounded, cited, and honest
              about gaps instead of inventing a match.
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Check a fit</CardTitle>
            <CardDescription>
              {isSignedIn
                ? "Saved to your history — view past checks anytime."
                : "Nothing is stored unless you sign in first."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="resume">Resume</Label>
                  {isSignedIn && initialResume && resume === initialResume && (
                    <span className="text-xs text-muted-foreground">
                      Auto-filled from your last check
                    </span>
                  )}
                </div>
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
          <div ref={reportRef} className="scroll-mt-6">
            <FitReportView report={report} />
          </div>
        )}
      </div>
    </div>
  );
}
