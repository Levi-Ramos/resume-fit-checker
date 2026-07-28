const BULLET_PATTERN = /^[-*•]\s+|^\d+[.)]\s+/;

export type ResumeChunk = {
  id: string;
  text: string;
  context?: string;
};

/**
 * Splits resume text into retrieval-sized chunks. Blank-line-separated blocks
 * that look like a role/section (a header line followed by 2+ bullets) get
 * split per-bullet, with the header kept as context for citations. Blocks
 * without that shape (summaries, single-line entries) stay as one chunk.
 */
export function chunkResume(rawText: string): ResumeChunk[] {
  const blocks = rawText
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const chunks: ResumeChunk[] = [];
  let chunkIndex = 0;

  for (const block of blocks) {
    const lines = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const bulletLines = lines.filter((line) => BULLET_PATTERN.test(line));

    if (bulletLines.length >= 2) {
      const headerLines = lines.filter((line) => !BULLET_PATTERN.test(line));
      const context = headerLines.length > 0 ? headerLines.join(' — ') : undefined;

      for (const bullet of bulletLines) {
        chunks.push({
          id: `chunk-${chunkIndex++}`,
          text: bullet.replace(BULLET_PATTERN, '').trim(),
          context,
        });
      }
    } else {
      chunks.push({
        id: `chunk-${chunkIndex++}`,
        text: block,
      });
    }
  }

  return chunks;
}
