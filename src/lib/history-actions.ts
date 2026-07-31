"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { fitChecks } from "@/db/schema";
import { MAX_TITLE_LENGTH } from "@/lib/constants";

export async function deleteFitCheck(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await getDb()
    .delete(fitChecks)
    .where(and(eq(fitChecks.id, id), eq(fitChecks.userId, userId)));

  revalidatePath("/", "layout");
}

export async function clearFitCheckHistory() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await getDb().delete(fitChecks).where(eq(fitChecks.userId, userId));

  revalidatePath("/", "layout");
}

export async function updateFitCheckTitle(id: string, title: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const trimmed = title.trim().slice(0, MAX_TITLE_LENGTH);

  await getDb()
    .update(fitChecks)
    .set({ title: trimmed || null })
    .where(and(eq(fitChecks.id, id), eq(fitChecks.userId, userId)));

  revalidatePath("/", "layout");
}
