import { NextResponse } from 'next/server';
import { APICallError, RetryError } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { chunkResume } from '@/lib/chunk';
import { embedResumeChunks } from '@/lib/retrieval';
import { parseJobDescription } from '@/lib/parse-jd';
import { scoreAllRequirements } from '@/lib/score-fit';
import { getDb } from '@/db';
import { fitChecks } from '@/db/schema';
import { MIN_TEXT_LENGTH } from '@/lib/constants';

function friendlyErrorMessage(error: unknown): string {
  const apiError = RetryError.isInstance(error)
    ? error.errors.find((e) => APICallError.isInstance(e))
    : APICallError.isInstance(error)
      ? error
      : undefined;

  if (apiError && APICallError.isInstance(apiError)) {
    if (apiError.statusCode === 429 || apiError.statusCode === 503) {
      return 'The Gemini API is rate-limited or overloaded right now. Please wait a moment and try again.';
    }
    if (apiError.statusCode === 404) {
      return 'The configured Gemini model is unavailable. Check the model ID is still current.';
    }
  }

  return 'Something went wrong while checking fit. Please try again.';
}

export async function POST(request: Request) {
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

    const { userId } = await auth();
    if (userId) {
      await getDb()
        .insert(fitChecks)
        .values({
          userId,
          jdText: jd,
          score,
          matchCount,
          partialCount,
          gapCount,
          total: scores.length,
          results: scores,
        })
        .catch((err) => console.error('failed to save fit-check history:', err));
    }

    return NextResponse.json({
      summary: { score, matchCount, partialCount, gapCount, total: scores.length },
      results: scores,
    });
  } catch (error) {
    console.error('fit-check failed:', error);
    return NextResponse.json({ error: friendlyErrorMessage(error) }, { status: 502 });
  }
}
