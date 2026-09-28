/**
 * CycloNerveAI - WORM Security Audit Log Service
 * Implements cryptographically chained append-only audit trail with Merkle leaf verification.
 */

import crypto from 'crypto';
import { SecurityAuditRecord } from './types.ts';
import { redactSensitiveData } from './redaction.ts';

export class AuditLogService {
  private auditChain: SecurityAuditRecord[] = [];
  private lastHash = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    // Initialize genesis record
    this.recordEvent({
      action: 'SYSTEM_AUDIT_LOG_INITIALIZED',
      actor: { role: 'Administrator', userId: 'SYSTEM_BOOT' },
      resource: '/audit',
      status: 'SUCCESS',
      details: { engine: 'CycloNerveAI-Security-Kernel-v5.0' },
      isSimulated: true,
    });
  }

  private computeLeafHash(
    eventId: string,
    timestamp: string,
    action: string,
    userId: string,
    role: string,
    resource: string,
    status: string,
    previousMerkleHash: string
  ): string {
    const canonical = `${eventId}|${timestamp}|${action}|${userId}|${role}|${resource}|${status}|${previousMerkleHash}`;
    return crypto.createHash('sha256').update(canonical).digest('hex');
  }

  /**
   * Appends an audit event to the cryptographically hashed chain.
   */
  recordEvent(params: {
    action: string;
    actor: {
      userId?: string;
      role: any;
      ipAddress?: string;
      tokenKeyId?: string;
    };
    resource: string;
    status: SecurityAuditRecord['status'];
    details?: Record<string, unknown>;
    isSimulated?: boolean;
  }): SecurityAuditRecord {
    const eventId = `AUD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = new Date().toISOString();
    const isSimulated = params.isSimulated ?? true;

    // Sanitize and redact sensitive data before recording
    const cleanDetails = params.details
      ? (redactSensitiveData(params.details) as Record<string, unknown>)
      : undefined;

    const previousMerkleHash = this.lastHash;
    const userId = params.actor.userId || 'SYSTEM';
    const role = String(params.actor.role || 'Viewer');

    // Compute deterministic Merkle leaf hash
    const merkleHash = this.computeLeafHash(
      eventId,
      timestamp,
      params.action,
      userId,
      role,
      params.resource,
      params.status,
      previousMerkleHash
    );
    this.lastHash = merkleHash;

    const record: SecurityAuditRecord = {
      eventId,
      timestamp,
      action: params.action,
      actor: {
        userId: params.actor.userId,
        role: params.actor.role,
        ipAddress: params.actor.ipAddress,
        tokenKeyId: params.actor.tokenKeyId,
      },
      resource: params.resource,
      status: params.status,
      details: cleanDetails,
      previousMerkleHash,
      merkleHash,
      isSimulated,
    };

    this.auditChain.push(record);
    return record;
  }

  /**
   * Returns copy of recent audit records.
   */
  getRecentEvents(limit = 100): SecurityAuditRecord[] {
    return [...this.auditChain.slice(-limit)];
  }

  /**
   * Verifies the cryptographic integrity of the entire audit chain.
   */
  verifyChainIntegrity(): { isValid: boolean; brokenAtIndex?: number; totalRecords: number } {
    let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < this.auditChain.length; i++) {
      const rec = this.auditChain[i];
      if (i > 0 && rec.previousMerkleHash !== expectedPrevHash) {
        return { isValid: false, brokenAtIndex: i, totalRecords: this.auditChain.length };
      }

      const userId = rec.actor.userId || 'SYSTEM';
      const role = String(rec.actor.role || 'Viewer');

      const computedHash = this.computeLeafHash(
        rec.eventId,
        rec.timestamp,
        rec.action,
        userId,
        role,
        rec.resource,
        rec.status,
        rec.previousMerkleHash
      );

      if (computedHash !== rec.merkleHash) {
        return { isValid: false, brokenAtIndex: i, totalRecords: this.auditChain.length };
      }

      expectedPrevHash = rec.merkleHash;
    }

    return { isValid: true, totalRecords: this.auditChain.length };
  }
}

export const auditLogService = new AuditLogService();
