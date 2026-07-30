import { integer, jsonb, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core';

export const fitChecks = pgTable('fit_checks', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  title: text('title'),
  jdText: text('jd_text').notNull(),
  score: real('score').notNull(),
  matchCount: integer('match_count').notNull(),
  partialCount: integer('partial_count').notNull(),
  gapCount: integer('gap_count').notNull(),
  total: integer('total').notNull(),
  results: jsonb('results').notNull().$type<
    Array<{
      requirement: { id: string; text: string };
      verdict: 'match' | 'partial' | 'gap';
      evidenceQuote: string | null;
      rationale: string;
    }>
  >(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type FitCheck = typeof fitChecks.$inferSelect;
export type NewFitCheck = typeof fitChecks.$inferInsert;

export const resumeProfiles = pgTable('resume_profiles', {
  userId: text('user_id').primaryKey(),
  resumeText: text('resume_text').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ResumeProfile = typeof resumeProfiles.$inferSelect;
export type NewResumeProfile = typeof resumeProfiles.$inferInsert;
