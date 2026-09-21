import { describe, expect, it, vi } from 'vitest';
import { generateText } from 'ai';
import { parseJobDescription } from './parse-jd';

vi.mock('ai', () => ({
  generateText: vi.fn(),
  Output: { object: vi.fn() },
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((model: string) => ({ modelId: model })),
}));

describe('parseJobDescription', () => {
  it('returns requirements with sequential req-N ids and jd meta', async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: {
        company: 'Acme',
        role: 'Backend Engineer',
        requirements: [
          { text: '5+ years Python', category: 'hard' },
          { text: 'Team collaboration', category: 'soft' },
        ],
      },
    } as never);

    const result = await parseJobDescription('some jd text');

    expect(result.requirements).toEqual([
      { id: 'req-0', text: '5+ years Python', category: 'hard' },
      { id: 'req-1', text: 'Team collaboration', category: 'soft' },
    ]);
    expect(result.meta).toEqual({ company: 'Acme', role: 'Backend Engineer' });
  });

  it('wraps the jd text inside <job_description> tags', async () => {
    vi.mocked(generateText).mockResolvedValue({ output: { requirements: [] } } as never);

    await parseJobDescription('my jd text');

    const call = vi.mocked(generateText).mock.lastCall![0];
    expect(call.prompt).toMatch(/<job_description>/);
    expect(call.prompt).toContain('my jd text');
    expect(call.prompt).toMatch(/<\/job_description>/);
  });

  it('returns empty requirements when model returns none', async () => {
    vi.mocked(generateText).mockResolvedValue({ output: { requirements: [] } } as never);

    expect((await parseJobDescription('jd text')).requirements).toEqual([]);
  });
});
