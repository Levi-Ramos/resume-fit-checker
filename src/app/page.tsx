import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { resumeProfiles } from "@/db/schema";
import { FitCheckForm } from "@/components/fit-check-form";

export default async function Home() {
  const { userId } = await auth();

  let initialResume = "";
  if (userId) {
    try {
      const [profile] = await getDb()
        .select()
        .from(resumeProfiles)
        .where(eq(resumeProfiles.userId, userId))
        .limit(1);
      initialResume = profile?.resumeText ?? "";
    } catch (err) {
      console.error("failed to load saved resume profile:", err);
    }
  }

  return <FitCheckForm initialResume={initialResume} />;
}
