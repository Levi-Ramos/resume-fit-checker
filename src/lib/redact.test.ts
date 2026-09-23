import { describe, expect, it } from 'vitest';
import { redactContactInfo } from './redact';

describe('redactContactInfo', () => {
  it('strips emails, links and phone numbers', () => {
    const out = redactContactInfo(
      'Juan Cruz · juan.cruz@gmail.com · +63 917 123 4567 · 0917-123-4567 · (555) 123-4567\n' +
        'https://juancruz.dev linkedin.com/in/juancruz www.github.com/jc',
    );
    expect(out).toBe('Juan Cruz · [email] · [phone] · [phone] · [phone]\n[link] [link] [link]');
  });

  it('keeps dates, years and metrics intact', () => {
    const text = 'Engineer, 2019 - 2023. Cut latency 40% for 1,200,000 users. Jan 2015-2019.';
    expect(redactContactInfo(text)).toBe(text);
  });
});
