import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { fitChecks, resumeProfiles } from '@/db/schema';

// Not a server action: callers must authenticate the userId themselves.
export async function deleteUserData(userId: string) {
  const db = getDb();
  await Promise.all([
    db.delete(fitChecks).where(eq(fitChecks.userId, userId)),
    db.delete(resumeProfiles).where(eq(resumeProfiles.userId, userId)),
  ]);
}
