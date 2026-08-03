import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { chunkResume } from '@/lib/chunk';
import { embedResumeChunks } from '@/lib/retrieval';
import { parseJobDescription } from '@/lib/parse-jd';
import { scoreAllRequirements } from '@/lib/score-fit';
import { getDb } from '@/db';
import { fitChecks, resumeProfiles } from '@/db/schema';
import { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from '@/lib/constants';
import { friendlyErrorMessage } from '@/lib/gemini-errors';
import { fitCheckLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const { success, reset } = await fitCheckLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests — please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) } },
    );
  }

  const body = await request.json().catch(() => null);
  const resume = typeof body?.resume === 'string' ? body.resume.trim() : '';
  const jd = typeof body?.jd === 'string' ? body.jd.trim() : '';

  if (!resume || !jd) {
    return NextResponse.json({ error: 'Both resume and job description are required.' }, { status: 400 });
  }
  if (resume.length < MIN_TEXT_LENGTH || jd.length < MIN_TEXT_LENGTH) {
    return NextResponse.json(
      { error: 'Resume and job description both need to be more than a few words — paste the full text.' },
      { status: 400 },
    );
  }
  if (resume.length > MAX_TEXT_LENGTH || jd.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      {
        error: `Resume and job description must each be under ${MAX_TEXT_LENGTH.toLocaleString()} characters — trim the text and try again.`,
      },
      { status: 400 },
    );
  }

  try {
    const chunks = chunkResume(resume);
    const [embeddedChunks, requirements] = await Promise.all([
      embedResumeChunks(chunks),
      parseJobDescription(jd),
    ]);

    if (requirements.length === 0) {
      return NextResponse.json(
        { error: "Couldn't extract any requirements from that job description — try pasting the full text." },
        { status: 400 },
      );
    }

    const scores = await scoreAllRequirements(requirements, embeddedChunks);

    const matchCount = scores.filter((s) => s.verdict === 'match').length;
    const partialCount = scores.filter((s) => s.verdict === 'partial').length;
    const gapCount = scores.filter((s) => s.verdict === 'gap').length;
    const score = (matchCount + partialCount * 0.5) / scores.length;

    const hardScores = scores.filter((s) => s.requirement.category === 'hard');
    const softScores = scores.filter((s) => s.requirement.category === 'soft');

    function categorySummary(subset: typeof scores) {
      if (subset.length === 0) return null;
      const m = subset.filter((s) => s.verdict === 'match').length;
      const p = subset.filter((s) => s.verdict === 'partial').length;
      const g = subset.filter((s) => s.verdict === 'gap').length;
      return { score: (m + p * 0.5) / subset.length, matchCount: m, partialCount: p, gapCount: g, total: subset.length };
    }

    const hard = categorySummary(hardScores);
    const soft = categorySummary(softScores);

    const { userId } = await auth();
    if (userId) {
      const db = getDb();
      await Promise.all([
        db
          .insert(fitChecks)
          .values({
            userId,
            jdText: jd,
            score,
            matchCount,
            partialCount,
            gapCount,
            total: scores.length,
            ...(hard && {
              hardScore: hard.score,
              hardMatchCount: hard.matchCount,
              hardPartialCount: hard.partialCount,
              hardGapCount: hard.gapCount,
              hardTotal: hard.total,
            }),
            ...(soft && {
              softScore: soft.score,
              softMatchCount: soft.matchCount,
              softPartialCount: soft.partialCount,
              softGapCount: soft.gapCount,
              softTotal: soft.total,
            }),
            results: scores,
          })
          .catch((err) => console.error('failed to save fit-check history:', err)),
        db
          .insert(resumeProfiles)
          .values({ userId, resumeText: resume })
          .onConflictDoUpdate({
            target: resumeProfiles.userId,
            set: { resumeText: resume, updatedAt: new Date() },
          })
          .catch((err) => console.error('failed to save resume to profile:', err)),
      ]);
    }

    return NextResponse.json({
      summary: { score, matchCount, partialCount, gapCount, total: scores.length, hard, soft },
      results: scores,
    });
  } catch (error) {
    console.error('fit-check failed:', error);
    return NextResponse.json({ error: friendlyErrorMessage(error) }, { status: 502 });
  }
}
