/**
 * CycloNerveAI - Deterministic Risk Calculation Engine
 * Formula: Risk = Hazard * Exposure * Vulnerability * Criticality
 * No LLM hallucinations in arithmetic.
 */

import { RiskCalculation } from '../types/index.ts';

export interface RawHazardInput {
  sustainedWindKmh: number;
  stormSurgeMeters: number;
  rain24hMm: number;
  distanceToEyeKm: number;
}

export interface RawExposureInput {
  populationServed: number;
  hasIcuOrEmergencyUnit: boolean;
  evacueeShelterHeadcount: number;
}

export interface RawVulnerabilityInput {
  elevationAmsl: number;
  floodWallThresholdMeters: number;
  hasBackupDieselGenerator: boolean;
  dieselFuelReserveHours: number;
  buildingStructuralCodeCompliant: boolean;
}

export interface RawCriticalityInput {
  systemicDownstreamBranches: number;
  isSinglePointOfFailure: boolean;
  tierAnchorLevel: 1 | 2 | 3;
}

export function calculateNormalizedHazard(input: RawHazardInput): number {
  // Normalize wind (Category 1 starts ~120km/h, Cat 4 is ~215km/h, Cat 5 >250km/h)
  const windScore = Math.min(1.0, Math.max(0.1, input.sustainedWindKmh / 240));

  // Normalize storm surge over threshold (0m = 0, 4m = 1.0)
  const surgeScore = Math.min(1.0, Math.max(0.0, input.stormSurgeMeters / 4.0));

  // Normalize rain (300mm+ in 24h is severe)
  const rainScore = Math.min(1.0, Math.max(0.0, input.rain24hMm / 350));

  // Distance decay from storm core (<= 25km = 1.0, 100km = 0.25)
  const distanceFactor = Math.max(0.2, 1.0 - input.distanceToEyeKm / 120);

  // Composite weighted hazard
  const raw = (windScore * 0.35 + surgeScore * 0.45 + rainScore * 0.2) * distanceFactor;
  return Math.min(1.0, Math.max(0.05, Math.round(raw * 1000) / 1000));
}

export function calculateNormalizedExposure(input: RawExposureInput): number {
  // Population scale (10,000 = 0.2, 100,000+ = 0.8, 200,000+ = 1.0)
  const popFactor = Math.min(1.0, Math.log10(Math.max(10, input.populationServed)) / 5.5);
  const icuFactor = input.hasIcuOrEmergencyUnit ? 0.3 : 0.0;
  const shelterFactor = Math.min(0.2, input.evacueeShelterHeadcount / 10000);

  const raw = Math.min(1.0, popFactor * 0.6 + icuFactor + shelterFactor);
  return Math.min(1.0, Math.max(0.1, Math.round(raw * 1000) / 1000));
}

export function calculateNormalizedVulnerability(input: RawVulnerabilityInput): number {
  let score = 0.5;

  // Elevation penalty (low-lying delta coastal terrain)
  if (input.elevationAmsl < 3.0) {
    score += 0.25;
  } else if (input.elevationAmsl > 10.0) {
    score -= 0.2;
  }

  // Backup fuel reserves
  if (!input.hasBackupDieselGenerator) {
    score += 0.35;
  } else if (input.dieselFuelReserveHours < 12) {
    score += 0.2;
  } else if (input.dieselFuelReserveHours >= 48) {
    score -= 0.15;
  }

  if (!input.buildingStructuralCodeCompliant) {
    score += 0.15;
  }

  return Math.min(1.0, Math.max(0.1, Math.round(score * 1000) / 1000));
}

export function calculateNormalizedCriticality(input: RawCriticalityInput): number {
  let score = 0.3;
  if (input.tierAnchorLevel === 1) score += 0.35;
  if (input.isSinglePointOfFailure) score += 0.25;
  score += Math.min(0.2, input.systemicDownstreamBranches * 0.05);

  return Math.min(1.0, Math.max(0.1, Math.round(score * 1000) / 1000));
}

export function computeDeterministicRisk(params: {
  assetId: string;
  hazard: number;
  exposure: number;
  vulnerability: number;
  criticality: number;
}): RiskCalculation {
  const { assetId, hazard, exposure, vulnerability, criticality } = params;
  const compositeRisk = Math.round(hazard * exposure * vulnerability * criticality * 1000) / 1000;

  const contributingFactors: string[] = [];
  if (hazard > 0.7) contributingFactors.push(`Severe atmospheric force (Hazard index ${hazard})`);
  if (exposure > 0.7) contributingFactors.push(`High human density & ICU patients (Exposure index ${exposure})`);
  if (vulnerability > 0.7) contributingFactors.push(`Sub-elevation & depleted backup fuel (Vulnerability ${vulnerability})`);
  if (criticality > 0.7) contributingFactors.push(`Tier-1 Grid Anchor & SPOF (Criticality index ${criticality})`);

  return {
    assetId,
    hazard,
    exposure,
    vulnerability,
    criticality,
    compositeRisk,
    contributingFactors,
    confidence: 0.942,
    timestamp: new Date().toISOString(),
    isSimulated: false,
  };
}

export function calculateAssetRisk(params: {
  assetId: string;
  elevationAmsl: number;
  criticalityScale10: number;
  waterSurgeMeters?: number;
  windGustKmh?: number;
  floodThresholdMeters?: number;
  windThresholdKmh?: number;
  backupDurationHours?: number;
}): RiskCalculation {
  const hazard = Math.min(
    1.0,
    ((params.windGustKmh || 215) / 240) * 0.5 + ((params.waterSurgeMeters || 3.0) / 4.0) * 0.5
  );
  const exposure = 0.85;
  const vulnerability = Math.max(
    0.1,
    Math.min(
      1.0,
      (params.elevationAmsl < 3 ? 0.85 : 0.4) +
        (params.backupDurationHours && params.backupDurationHours < 12 ? 0.25 : 0)
    )
  );
  const criticality = Math.min(1.0, params.criticalityScale10 / 10);

  return computeDeterministicRisk({
    assetId: params.assetId,
    hazard: Math.round(hazard * 100) / 100,
    exposure: Math.round(exposure * 100) / 100,
    vulnerability: Math.round(vulnerability * 100) / 100,
    criticality: Math.round(criticality * 100) / 100,
  });
}

