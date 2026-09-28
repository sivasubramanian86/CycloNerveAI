/**
 * CycloNerveAI - Sliding-Window Rate Limiter
 * Throttles brute-force attempts on 2FA desks, bulk dispatches, and heavy geospatial queries.
 */

import { Request, Response, NextFunction } from 'express';
import { auditLogService } from './auditLogService.ts';

interface RateLimitBucket {
  tokens: number[];
}

export class RateLimiter {
  private buckets = new Map<string, RateLimitBucket>();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly limiterName: string;

  constructor(
    maxRequests: number,
    windowMs: number,
    limiterName: string
  ) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.limiterName = limiterName;
  }

  check(key: string): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: [] };
      this.buckets.set(key, bucket);
    }

    // Filter tokens older than window
    bucket.tokens = bucket.tokens.filter((t) => t > windowStart);

    if (bucket.tokens.length >= this.maxRequests) {
      const oldestToken = bucket.tokens[0];
      const resetMs = oldestToken ? oldestToken + this.windowMs - now : this.windowMs;
      return { allowed: false, remaining: 0, resetMs: Math.max(0, resetMs) };
    }

    bucket.tokens.push(now);
    const remaining = this.maxRequests - bucket.tokens.length;
    return { allowed: true, remaining, resetMs: this.windowMs };
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const key = `${this.limiterName}:${ip}`;

      const { allowed, remaining, resetMs } = this.check(key);

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + resetMs) / 1000));

      if (!allowed) {
        auditLogService.recordEvent({
          action: `RATE_LIMIT_EXCEEDED_${this.limiterName}`,
          actor: { role: 'Viewer', ipAddress: ip },
          resource: req.originalUrl,
          status: 'RATE_LIMITED',
          details: { maxRequests: this.maxRequests, windowMs: this.windowMs },
          isSimulated: true,
        });

        res.status(429).json({
          error: `Rate limit exceeded for ${this.limiterName}. Try again in ${Math.ceil(resetMs / 1000)} seconds.`,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfterSeconds: Math.ceil(resetMs / 1000),
        });
        return;
      }

      next();
    };
  }

  reset(): void {
    this.buckets.clear();
  }
}

// Pre-configured limiters for different sensitivity tiers
export const globalApiLimiter = new RateLimiter(120, 60 * 1000, 'global_api'); // 120 req / min
export const dispatchRateLimiter = new RateLimiter(10, 60 * 1000, 'advisory_dispatch'); // 10 dispatches / min
export const authRateLimiter = new RateLimiter(25, 60 * 1000, 'auth_station'); // 25 auth attempts / min
export const uploadRateLimiter = new RateLimiter(20, 60 * 1000, 'file_upload'); // 20 uploads / min
