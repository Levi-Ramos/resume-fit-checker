import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { getSavedResume } from "@/lib/profile-actions";
import { ProfileResumeForm } from "@/components/profile-resume-form";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getSavedResume();

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

        <ProfileResumeForm
          initialResume={profile?.resumeText ?? ""}
          initialUpdatedAt={profile?.updatedAt ?? null}
        />
      </div>
    </div>
  );
}
