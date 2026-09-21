import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ponytail: no-op limiter when Redis isn't configured (e.g. missing env vars in preview/dev)
const noopLimiter = {
  limit: async () => ({ success: true as const, limit: 0, remaining: 0, reset: 0, pending: Promise.resolve() }),
};

function makeLimiter(prefix: string, limiter: Ratelimit['limiter']) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return noopLimiter as unknown as Ratelimit;
  }
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter,
    prefix,
  });
}

// ponytail: two separate prefix namespaces so limits don't share counters
export const fitCheckLimiter = makeLimiter('rl:fit-check', Ratelimit.slidingWindow(10, '60 s'));
export const extractLimiter = makeLimiter('rl:extract', Ratelimit.slidingWindow(20, '60 s'));
