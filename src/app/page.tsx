import { getSavedResume } from "@/lib/profile-actions";
import { FitCheckForm } from "@/components/fit-check-form";

export default async function Home() {
  const profile = await getSavedResume();

  return <FitCheckForm initialResume={profile?.resumeText ?? ""} hasSavedResume={Boolean(profile)} />;
}
