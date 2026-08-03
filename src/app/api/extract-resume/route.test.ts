// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { auth } from '@clerk/nextjs/server';
import { extractResumeText } from '@/lib/extract-resume';
import { POST } from './route';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/extract-resume', () => ({
  extractResumeText: vi.fn(),
}));

function requestWithFile(file: File | null) {
  const formData = new FormData();
  if (file) formData.set('file', file);
  return new Request('http://localhost/api/extract-resume', { method: 'POST', body: formData });
}

describe('POST /api/extract-resume', () => {
  it('rejects signed-out requests with 401 before touching the file', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);

    const res = await POST(requestWithFile(new File(['x'], 'r.pdf', { type: 'application/pdf' })));

    expect(res.status).toBe(401);
    expect(extractResumeText).not.toHaveBeenCalled();
  });

  it('rejects non-PDF files with 400', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as never);

    const res = await POST(requestWithFile(new File(['x'], 'r.docx', { type: 'application/msword' })));

    expect(res.status).toBe(400);
    expect(extractResumeText).not.toHaveBeenCalled();
  });

  it('rejects files over the 8MB cap with 413', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as never);
    const big = new File([new Uint8Array(8 * 1024 * 1024 + 1)], 'r.pdf', { type: 'application/pdf' });

    const res = await POST(requestWithFile(big));

    expect(res.status).toBe(413);
    expect(extractResumeText).not.toHaveBeenCalled();
  });

  it('returns extracted text with no warning when chunkResume finds content', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as never);
    vi.mocked(extractResumeText).mockResolvedValue('Senior Engineer\n\n- Built things\n- Shipped things');

    const res = await POST(requestWithFile(new File(['x'], 'r.pdf', { type: 'application/pdf' })));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.text).toContain('Built things');
    expect(body.warning).toBeUndefined();
  });

  it('returns a warning when extraction yields zero chunkable content', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as never);
    vi.mocked(extractResumeText).mockResolvedValue('   ');

    const res = await POST(requestWithFile(new File(['x'], 'r.pdf', { type: 'application/pdf' })));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.warning).toBeDefined();
  });
});
