"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Info, Loader2, PencilLine, Plus, Upload, X } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { FitReportView } from "@/components/fit-report";
import type { FitReport } from "@/lib/types";
import { MAX_RESUME_FILE_BYTES, MAX_TEXT_LENGTH } from "@/lib/constants";

const CHECK_STEPS = [
  "Parsing resume",
  "Extracting requirements",
  "Retrieving evidence",
  "Scoring overall fit",
];

// ponytail: step timing is a fixed cosmetic schedule, not real backend progress —
// the API is a single request/response with no intermediate events. Upgrade to
// real progress if/when fit-check streams status.
function CheckingProgress({ step }: { step: number }) {
  const pct = ((step + 1) / CHECK_STEPS.length) * 100;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-20">
      <div className="h-0.5 w-full max-w-sm overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <span className="font-mono text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Checking fit
        </span>
        <ul className="flex flex-col gap-3.5">
          {CHECK_STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              {i < step ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3" />
                </span>
              ) : i === step ? (
                <span className="size-5 shrink-0 rounded-full border-2 border-primary" />
              ) : (
                <span className="size-5 shrink-0 rounded-full border border-border" />
              )}
              <span className={`text-sm ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function FitCheckForm({ initialResume = "" }: { initialResume?: string }) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [resume, setResume] = useState(initialResume);
  const [jd, setJd] = useState("");
  const [consented, setConsented] = useState(false);
  const [report, setReport] = useState<FitReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStep, setCheckingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showEvidenceHint, setShowEvidenceHint] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractWarning, setExtractWarning] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!localStorage.getItem("rfc:hint:evidence")) setShowEvidenceHint(true);
  }, []);

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
    setCheckingStep(0);
    const stepTimers = [
      setTimeout(() => setCheckingStep(1), 700),
      setTimeout(() => setCheckingStep(2), 1900),
      setTimeout(() => setCheckingStep(3), 3600),
    ];

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
      stepTimers.forEach(clearTimeout);
      setLoading(false);
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setExtractError(null);
    setExtractWarning(null);

    if (!consented) {
      setExtractError("Tick the consent box below before uploading — the PDF is sent to Google Gemini.");
      return;
    }

    if (file.type !== "application/pdf") {
      setExtractError("Only PDF files are supported.");
      return;
    }
    if (file.size > MAX_RESUME_FILE_BYTES) {
      setExtractError(`File is too large — must be under ${MAX_RESUME_FILE_BYTES / (1024 * 1024)}MB.`);
      return;
    }

    setExtracting(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/extract-resume", { method: "POST", body: formData });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      setResume(body.text ?? "");
      if (body.warning) setExtractWarning(body.warning);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Something went wrong extracting that PDF.");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-1 flex-col gap-10 px-6 py-12 md:px-14 md:py-16">
        {loading ? (
          <CheckingProgress step={checkingStep} />
        ) : report ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border px-4 py-3">
            <p className="min-w-0 truncate font-mono text-xs text-muted-foreground">
              {jd.trimStart().slice(0, 80)}{jd.trimStart().length > 80 ? "…" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 font-mono"
                onClick={() => {
                  setError(null);
                  setReport(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <PencilLine className="size-3.5" />
                Edit JD
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-1.5 font-mono"
                onClick={() => {
                  setJd("");
                  setError(null);
                  setReport(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Plus className="size-3.5" />
                New JD
              </Button>
            </div>
          </div>
        ) : (
          <>
            <header className="flex flex-col gap-8 md:flex-row md:items-center md:gap-14 md:pt-6">
              <div className="flex flex-col gap-4 md:w-2/5">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Check how well your <span className="text-primary">resume fits</span> the job.
                </h1>
                <p className="text-muted-foreground">
                  Each requirement is checked against evidence retrieved from your resume —
                  grounded, cited, and honest about gaps instead of inventing a match.
                </p>
              </div>

              <Card className="flex-1 [--card-spacing:1.75rem]">
                <form onSubmit={handleSubmit}>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="resume">Resume</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={extracting}
                        className="hidden"
                      />
                      {isSignedIn ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 font-mono"
                          disabled={extracting}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {extracting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Upload className="size-3.5" />
                          )}
                          {extracting ? "Extracting..." : "Upload PDF"}
                        </Button>
                      ) : (
                        <SignInButton mode="modal">
                          <Button type="button" variant="outline" size="sm" className="gap-1.5 font-mono">
                            <Upload className="size-3.5" />
                            Sign in to upload PDF
                          </Button>
                        </SignInButton>
                      )}
                    </div>
                    {isSignedIn && initialResume && resume === initialResume && (
                      <span className="-mt-2 text-xs text-muted-foreground">
                        Auto-filled from your last check
                      </span>
                    )}
                    {extractWarning && (
                      <Alert>
                        <Info className="size-4" />
                        <AlertDescription>{extractWarning}</AlertDescription>
                      </Alert>
                    )}
                    {extractError && (
                      <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertDescription>{extractError}</AlertDescription>
                      </Alert>
                    )}
                    <Textarea
                      id="resume"
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      required
                      placeholder="Paste resume text..."
                      className="h-32 field-sizing-fixed resize-none font-mono text-sm"
                    />
                    <Label htmlFor="jd">Job description</Label>
                    <Textarea
                      id="jd"
                      value={jd}
                      onChange={(e) => setJd(e.target.value)}
                      required
                      placeholder="Paste job description text..."
                      className="h-32 field-sizing-fixed resize-none font-mono text-sm"
                    />
                    <label className="flex items-start gap-2.5 text-xs leading-snug text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={consented}
                        onChange={(e) => setConsented(e.target.checked)}
                        required
                        className="mt-0.5 size-3.5 shrink-0 accent-primary"
                      />
                      <span>
                        I agree my resume is sent to Google Gemini for analysis. Google may use it to improve
                        its products, and its reviewers may read it. Emails, phone numbers, and links are
                        removed from the text first, but uploaded PDFs are sent as-is.
                      </span>
                    </label>
                    <Button type="submit" className="mt-1 w-full gap-2 font-mono">
                      Check fit
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      {isSignedIn
                        ? "Saved to your history — view past checks anytime."
                        : "Nothing is stored unless you sign in first."}
                    </p>
                  </CardContent>
                </form>
              </Card>
            </header>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        )}

        {report && (
          <div ref={reportRef} className="scroll-mt-6 flex flex-col gap-6">
            {showEvidenceHint && (
              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  Expand <strong className="font-medium text-foreground">View evidence</strong> under any requirement to see the resume passage that grounded the verdict.
                </AlertDescription>
                <AlertAction>
                  <button
                    type="button"
                    aria-label="Dismiss tip"
                    onClick={() => {
                      localStorage.setItem("rfc:hint:evidence", "1");
                      setShowEvidenceHint(false);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </AlertAction>
              </Alert>
            )}
            <FitReportView report={report} />
          </div>
        )}
      </div>
    </div>
  );
}
