# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Job seekers self-checking their own resume against a specific job description before applying, to see exactly where they're weak or strong and decide how to tailor their resume or cover letter.

## Product Purpose

Give an honest, evidence-grounded read on how well a resume matches a job description — a per-requirement breakdown (match / partial / gap) backed by retrieved resume evidence, rather than a single opaque confidence score. Success means the user walks away knowing specifically which requirements they meet, partially meet, or don't, and why.

## Positioning

Unlike typical resume-matching tools that ask an LLM to guess an overall fit percentage, this tool decomposes the job description into discrete requirements, retrieves grounded evidence for each one via RAG over chunked resume text, and reports a verdict with citations per requirement — grounded and honest about gaps instead of inventing a match.

## Operating Context

A single page: the user pastes raw resume text and raw job description text into two textareas and submits. The backend chunks/embeds the resume, parses the JD into requirements, scores each requirement against retrieved evidence, and returns a report (overall score plus per-requirement match/partial/gap with citations). Signed-in users (via Clerk) have each check saved and viewable later in the History sidebar; signed-out users get an ephemeral one-off check with nothing stored. Signed-in users can also save a resume to their profile (`/profile`, reachable from the account menu) so it auto-fills the Resume field on every future visit instead of being pasted each time.

## Capabilities and Constraints

- Resume and JD are pasted as plain text (no file upload); both must be at least 50 characters.
- Job description requirements are extracted via Gemini; each is scored independently against embedded resume chunks.
- Overall score = matches + half-credit for partials, over total requirements.
- History (JD text, score, counts, full results) persists to Neon Postgres via Drizzle, scoped to the signed-in user only.
- A signed-in user's saved profile resume is a single text blob (one slot per account, no versioning), persisted separately from history. Saving is always an explicit action — editing the Resume field before a fit check never overwrites the saved profile copy.
- Friendly error messages surface for Gemini rate-limiting/overload (429/503) and model-unavailable (404) cases.
- Open/undecided: no rate limiting observed per user or IP; no resume file upload (PDF/DOCX) support yet.

## Brand Commitments

Name: "Resume Fit Checker." Tagline used in-product: "Gemini · grounded RAG." Interface is forced dark theme (no light/dark toggle currently), Geist Sans/Mono fonts, shadcn component system.

## Evidence on Hand

None. This is a portfolio/learning project with no real customers, testimonials, or case studies — future work must not fabricate any.

## Product Principles

1. Never fabricate a match — every verdict is grounded in retrieved resume evidence; gaps are reported honestly rather than smoothed over.
2. Decompose, don't summarize — evaluate each requirement individually rather than collapsing fit into one guessed score.
3. Nothing persists without consent — only signed-in users get saved history; anonymous checks are ephemeral.
4. Built to demonstrate craft — as a portfolio piece, the RAG pipeline and grounded-scoring architecture are as much the point as end-user polish, so technical legibility matters.
