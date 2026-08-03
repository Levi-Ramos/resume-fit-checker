# TODOS

## Testing

### Backfill tests for pre-existing untested code

**What:** Write tests for `chunkResume` (`src/lib/chunk.ts`), `parseJobDescription` (`src/lib/parse-jd.ts`), `scoreAllRequirements` (`src/lib/score-fit.ts`), and `POST /api/fit-check` (`src/app/api/fit-check/route.ts`).

**Why:** Vitest lands with the resume-upload PR (`/plan-eng-review`, 2026-08-02) but is scoped only to that feature's new code. These four are the core grounding/scoring functions — the same class of risk the upload review flagged for new extraction code, just pre-existing and currently untested.

**Context:** No test infra existed anywhere in this repo before the upload PR. Once Vitest is set up, extending coverage to these files is mostly plumbing (framework already configured) rather than new setup work. Start with `chunkResume` — pure function, no I/O, easiest to cover first.

**Effort:** M
**Priority:** P2
**Depends on:** Vitest setup (landing in the resume-upload PR)

## Infrastructure

### Rate limiting for AI-calling endpoints

**What:** Add rate limiting (per-IP and/or per-user) to `/api/fit-check` and `/api/extract-resume`.

**Why:** PRODUCT.md already flags "no rate limiting observed per user or IP" as an open gap. The resume-upload eng review (2026-08-02) gated `/api/extract-resume` behind auth, but a signed-in user still has no call limit, and `/api/fit-check` stays fully anonymous — both are direct, unlimited paths to paid Gemini calls.

**Context:** This predates the upload feature; it became concrete when adding a second AI-calling route made the gap obvious. Needs a mechanism decision (per-IP vs per-user, in-app vs Vercel-native) before implementation — this is real design work, not a quick add-on.

**Effort:** M
**Priority:** P2
**Depends on:** None
