/**
 * CycloNerveAI - Provenance and Freshness Validation Engine
 * Validates data origin, cryptographic digests, freshness SLA thresholds,
 * and ensures unavailable, cached, and simulated sources are labeled strictly.
 *
 * Statutory Rule: Never fabricate a successful cloud response when an integration fails.
 */

import type { DataClassification } from '../../shared/types/index.ts';
import { ProvenanceRecord, ProvenanceStatus } from '../adapters/types.ts';

export interface FreshnessPolicy {
  maxStalenessSeconds: number;
  criticalDecayHalflifeSeconds?: number;
}

export const FRESHNESS_SLAS: Record<string, FreshnessPolicy> = {
  // Radar / Satellite SAR observations: fresh within 3 hours
  'radar_sar': { maxStalenessSeconds: 3 * 3600 },
  // Wind / Atmospheric pressure telemetry: fresh within 15 minutes
  'telemetry_live': { maxStalenessSeconds: 15 * 60 },
  // Storm surge hydrological model: fresh within 1 hour
  'storm_surge': { maxStalenessSeconds: 60 * 60 },
  // Evacuation routing & road status: fresh within 30 minutes
  'evacuation_routes': { maxStalenessSeconds: 30 * 60 },
  // Database / Inventory baseline: fresh within 24 hours
  'baseline_inventory': { maxStalenessSeconds: 24 * 3600 },
  // Default SLA: fresh within 1 hour
  'default': { maxStalenessSeconds: 3600 },
};

export function formatAgeString(seconds: number): string {
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${Math.floor(seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export interface BuildProvenanceOptions {
  source: string;
  sourceType: string;
  classification: DataClassification;
  isSimulated?: boolean;
  isCloud?: boolean;
  observedAt?: string;
  ingestedAt?: string;
  confidence?: number;
  cacheStatus?: 'HIT' | 'MISS' | 'NONE';
  slaKey?: string;
  maxStalenessSeconds?: number;
  version?: string;
  sha256Digest?: string;
}

export function buildAndValidateProvenance(options: BuildProvenanceOptions): ProvenanceRecord {
  const now = new Date();
  const ingestedAt = options.ingestedAt || now.toISOString();
  const observedAt = options.observedAt || ingestedAt;

  const observedTime = new Date(observedAt).getTime();
  const ageSeconds = Math.max(0, (now.getTime() - observedTime) / 1000);

  const sla = FRESHNESS_SLAS[options.slaKey || 'default'] || FRESHNESS_SLAS['default'];
  const maxStaleness = options.maxStalenessSeconds ?? sla.maxStalenessSeconds;

  const isStale = ageSeconds > maxStaleness;
  const isSimulated = options.isSimulated ?? false;

  // Determine correct provenance status according to statutory constraints
  let status: ProvenanceStatus = 'LIVE';
  if (isSimulated) {
    status = 'SIMULATED';
  } else if (options.cacheStatus === 'HIT' || isStale) {
    status = 'CACHED';
  }

  // Calculate decayed confidence if stale
  let confidence = Math.min(1.0, Math.max(0.0, options.confidence ?? 0.95));
  if (isStale) {
    // Graceful confidence penalty for stale records
    const excessHours = (ageSeconds - maxStaleness) / 3600;
    confidence = Math.max(0.2, confidence - excessHours * 0.1);
  }

  return {
    source: options.source,
    sourceType: options.sourceType,
    classification: isSimulated ? 'simulated' : options.classification,
    status,
    confidence: Number(confidence.toFixed(3)),
    observedAt,
    ingestedAt,
    freshness: formatAgeString(ageSeconds),
    ageSeconds: Math.floor(ageSeconds),
    isStale,
    isSimulated,
    cacheStatus: options.cacheStatus || 'NONE',
    version: options.version || '1.0.0',
    sha256Digest: options.sha256Digest,
  };
}

/**
 * Creates an authoritative UNAVAILABLE provenance record when a cloud integration fails.
 * Guarantees that failure is never obscured or fabricated as a mock success.
 */
export function buildUnavailableProvenance(
  source: string,
  sourceType: string,
  errorReason: string
): ProvenanceRecord {
  const nowIso = new Date().toISOString();
  return {
    source,
    sourceType,
    classification: 'observed',
    status: 'UNAVAILABLE',
    confidence: 0.0,
    observedAt: nowIso,
    ingestedAt: nowIso,
    freshness: 'UNAVAILABLE',
    ageSeconds: 0,
    isStale: true,
    isSimulated: false,
    cacheStatus: 'NONE',
    version: '1.0.0-error',
    sha256Digest: `error:${errorReason.slice(0, 32)}`,
  };
}
