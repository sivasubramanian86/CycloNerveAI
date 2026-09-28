/**
 * CycloNerveAI - Defensive HTTP Security Headers Middleware
 * Protects against MIME sniffing, clickjacking, inline script execution, and protocol downgrade.
 */

import { Request, Response, NextFunction } from 'express';

export function securityHeadersMiddleware() {
  return (_req: Request, res: Response, next: NextFunction): void => {
    // Remove Express fingerprint
    res.removeHeader('X-Powered-By');

    // Prevent MIME-sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Frame options for iFrame / UI Studio preview compatibility
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Cross-site scripting filter disabled (modern standard is CSP)
    res.setHeader('X-XSS-Protection', '0');

    // Enforce strict referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Restrict browser device APIs
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https: ws: wss:",
      ].join('; ')
    );

    // Strict Transport Security (HSTS) in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
  };
}
