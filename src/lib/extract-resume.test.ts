import { describe, expect, it, vi } from 'vitest';
import { generateText } from 'ai';
import { extractResumeText } from './extract-resume';

vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((model: string) => ({ modelId: model })),
}));

describe('extractResumeText', () => {
  it('sends the PDF as a file part alongside an extraction-instructions text part', async () => {
    vi.mocked(generateText).mockResolvedValue({ text: '  extracted text  ' } as never);

    const pdfBytes = Buffer.from('%PDF-1.4 fake');
    const result = await extractResumeText(pdfBytes);

    expect(result).toBe('extracted text');
    expect(generateText).toHaveBeenCalledTimes(1);

    const call = vi.mocked(generateText).mock.calls[0][0];
    expect(call.messages).toEqual([
      {
        role: 'user',
        content: [
          { type: 'text', text: expect.any(String) },
          { type: 'file', mediaType: 'application/pdf', data: pdfBytes },
        ],
      },
    ]);
  });
});
