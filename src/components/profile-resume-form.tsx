"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { saveResume, clearSavedResume } from "@/lib/profile-actions";

function formatUpdatedAt(date: Date) {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ProfileResumeForm({
  initialResume,
  initialUpdatedAt,
}: {
  initialResume: string;
  initialUpdatedAt: Date | null;
}) {
  const [resume, setResume] = useState(initialResume);
  const [savedResume, setSavedResume] = useState(initialResume);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [error, setError] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [isClearing, startClearing] = useTransition();

  const isDirty = resume.trim() !== savedResume.trim();

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await saveResume(resume);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setResume(result.resumeText);
      setSavedResume(result.resumeText);
      setUpdatedAt(result.updatedAt);
    });
  }

  function handleClear() {
    startClearing(async () => {
      await clearSavedResume();
      setResume("");
      setSavedResume("");
      setUpdatedAt(null);
      setClearOpen(false);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your resume</CardTitle>
        <CardDescription>
          {updatedAt
            ? `Saved ${formatUpdatedAt(updatedAt)} — reused automatically on every fit check.`
            : "Save it once, and it'll be ready to go on every fit check."}
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="profile-resume">Resume text</Label>
          <Textarea
            id="profile-resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste resume text..."
            className="h-72 field-sizing-fixed resize-none font-mono text-sm md:h-96"
          />
          {isDirty && <p className="text-xs text-muted-foreground">Unsaved changes.</p>}
        </CardContent>

        {error && (
          <CardContent className="pt-0">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        <CardFooter className="items-center gap-3">
          {savedResume && (
            <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
              <AlertDialogTrigger
                render={
                  <Button type="button" variant="destructive" disabled={isClearing} className="gap-2">
                    <Trash2 />
                    Clear
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear saved resume?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the resume from your profile. It won&apos;t auto-fill on future
                    fit checks until you save it again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" disabled={isClearing} onClick={handleClear}>
                    {isClearing ? "Clearing..." : "Clear"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button type="submit" disabled={isSaving || !isDirty} className="ml-auto gap-2 font-mono">
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
