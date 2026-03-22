const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_HOUR = 30;

export function checkRateLimit(anonId: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(anonId);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(anonId, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= MAX_PER_HOUR) return false;
  entry.count++;
  return true;
}

export function getRateLimitStatus(anonId: string): {
  used: number;
  limit: number;
  resetsAt: number | null;
} {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(anonId);
  if (!entry || now > entry.resetAt) {
    return { used: 0, limit: MAX_PER_HOUR, resetsAt: null };
  }
  return { used: entry.count, limit: MAX_PER_HOUR, resetsAt: entry.resetAt };
}
