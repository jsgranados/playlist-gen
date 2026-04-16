import { AppError } from "@/lib/errors";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function assertRateLimit(
  key: string,
  limit = 8,
  windowMs = 60_000
) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return;
  }

  if (existing.count >= limit) {
    throw new AppError(
      "Too many requests. Please wait a moment and try again.",
      429,
      "rate_limited"
    );
  }

  existing.count += 1;
}
