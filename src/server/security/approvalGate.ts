/**
 * CycloNerveAI - Statutory Advisory Approval & Dispatch Gatekeeper
 * Enforces strict human-in-the-loop statutory compliance prior to public dissemination.
 */

import type { UserRole, MultilingualAdvisoryDraft } from '../../shared/types/index.ts';
import { AdvisoryApprovalRecord, EmergencyOverrideRecord } from './types.ts';
import { auditLogService } from './auditLogService.ts';

export interface DispatchAuthorizationResult {
  allowed: boolean;
  error?: string;
  code?: string;
  auditMerkleHash?: string;
  isSimulated: boolean;
  advisory?: MultilingualAdvisoryDraft;
}

export class ApprovalGatekeeper {
  private approvals = new Map<string, AdvisoryApprovalRecord>();
  private activeAdvisories = new Map<string, MultilingualAdvisoryDraft>();

  registerAdvisory(advisory: MultilingualAdvisoryDraft): void {
    // Ensure all registered advisories maintain clear simulation labeling
    this.activeAdvisories.set(advisory.advisoryCode, {
      ...advisory,
      isSimulated: true,
      classification: advisory.classification || 'simulated',
    });
  }

  getAdvisory(advisoryCode: string): MultilingualAdvisoryDraft | undefined {
    return this.activeAdvisories.get(advisoryCode);
  }

  /**
   * Approves an advisory draft.
   * Statutory Rule:
   * 1. Only Incident Commander or Administrator can approve.
   * 2. Evidence review MUST be confirmed prior to approval.
   */
  approveAdvisory(params: {
    advisoryCode: string;
    officerRole: UserRole;
    officerName: string;
    evidenceReviewed: boolean;
    evidenceSummaryRef?: string;
    reviewNotes?: string;
    officerKeyId?: string;
  }): { success: boolean; error?: string; code?: string; record?: AdvisoryApprovalRecord } {
    const { advisoryCode, officerRole, officerName, evidenceReviewed, evidenceSummaryRef, reviewNotes, officerKeyId } =
      params;

    // Check Role
    if (officerRole === 'Viewer' || officerRole === 'Analyst' || officerRole === 'Field Officer') {
      auditLogService.recordEvent({
        action: 'ADVISORY_APPROVAL_UNAUTHORIZED_ROLE',
        actor: { role: officerRole, userId: officerName },
        resource: `/advisories/${advisoryCode}`,
        status: 'DENIED_UNAUTHORIZED',
        details: { attemptedRole: officerRole, advisoryCode },
        isSimulated: true,
      });

      return {
        success: false,
        error: `Role '${officerRole}' lacks statutory authority to approve early warning advisories. Requires Incident Commander or Administrator.`,
        code: 'FORBIDDEN_APPROVAL_ROLE',
      };
    }

    // Check Evidence Review
    if (!evidenceReviewed) {
      auditLogService.recordEvent({
        action: 'ADVISORY_APPROVAL_EVIDENCE_NOT_REVIEWED',
        actor: { role: officerRole, userId: officerName },
        resource: `/advisories/${advisoryCode}`,
        status: 'REJECTED_MALFORMED',
        details: { advisoryCode, reason: 'Evidence review flag is false' },
        isSimulated: true,
      });

      return {
        success: false,
        error: `Statutory Violation: Cannot approve advisory '${advisoryCode}' without completing and certifying evidence review.`,
        code: 'PRECONDITION_EVIDENCE_REVIEW_REQUIRED',
      };
    }

    // Lookup Advisory
    const advisory = this.activeAdvisories.get(advisoryCode);
    if (advisory) {
      advisory.approvalStatus = 'approved';
      advisory.approver = {
        officerName,
        role: officerRole,
        timestamp: new Date().toISOString(),
        fido2KeyId: officerKeyId || 'FIDO2-IC-ODISHA-DEFAULT',
        comment: reviewNotes || 'Certified after multimodal evidence review.',
      };
    }

    const record: AdvisoryApprovalRecord = {
      advisoryId: advisoryCode,
      approverName: officerName,
      approverRole: officerRole,
      evidenceReviewed: true,
      evidenceSummaryRef: evidenceSummaryRef || 'SAR-Dhamra-Flood-Inundation-Mosaic',
      reviewNotes: reviewNotes || 'All coastal ground truth inputs verified.',
      approvalTimestamp: new Date().toISOString(),
      officerKeyId: officerKeyId || 'FIPS-IC-9482',
      pinVerified: true,
    };

    this.approvals.set(advisoryCode, record);

    const audit = auditLogService.recordEvent({
      action: 'ADVISORY_APPROVED_AFTER_EVIDENCE_REVIEW',
      actor: { role: officerRole, userId: officerName, tokenKeyId: record.officerKeyId },
      resource: `/advisories/${advisoryCode}`,
      status: 'SUCCESS',
      details: {
        advisoryCode,
        evidenceSummaryRef: record.evidenceSummaryRef,
        approvalTimestamp: record.approvalTimestamp,
      },
      isSimulated: true,
    });

    return { success: true, record };
  }

  /**
   * Enforces approval gate and checks authorization before dispatching to sirens/cell broadcast.
   * Statutory Rules:
   * 1. No advisory bypasses the approval gate (must have approvalStatus === 'approved').
   * 2. Analysts, Viewers, Field Officers cannot dispatch.
   * 3. Emergency overrides require statutory justification.
   */
  verifyDispatchGate(params: {
    advisory: MultilingualAdvisoryDraft;
    dispatcherRole: UserRole;
    dispatcherName: string;
    dualAuthVerified?: boolean;
    emergencyOverride?: {
      statutoryJustification: string;
      legalActReference?: string;
    };
  }): DispatchAuthorizationResult {
    const { advisory, dispatcherRole, dispatcherName, dualAuthVerified, emergencyOverride } = params;

    // Rule 1: Role authority
    if (dispatcherRole === 'Viewer' || dispatcherRole === 'Analyst' || dispatcherRole === 'Field Officer') {
      auditLogService.recordEvent({
        action: 'DISPATCH_BLOCKED_UNAUTHORIZED_ROLE',
        actor: { role: dispatcherRole, userId: dispatcherName },
        resource: `/dispatch/${advisory.advisoryCode}`,
        status: 'DENIED_UNAUTHORIZED',
        details: { attemptedRole: dispatcherRole, advisoryCode: advisory.advisoryCode },
        isSimulated: true,
      });

      return {
        allowed: false,
        error: `Role '${dispatcherRole}' is strictly forbidden from dispatching public emergency broadcasts.`,
        code: 'FORBIDDEN_DISPATCH_ROLE',
        isSimulated: true,
      };
    }

    // Rule 2: Emergency Override Path
    if (emergencyOverride) {
      const justification = emergencyOverride.statutoryJustification?.trim() || '';
      if (justification.length < 20) {
        auditLogService.recordEvent({
          action: 'EMERGENCY_OVERRIDE_REJECTED_JUSTIFICATION',
          actor: { role: dispatcherRole, userId: dispatcherName },
          resource: `/dispatch/${advisory.advisoryCode}`,
          status: 'REJECTED_MALFORMED',
          details: { justificationLength: justification.length },
          isSimulated: true,
        });

        return {
          allowed: false,
          error: 'Emergency override rejected: Statutory justification must be at least 20 characters and state specific statutory emergency authority.',
          code: 'INVALID_OVERRIDE_JUSTIFICATION',
          isSimulated: true,
        };
      }

      // Record emergency override audit event
      const overrideAudit = auditLogService.recordEvent({
        action: 'EMERGENCY_OVERRIDE_DISPATCH_SEALED',
        actor: { role: dispatcherRole, userId: dispatcherName },
        resource: `/dispatch/${advisory.advisoryCode}`,
        status: 'SEALED_OVERRIDE',
        details: {
          advisoryCode: advisory.advisoryCode,
          justification,
          legalActReference: emergencyOverride.legalActReference || 'DM_ACT_2005_SEC_34',
        },
        isSimulated: true,
      });

      // Mark advisory dispatched
      advisory.isDispatched = true;
      advisory.isSimulated = true;

      return {
        allowed: true,
        auditMerkleHash: overrideAudit.merkleHash,
        isSimulated: true,
        advisory,
      };
    }

    // Rule 3: No unapproved advisory bypasses the gate
    const isApproved =
      advisory.approvalStatus === 'approved' || this.approvals.has(advisory.advisoryCode);

    if (!isApproved) {
      auditLogService.recordEvent({
        action: 'DISPATCH_BLOCKED_UNAPPROVED_ADVISORY',
        actor: { role: dispatcherRole, userId: dispatcherName },
        resource: `/dispatch/${advisory.advisoryCode}`,
        status: 'REJECTED_MALFORMED',
        details: {
          advisoryCode: advisory.advisoryCode,
          approvalStatus: advisory.approvalStatus,
        },
        isSimulated: true,
      });

      return {
        allowed: false,
        error: `Approval Gate Violation: Advisory '${advisory.advisoryCode}' is in '${advisory.approvalStatus}' state. Unapproved advisories cannot be dispatched.`,
        code: 'GATE_VIOLATION_NOT_APPROVED',
        isSimulated: true,
      };
    }

    // Rule 4: Dual-Officer 2FA check
    if (!dualAuthVerified) {
      return {
        allowed: false,
        error: 'Dual-Officer 2FA authentication is required for public emergency broadcast dissemination.',
        code: 'DUAL_2FA_REQUIRED',
        isSimulated: true,
      };
    }

    const dispatchAudit = auditLogService.recordEvent({
      action: 'ADVISORY_DISPATCHED_AUTHORIZED',
      actor: { role: dispatcherRole, userId: dispatcherName },
      resource: `/dispatch/${advisory.advisoryCode}`,
      status: 'SUCCESS',
      details: {
        advisoryCode: advisory.advisoryCode,
        channels: advisory.channelsArmed,
      },
      isSimulated: true,
    });

    advisory.isDispatched = true;
    advisory.isSimulated = true;

    return {
      allowed: true,
      auditMerkleHash: dispatchAudit.merkleHash,
      isSimulated: true,
      advisory,
    };
  }
}

export const approvalGatekeeper = new ApprovalGatekeeper();
