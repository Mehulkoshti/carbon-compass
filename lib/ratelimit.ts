/**
 * Minimal in-memory sliding-window rate limiter (per server instance).
 * Good enough to blunt accidental floods / abuse on a single deployment; a
 * production system would back this with a shared store (e.g. Redis).
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

/** Best-effort client IP from forwarding headers. */
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}
