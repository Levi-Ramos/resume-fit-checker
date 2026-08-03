import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FitCheckForm } from './fit-check-form';
import type { FitReport } from '@/lib/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ isSignedIn: false }),
}));

const REPORT: FitReport = {
  summary: { score: 0.75, matchCount: 3, partialCount: 1, gapCount: 0, total: 4 },
  results: [
    {
      requirement: { id: 'req-0', text: 'TypeScript', category: 'hard' },
      verdict: 'match',
      evidenceQuote: 'Built things in TypeScript',
      rationale: 'Directly stated.',
    },
  ],
};

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// REGRESSION: fit-check-form.tsx now also has file-upload UI (T4). This
// covers the pre-existing paste-and-submit flow, which must be unaffected.
describe('FitCheckForm — paste-and-submit (regression)', () => {
  it('submits pasted resume + JD text to /api/fit-check and renders the report', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => REPORT,
    } as Response);

    render(<FitCheckForm />);

    await user.type(screen.getByLabelText('Resume'), 'Senior Engineer with TypeScript experience');
    await user.type(screen.getByLabelText('Job description'), 'Looking for a TypeScript engineer');
    await user.click(screen.getByRole('button', { name: /check fit/i }));

    await waitFor(() => expect(screen.getByText('Overall fit')).toBeInTheDocument());

    expect(fetch).toHaveBeenCalledWith(
      '/api/fit-check',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: 'Senior Engineer with TypeScript experience',
          jd: 'Looking for a TypeScript engineer',
        }),
      }),
    );
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows the fit-check error surface (not the upload one) when submit fails', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: 'The Gemini API is rate-limited or overloaded right now. Please wait a moment and try again.' }),
    } as Response);

    render(<FitCheckForm />);

    await user.type(screen.getByLabelText('Resume'), 'Some resume text here');
    await user.type(screen.getByLabelText('Job description'), 'Some job description here');
    await user.click(screen.getByRole('button', { name: /check fit/i }));

    await waitFor(() =>
      expect(screen.getByText(/rate-limited or overloaded/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText('Overall fit')).not.toBeInTheDocument();
  });

  it('disables the upload control for signed-out users without blocking paste-and-submit', () => {
    render(<FitCheckForm />);

    expect(screen.getByRole('button', { name: /upload pdf/i })).toBeDisabled();
    expect(screen.getByLabelText('Resume')).toBeEnabled();
  });
});
