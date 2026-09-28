/**
 * CycloNerveAI - Request & Response Schema Validation Middleware
 * Validates payloads, rejects malformed/unsafe inputs, and enforces bounds.
 */

import { Request, Response, NextFunction } from 'express';
import { inspectPrompt } from './promptInjectionProtection.ts';
import { auditLogService } from './auditLogService.ts';

export interface ValidationIssue {
  field: string;
  message: string;
}

/**
 * Validates scenario parameters update.
 */
export function validateScenarioUpdate(payload: any): { isValid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!payload || typeof payload !== 'object') {
    issues.push({ field: 'body', message: 'Request body must be a JSON object.' });
    return { isValid: false, issues };
  }

  if (payload.centralPressureHpa !== undefined) {
    const val = Number(payload.centralPressureHpa);
    if (isNaN(val) || val < 850 || val > 1050) {
      issues.push({ field: 'centralPressureHpa', message: 'centralPressureHpa must be between 850 and 1050 hPa.' });
    }
  }

  if (payload.sustainedWindKmh !== undefined) {
    const val = Number(payload.sustainedWindKmh);
    if (isNaN(val) || val < 0 || val > 350) {
      issues.push({ field: 'sustainedWindKmh', message: 'sustainedWindKmh must be between 0 and 350 km/h.' });
    }
  }

  if (payload.stormSurgePeakMeters !== undefined) {
    const val = Number(payload.stormSurgePeakMeters);
    if (isNaN(val) || val < 0 || val > 15) {
      issues.push({ field: 'stormSurgePeakMeters', message: 'stormSurgePeakMeters must be between 0 and 15 meters.' });
    }
  }

  if (payload.hoursToLandfall !== undefined) {
    const val = Number(payload.hoursToLandfall);
    if (isNaN(val) || val < 0 || val > 120) {
      issues.push({ field: 'hoursToLandfall', message: 'hoursToLandfall must be between 0 and 120 hours.' });
    }
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Validates geographic coordinates and bounds.
 */
export function validateGeoCoordinates(lat: unknown, lng: unknown): { isValid: boolean; error?: string } {
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (isNaN(numLat) || numLat < -90 || numLat > 90) {
    return { isValid: false, error: `Latitude must be a number between -90 and 90. Received: ${lat}` };
  }

  if (isNaN(numLng) || numLng < -180 || numLng > 180) {
    return { isValid: false, error: `Longitude must be a number between -180 and 180. Received: ${lng}` };
  }

  return { isValid: true };
}

/**
 * Validates geospatial bounding box.
 */
export function validateBoundingBox(
  minLng: unknown,
  minLat: unknown,
  maxLng: unknown,
  maxLat: unknown
): { isValid: boolean; error?: string } {
  const c1 = validateGeoCoordinates(minLat, minLng);
  if (!c1.isValid) return c1;

  const c2 = validateGeoCoordinates(maxLat, maxLng);
  if (!c2.isValid) return c2;

  if (Number(minLng) >= Number(maxLng)) {
    return { isValid: false, error: 'minLng must be strictly less than maxLng.' };
  }

  if (Number(minLat) >= Number(maxLat)) {
    return { isValid: false, error: 'minLat must be strictly less than maxLat.' };
  }

  return { isValid: true };
}

/**
 * Validates advisory approval request.
 */
export function validateAdvisoryApprovalInput(body: any): { isValid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!body || typeof body !== 'object') {
    issues.push({ field: 'body', message: 'Request body must be a JSON object.' });
    return { isValid: false, issues };
  }

  if (!body.advisoryCode || typeof body.advisoryCode !== 'string' || body.advisoryCode.trim().length === 0) {
    issues.push({ field: 'advisoryCode', message: 'advisoryCode is required and must be non-empty.' });
  }

  if (body.evidenceReviewed === undefined) {
    issues.push({ field: 'evidenceReviewed', message: 'evidenceReviewed boolean flag is mandatory.' });
  } else if (typeof body.evidenceReviewed !== 'boolean') {
    issues.push({ field: 'evidenceReviewed', message: 'evidenceReviewed must be a boolean.' });
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Middleware that rejects malformed or prompt-injected JSON payloads.
 */
export function validateRequestSanitizationMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check for prompt injections in body strings
    if (req.body && typeof req.body === 'object') {
      const inspectObject = (obj: any): boolean => {
        for (const [key, val] of Object.entries(obj)) {
          if (typeof val === 'string') {
            const check = inspectPrompt(val, `${req.path}#${key}`);
            if (!check.isSafe) {
              return false;
            }
            // Sanitize
            obj[key] = check.sanitizedText;
          } else if (typeof val === 'object' && val !== null) {
            if (!inspectObject(val)) return false;
          }
        }
        return true;
      };

      if (!inspectObject(req.body)) {
        res.status(400).json({
          error: 'Malicious or prompt-injection payload detected and intercepted.',
          code: 'PROMPT_INJECTION_DETECTED',
        });
        return;
      }
    }

    next();
  };
}
