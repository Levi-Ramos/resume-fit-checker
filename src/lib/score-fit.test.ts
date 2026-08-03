import { describe, expect, it, vi, beforeEach } from 'vitest';
import { generateText } from 'ai';
import { embedRequirementQueries, retrieveTopK } from './retrieval';
import { scoreAllRequirements } from './score-fit';
import type { JdRequirement } from './parse-jd';
import type { EmbeddedChunk } from './retrieval';

vi.mock('ai', () => ({
  generateText: vi.fn(),
  Output: { object: vi.fn() },
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((model: string) => ({ modelId: model })),
}));

vi.mock('./retrieval', () => ({
  embedRequirementQueries: vi.fn(),
  retrieveTopK: vi.fn(),
}));

const REQS: JdRequirement[] = [
  { id: 'req-0', text: '5+ years Python', category: 'hard' },
  { id: 'req-1', text: 'Team collaboration', category: 'soft' },
];

const CHUNKS: EmbeddedChunk[] = [
  { chunk: { id: 'chunk-0', text: 'Python developer' }, embedding: [1, 0] },
];

beforeEach(() => {
  vi.mocked(embedRequirementQueries).mockResolvedValue([[1, 0], [0, 1]]);
  vi.mocked(retrieveTopK).mockReturnValue([
    { chunk: { id: 'chunk-0', text: 'Python developer' }, score: 0.9 },
  ]);
});

describe('scoreAllRequirements', () => {
  it('maps verdicts from model output by requirementId', async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: {
        results: [
          { requirementId: 'req-0', verdict: 'match', evidenceQuote: 'Python developer', rationale: 'Direct.' },
          { requirementId: 'req-1', verdict: 'gap', evidenceQuote: null, rationale: 'No evidence.' },
        ],
      },
    } as never);

    const result = await scoreAllRequirements(REQS, CHUNKS);

    expect(result[0]).toMatchObject({ requirement: REQS[0], verdict: 'match', evidenceQuote: 'Python developer' });
    expect(result[1]).toMatchObject({ requirement: REQS[1], verdict: 'gap', evidenceQuote: null });
  });

  it('falls back to gap with a default rationale when requirementId is absent from model results', async () => {
    vi.mocked(generateText).mockResolvedValue({ output: { results: [] } } as never);

    const result = await scoreAllRequirements(REQS, CHUNKS);

    expect(result[0].verdict).toBe('gap');
    expect(result[0].rationale).toBe('No verdict returned for this requirement.');
  });

  it('preserves input requirement order regardless of model result order', async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: {
        results: [
          { requirementId: 'req-1', verdict: 'partial', evidenceQuote: null, rationale: 'Adjacent.' },
          { requirementId: 'req-0', verdict: 'match', evidenceQuote: 'Python developer', rationale: 'Direct.' },
        ],
      },
    } as never);

    const result = await scoreAllRequirements(REQS, CHUNKS);

    expect(result[0].requirement.id).toBe('req-0');
    expect(result[1].requirement.id).toBe('req-1');
  });

  it('returns one score per requirement', async () => {
    vi.mocked(generateText).mockResolvedValue({ output: { results: [] } } as never);

    const result = await scoreAllRequirements(REQS, CHUNKS);

    expect(result).toHaveLength(REQS.length);
  });
});
