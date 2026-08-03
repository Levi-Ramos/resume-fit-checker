import { describe, expect, it } from 'vitest';
import { chunkResume } from './chunk';

describe('chunkResume', () => {
  it('returns empty array for empty string', () => {
    expect(chunkResume('')).toEqual([]);
  });

  it('returns empty array for whitespace-only input', () => {
    expect(chunkResume('   \n\n   ')).toEqual([]);
  });

  it('keeps a prose paragraph as one chunk with no context', () => {
    const result = chunkResume('Experienced engineer with 5 years in full-stack development.');
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Experienced engineer with 5 years in full-stack development.');
    expect(result[0].context).toBeUndefined();
  });

  it('splits a block with 2+ bullets into per-bullet chunks, header becomes context', () => {
    const result = chunkResume('Senior Engineer at Acme\n- Built a distributed system\n- Led a team of 5');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Built a distributed system');
    expect(result[0].context).toBe('Senior Engineer at Acme');
    expect(result[1].text).toBe('Led a team of 5');
    expect(result[1].context).toBe('Senior Engineer at Acme');
  });

  it('keeps a block with only 1 bullet as a single chunk', () => {
    const text = 'Senior Engineer at Acme\n- Built a distributed system';
    const result = chunkResume(text);
    expect(result).toHaveLength(1);
    expect(result[0].context).toBeUndefined();
  });

  it('recognises *, •, and numbered bullet patterns', () => {
    expect(chunkResume('Role\n* Item 1\n* Item 2')).toHaveLength(2);
    expect(chunkResume('Role\n• Item 1\n• Item 2')).toHaveLength(2);
    expect(chunkResume('Role\n1. Item 1\n2. Item 2')).toHaveLength(2);
    expect(chunkResume('Role\n1) Item 1\n2) Item 2')).toHaveLength(2);
  });

  it('joins multiple non-bullet header lines with em-dash as context', () => {
    const result = chunkResume('Acme Corp\nSenior Engineer\n- Built things\n- Shipped things');
    expect(result[0].context).toBe('Acme Corp — Senior Engineer');
  });

  it('assigns sequential ids across mixed blocks', () => {
    const text = 'Summary paragraph\n\nRole A\n- Item 1\n- Item 2\n\nAnother paragraph';
    const ids = chunkResume(text).map((c) => c.id);
    expect(ids).toEqual(['chunk-0', 'chunk-1', 'chunk-2', 'chunk-3']);
  });

  it('handles Windows-style CRLF line endings', () => {
    const result = chunkResume('Senior Engineer\r\n- Built things\r\n- Shipped things');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Built things');
  });
});
