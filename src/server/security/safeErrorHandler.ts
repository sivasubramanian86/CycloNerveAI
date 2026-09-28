/**
 * CycloNerveAI - Safe Error Handling Middleware
 * Guarantees internal stack traces, system paths, or credential strings never leak to clients.
 */

import { Request, Response, NextFunction } from 'express';
import { safeLogger } from './redaction.ts';
import { auditLogService } from './auditLogService.ts';

export interface ApiErrorResponse {
  error: string;
  code: string;
  timestamp: string;
  details?: unknown;
}

export function safeErrorHandler() {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const timestamp = new Date().toISOString();
    const errObj = typeof err === 'object' && err !== null ? (err as Record<string, unknown>) : null;
    const isClientError =
      errObj !== null &&
      typeof errObj.statusCode === 'number' &&
      errObj.statusCode < 500;

    const statusCode = isClientError ? (errObj.statusCode as number) : 500;

    const clientMessage =
      isClientError && typeof errObj.message === 'string'
        ? errObj.message
        : 'An unexpected internal system error occurred. Please contact the EOC Operations Desk.';

    const errorCode =
      errObj !== null && typeof errObj.code === 'string'
        ? errObj.code
        : 'INTERNAL_ERROR';

    // Log internally with full redaction
    safeLogger.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

    auditLogService.recordEvent({
      action: `API_ERROR_${req.method}_${req.path}`,
      actor: {
        role: 'Viewer',
        ipAddress: req.ip || req.socket.remoteAddress,
      },
      resource: req.originalUrl,
      status: 'REJECTED_MALFORMED',
      details: {
        statusCode,
        code: errorCode,
      },
      isSimulated: true,
    });

    res.status(statusCode).json({
      error: clientMessage,
      code: errorCode,
      timestamp,
    } as ApiErrorResponse);
  };
}
