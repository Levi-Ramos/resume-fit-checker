// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { auth } from '@clerk/nextjs/server';
import { parseJobDescription } from '@/lib/parse-jd';
import { scoreAllRequirements } from '@/lib/score-fit';
import { POST } from './route';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/chunk', () => ({
  chunkResume: vi.fn(() => [{ id: 'chunk-0', text: 'some experience' }]),
}));

vi.mock('@/lib/retrieval', () => ({
  embedResumeChunks: vi.fn(() =>
    Promise.resolve([{ chunk: { id: 'chunk-0', text: 'some experience' }, embedding: [1] }]),
  ),
}));

vi.mock('@/lib/parse-jd', () => ({
  parseJobDescription: vi.fn(),
}));

vi.mock('@/lib/score-fit', () => ({
  scoreAllRequirements: vi.fn(),
}));

vi.mock('@/db/schema', () => ({
  fitChecks: {},
  resumeProfiles: {},
}));

vi.mock('@/db', () => ({
  getDb: () => ({
    insert: () => ({
      values: () => ({
        catch: () => Promise.resolve(),
        onConflictDoUpdate: () => ({ catch: () => Promise.resolve() }),
      }),
    }),
  }),
}));

vi.mock('@/lib/gemini-errors', () => ({
  friendlyErrorMessage: vi.fn(() => 'Something went wrong while checking fit. Please try again.'),
}));

const mockLimit = vi.fn(() => Promise.resolve({ success: true, limit: 10, remaining: 9, reset: Date.now() + 60_000 }));
vi.mock('@/lib/rate-limit', () => ({
  fitCheckLimiter: { limit: (...args: unknown[]) => mockLimit(...args) },
}));

const RESUME = 'A'.repeat(100);
const JD = 'B'.repeat(100);

const SCORES = [
  {
    requirement: { id: 'req-0', text: '5+ years Python', category: 'hard' as const },
    verdict: 'match' as const,
    evidenceQuote: 'Python developer',
    rationale: 'Direct.',
  },
];

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/fit-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(auth).mockResolvedValue({ userId: null } as never);
  vi.mocked(parseJobDescription).mockResolvedValue([
    { id: 'req-0', text: '5+ years Python', category: 'hard' },
  ]);
  vi.mocked(scoreAllRequirements).mockResolvedValue(SCORES);
  mockLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() + 60_000 });
});

describe('POST /api/fit-check', () => {
  it('returns 400 when resume or jd is missing', async () => {
    const res = await POST(makeRequest({ resume: RESUME }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/required/);
  });

  it('returns 400 when inputs are too short', async () => {
    const res = await POST(makeRequest({ resume: 'short', jd: 'short' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when inputs exceed max length', async () => {
    const res = await POST(makeRequest({ resume: 'A'.repeat(20_001), jd: JD }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/characters/);
  });

  it('returns 400 when JD yields no requirements', async () => {
    vi.mocked(parseJobDescription).mockResolvedValue([]);

    const res = await POST(makeRequest({ resume: RESUME, jd: JD }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/requirements/);
  });

  it('returns 200 with summary and results for a valid request (signed out)', async () => {
    const res = await POST(makeRequest({ resume: RESUME, jd: JD }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.summary).toMatchObject({
      matchCount: 1,
      partialCount: 0,
      gapCount: 0,
      total: 1,
    });
    expect(body.results).toHaveLength(1);
  });

  it('returns 200 and includes category summaries when signed in', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as never);

    const res = await POST(makeRequest({ resume: RESUME, jd: JD }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.summary.hard).not.toBeNull();
  });

  it('returns 502 when an AI call throws', async () => {
    vi.mocked(parseJobDescription).mockRejectedValue(new Error('API down'));

    const res = await POST(makeRequest({ resume: RESUME, jd: JD }));

    expect(res.status).toBe(502);
  });

  it('returns 429 when rate limit is exceeded', async () => {
    mockLimit.mockResolvedValue({ success: false, limit: 10, remaining: 0, reset: Date.now() + 30_000 });

    const res = await POST(makeRequest({ resume: RESUME, jd: JD }));

    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });
});
