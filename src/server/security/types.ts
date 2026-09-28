/**
 * CycloNerveAI - Phase 5 Security & Hardening Types
 */

import type { UserRole } from '../../shared/types/index.ts';

export type SecurityPermission =
  | 'SCENARIO_VIEW'
  | 'SCENARIO_CHANGE'
  | 'SCENARIO_UPDATE_PARAMS'
  | 'ADVISORY_VIEW'
  | 'ADVISORY_DRAFT'
  | 'ADVISORY_APPROVE'
  | 'ADVISORY_DISPATCH'
  | 'EMERGENCY_OVERRIDE'
  | 'INTERVENTION_VIEW'
  | 'INTERVENTION_STAGE'
  | 'INTERVENTION_EXECUTE'
  | 'EVIDENCE_SUBMIT'
  | 'EVIDENCE_REVIEW'
  | 'ASSET_UPDATE'
  | 'SYSTEM_KILL_SWITCH'
  | 'SYSTEM_DEGRADED_MODE'
  | 'AUDIT_VIEW';

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  displayName: string;
  tokenKeyId?: string;
  jurisdiction?: string;
}

export interface SecurityAuditRecord {
  eventId: string;
  timestamp: string;
  action: string;
  actor: {
    userId?: string;
    role: UserRole;
    ipAddress?: string;
    tokenKeyId?: string;
  };
  resource: string;
  status: 'SUCCESS' | 'DENIED_UNAUTHORIZED' | 'REJECTED_MALFORMED' | 'INTERCEPTED_INJECTION' | 'SEALED_OVERRIDE' | 'RATE_LIMITED';
  details?: Record<string, unknown>;
  previousMerkleHash: string;
  merkleHash: string;
  isSimulated: boolean;
}

export interface UploadedFileMetadata {
  filename: string;
  sizeBytes: number;
  mimeType: string;
  detectedMimeType: string;
  extension: string;
  isValid: boolean;
  validationError?: string;
  sha256Digest?: string;
}

export interface AdvisoryApprovalRecord {
  advisoryId: string;
  approverName: string;
  approverRole: UserRole;
  evidenceReviewed: boolean;
  evidenceSummaryRef?: string;
  reviewNotes: string;
  approvalTimestamp: string;
  officerKeyId: string;
  pinVerified: boolean;
}

export interface EmergencyOverrideRecord {
  advisoryId: string;
  commanderName: string;
  commanderRole: UserRole;
  statutoryJustification: string;
  legalActReference: string; // e.g., 'DM_ACT_2005_SEC_34'
  timestamp: string;
  overrideAuthorized: boolean;
}
