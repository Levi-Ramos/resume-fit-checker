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
  // per-category breakdowns — null on rows created before this feature shipped
  hardScore: real('hard_score'),
  hardMatchCount: integer('hard_match_count'),
  hardPartialCount: integer('hard_partial_count'),
  hardGapCount: integer('hard_gap_count'),
  hardTotal: integer('hard_total'),
  softScore: real('soft_score'),
  softMatchCount: integer('soft_match_count'),
  softPartialCount: integer('soft_partial_count'),
  softGapCount: integer('soft_gap_count'),
  softTotal: integer('soft_total'),
  results: jsonb('results').notNull().$type<
    Array<{
      requirement: { id: string; text: string; category?: 'hard' | 'soft' };
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
