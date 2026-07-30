"use server";

import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { resumeProfiles } from "@/db/schema";
import { MIN_TEXT_LENGTH } from "@/lib/constants";

export async function getSavedResume() {
  const { userId } = await auth();
  if (!userId) return null;

  const [profile] = await getDb()
    .select()
    .from(resumeProfiles)
    .where(eq(resumeProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

type SaveResumeResult =
  | { ok: false; error: string }
  | { ok: true; resumeText: string; updatedAt: Date };

export async function saveResume(resumeText: string): Promise<SaveResumeResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const trimmed = resumeText.trim();
  if (trimmed.length < MIN_TEXT_LENGTH) {
    return { ok: false, error: "Resume needs to be more than a few words — paste the full text." };
  }

  const [row] = await getDb()
    .insert(resumeProfiles)
    .values({ userId, resumeText: trimmed })
    .onConflictDoUpdate({
      target: resumeProfiles.userId,
      set: { resumeText: trimmed, updatedAt: new Date() },
    })
    .returning();

  revalidatePath("/profile");
  revalidatePath("/");
  return { ok: true, resumeText: row.resumeText, updatedAt: row.updatedAt };
}

export async function clearSavedResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await getDb().delete(resumeProfiles).where(eq(resumeProfiles.userId, userId));

  revalidatePath("/profile");
  revalidatePath("/");
}
