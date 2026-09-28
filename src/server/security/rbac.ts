/**
 * CycloNerveAI - Role-Based Access Control (RBAC) Engine
 * Strict enforcement of statutory duties across Emergency Operations roles.
 */

import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../../shared/types/index.ts';
import { SecurityPermission, AuthenticatedUser } from './types.ts';
import { auditLogService } from './auditLogService.ts';

// Statutory Permission Matrix
const ROLE_PERMISSIONS: Record<UserRole, Set<SecurityPermission>> = {
  Viewer: new Set<SecurityPermission>([
    'SCENARIO_VIEW',
    'ADVISORY_VIEW',
    'INTERVENTION_VIEW',
  ]),
  Analyst: new Set<SecurityPermission>([
    'SCENARIO_VIEW',
    'ADVISORY_VIEW',
    'ADVISORY_DRAFT',
    'INTERVENTION_VIEW',
    'INTERVENTION_STAGE',
  ]),
  'Field Officer': new Set<SecurityPermission>([
    'SCENARIO_VIEW',
    'ADVISORY_VIEW',
    'INTERVENTION_VIEW',
    'EVIDENCE_SUBMIT',
    'ASSET_UPDATE',
  ]),
  'Incident Commander': new Set<SecurityPermission>([
    'SCENARIO_VIEW',
    'SCENARIO_CHANGE',
    'SCENARIO_UPDATE_PARAMS',
    'ADVISORY_VIEW',
    'ADVISORY_DRAFT',
    'ADVISORY_APPROVE',
    'ADVISORY_DISPATCH',
    'EMERGENCY_OVERRIDE',
    'INTERVENTION_VIEW',
    'INTERVENTION_STAGE',
    'INTERVENTION_EXECUTE',
    'EVIDENCE_SUBMIT',
    'EVIDENCE_REVIEW',
    'ASSET_UPDATE',
    'AUDIT_VIEW',
    'SYSTEM_KILL_SWITCH',
    'SYSTEM_DEGRADED_MODE',
  ]),
  Administrator: new Set<SecurityPermission>([
    'SCENARIO_VIEW',
    'SCENARIO_CHANGE',
    'SCENARIO_UPDATE_PARAMS',
    'ADVISORY_VIEW',
    'ADVISORY_DRAFT',
    'ADVISORY_APPROVE',
    'ADVISORY_DISPATCH',
    'EMERGENCY_OVERRIDE',
    'INTERVENTION_VIEW',
    'INTERVENTION_STAGE',
    'INTERVENTION_EXECUTE',
    'EVIDENCE_SUBMIT',
    'EVIDENCE_REVIEW',
    'ASSET_UPDATE',
    'SYSTEM_KILL_SWITCH',
    'SYSTEM_DEGRADED_MODE',
    'AUDIT_VIEW',
  ]),
};

/**
 * Checks whether a given role possesses a specific security permission.
 */
export function hasPermission(role: UserRole | string, permission: SecurityPermission): boolean {
  const normalizedRole = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  return Boolean(permissions && permissions.has(permission));
}

/**
 * Normalizes input role string to a valid UserRole, defaulting safely to 'Viewer'.
 */
export function normalizeRole(role?: string | null): UserRole {
  if (!role) return 'Viewer';
  const trimmed = role.trim();
  if (
    trimmed === 'Viewer' ||
    trimmed === 'Analyst' ||
    trimmed === 'Field Officer' ||
    trimmed === 'Incident Commander' ||
    trimmed === 'Administrator'
  ) {
    return trimmed;
  }
  return 'Viewer';
}

/**
 * Extracts authenticated user context from request headers or body.
 * Defaults to 'Viewer' (least privilege) if no authorization context is present.
 */
export function extractUserContext(req: Request): AuthenticatedUser {
  const headerRole = req.headers['x-user-role'] as string | undefined;
  const bodyRole = req.body?.userRole as string | undefined;
  const role = normalizeRole(headerRole || bodyRole);

  const displayName =
    (req.headers['x-user-name'] as string) ||
    req.body?.userName ||
    (role === 'Incident Commander' ? 'Dr. Arvind Rao, IAS' : `${role} User`);

  const userId =
    (req.headers['x-user-id'] as string) ||
    req.body?.userId ||
    `USR-${role.toUpperCase().replace(/\s+/g, '_')}`;

  const tokenKeyId =
    (req.headers['x-fips-key-id'] as string) ||
    req.body?.tokenKeyId ||
    (role === 'Incident Commander' ? 'FIPS-IC-9482' : undefined);

  return {
    userId,
    role,
    displayName,
    tokenKeyId,
    jurisdiction: (req.headers['x-jurisdiction'] as string) || 'Odisha State EOC',
  };
}

/**
 * Express middleware that enforces one or more required permissions.
 */
export function requirePermission(permission: SecurityPermission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = extractUserContext(req);

    if (!hasPermission(user.role, permission)) {
      auditLogService.recordEvent({
        action: `RBAC_CHECK_${permission}`,
        actor: {
          userId: user.userId,
          role: user.role,
          ipAddress: req.ip || req.socket.remoteAddress,
          tokenKeyId: user.tokenKeyId,
        },
        resource: req.originalUrl,
        status: 'DENIED_UNAUTHORIZED',
        details: {
          requiredPermission: permission,
          userRole: user.role,
        },
        isSimulated: true,
      });

      res.status(403).json({
        error: `Access Denied: Role '${user.role}' lacks statutory authority for '${permission}'.`,
        code: 'FORBIDDEN_INSUFFICIENT_ROLE',
        requiredPermission: permission,
        currentRole: user.role,
      });
      return;
    }

    // Attach user context to request for subsequent handlers
    (req as Request & { user: AuthenticatedUser }).user = user;
    next();
  };
}

/**
 * Express middleware that enforces specific allowed roles.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = extractUserContext(req);

    if (!allowedRoles.includes(user.role)) {
      auditLogService.recordEvent({
        action: `ROLE_CHECK_${req.method}_${req.baseUrl || req.path}`,
        actor: {
          userId: user.userId,
          role: user.role,
          ipAddress: req.ip || req.socket.remoteAddress,
          tokenKeyId: user.tokenKeyId,
        },
        resource: req.originalUrl,
        status: 'DENIED_UNAUTHORIZED',
        details: {
          allowedRoles,
          currentRole: user.role,
        },
        isSimulated: true,
      });

      res.status(403).json({
        error: `Access Denied: Role '${user.role}' is not authorized. Required: ${allowedRoles.join(', ')}.`,
        code: 'FORBIDDEN_ROLE_RESTRICTED',
        allowedRoles,
        currentRole: user.role,
      });
      return;
    }

    (req as Request & { user: AuthenticatedUser }).user = user;
    next();
  };
}
