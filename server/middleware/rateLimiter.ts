import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const attemptStore = new Map<string, RateLimitRecord>();

/**
 * In-memory Rate Limiting Middleware
 * Prevents brute force login and password reset spam
 */
export function createRateLimiter(windowMs: number = 15 * 60 * 1000, maxRequests: number = 10) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = attemptStore.get(key);

    if (!record || now > record.resetTime) {
      attemptStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: `Too many login attempts from this IP. Please try again in ${remainingSeconds} seconds.`,
      });
    }

    record.count += 1;
    attemptStore.set(key, record);
    next();
  };
}

export const adminLoginLimiter = createRateLimiter(15 * 60 * 1000, 10);
export const passwordResetLimiter = createRateLimiter(15 * 60 * 1000, 5);
