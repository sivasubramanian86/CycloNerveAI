/**
 * CycloNerveAI - Deterministic Risk Scoring Engine
 * Implements R = Hazard * Exposure * Vulnerability * Criticality
 * No external LLM or probabilistic dependencies. Pure mathematical rigor.
 */

import {
  CriticalityParameters,
  DetailedRiskScore,
  ExposureParameters,
  FactorBreakdown,
  HazardParameters,
  VulnerabilityParameters,
} from '../types.ts';

export class RiskScoringEngine {
  /**
   * Calculates normalized hazard score H in [0.0, 1.0] with factor-level breakdown
   */
  public calculateHazard(params: HazardParameters): FactorBreakdown {
    // Wind factor: normalized up to Cat 5 hurricane threshold (240 km/h)
    const windNorm = Math.min(1.0, Math.max(0.05, params.sustainedWindKmh / 240));

    // Surge factor: normalized against extreme estuarine surge (4.0m MSL)
    const surgeNorm = Math.min(1.0, Math.max(0.0, params.stormSurgeMeters / 4.0));

    // Rain factor: normalized against severe 24h deluge (350 mm)
    const rainNorm = Math.min(1.0, Math.max(0.0, params.rain24hMm / 350));

    // Distance decay: max hazard at core (<= 20km = 1.0), decaying to 0.2 at 120km
    const distanceDecay = Math.max(0.2, Math.min(1.0, 1.0 - (params.distanceToEyeKm - 20) / 100));

    // Weights: Surge 45%, Wind 35%, Rain 20%
    const weightedRaw = (surgeNorm * 0.45 + windNorm * 0.35 + rainNorm * 0.2) * distanceDecay;
    const normalized = Math.min(1.0, Math.max(0.05, Math.round(weightedRaw * 1000) / 1000));

    return {
      raw: weightedRaw,
      normalized,
      weight: 0.25,
      explanation: `Atmospheric & marine hazard: ${params.sustainedWindKmh} km/h wind, +${params.stormSurgeMeters}m storm surge, ${params.distanceToEyeKm} km from cyclone eye.`,
      contributingMetrics: {
        sustainedWindKmh: params.sustainedWindKmh,
        gustsKmh: params.gustsKmh,
        stormSurgeMeters: params.stormSurgeMeters,
        rain24hMm: params.rain24hMm,
        distanceToEyeKm: params.distanceToEyeKm,
        decayFactor: Math.round(distanceDecay * 100) / 100,
      },
    };
  }

  /**
   * Calculates normalized exposure score E in [0.0, 1.0] with factor-level breakdown
   */
  public calculateExposure(params: ExposureParameters): FactorBreakdown {
    // Population scaling: logarithmic scale (1,000 = 0.54, 10,000 = 0.72, 100,000+ = 0.91, 200,000+ = 1.0)
    const popScale = Math.min(1.0, Math.max(0.1, Math.log10(Math.max(10, params.populationServed)) / 5.5));

    // ICU/Medical facility multiplier
    const icuBonus = params.hasIcuOrEmergencyUnit ? 0.3 : 0.0;

    // Evacuee headcount in shelter complex
    const shelterBonus = Math.min(0.2, params.evacueeShelterHeadcount / 10000);

    const weightedRaw = Math.min(1.0, popScale * 0.6 + icuBonus + shelterBonus);
    const normalized = Math.min(1.0, Math.max(0.1, Math.round(weightedRaw * 1000) / 1000));

    return {
      raw: weightedRaw,
      normalized,
      weight: 0.25,
      explanation: `Human & asset exposure: ${params.populationServed.toLocaleString()} citizens served${
        params.hasIcuOrEmergencyUnit ? ', Tier-1 ICU unit present' : ''
      }${params.evacueeShelterHeadcount > 0 ? `, ${params.evacueeShelterHeadcount} evacuees on site` : ''}.`,
      contributingMetrics: {
        populationServed: params.populationServed,
        hasIcuOrEmergencyUnit: params.hasIcuOrEmergencyUnit,
        evacueeShelterHeadcount: params.evacueeShelterHeadcount,
        directEconomicAssetValueUsd: params.directEconomicAssetValueUsd,
      },
    };
  }

  /**
   * Calculates normalized vulnerability score V in [0.0, 1.0] with factor-level breakdown
   */
  public calculateVulnerability(params: VulnerabilityParameters): FactorBreakdown {
    let score = 0.5;

    // Coastal zone & low elevation penalty
    if (params.elevationAmsl < 3.0) {
      score += 0.25; // High flood risk
    } else if (params.elevationAmsl < 5.0) {
      score += 0.1;
    } else if (params.elevationAmsl > 10.0) {
      score -= 0.2; // Elevated terrain credit
    }

    // Backup power resilience
    if (!params.hasBackupDieselGenerator) {
      score += 0.3; // Total grid dependency
    } else if (params.dieselFuelReserveHours < 12) {
      score += 0.2; // Critical fuel shortage (<12h)
    } else if (params.dieselFuelReserveHours >= 48) {
      score -= 0.15; // Generous reserves credit
    }

    // Structural building resilience
    if (!params.buildingStructuralCodeCompliant) {
      score += 0.15;
    }

    if (params.isCoastalZone1) {
      score += 0.1;
    }

    const normalized = Math.min(1.0, Math.max(0.1, Math.round(score * 1000) / 1000));

    return {
      raw: score,
      normalized,
      weight: 0.25,
      explanation: `Physical vulnerability: Elev +${params.elevationAmsl}m MSL, ${
        params.hasBackupDieselGenerator
          ? `${params.dieselFuelReserveHours}h DG fuel reserve`
          : 'No backup DG power'
      }${params.isCoastalZone1 ? ', Coastal Zone 1 high tidal exposure' : ''}.`,
      contributingMetrics: {
        elevationAmsl: params.elevationAmsl,
        floodWallThresholdMeters: params.floodWallThresholdMeters,
        hasBackupDieselGenerator: params.hasBackupDieselGenerator,
        dieselFuelReserveHours: params.dieselFuelReserveHours,
        buildingStructuralCodeCompliant: params.buildingStructuralCodeCompliant,
        isCoastalZone1: params.isCoastalZone1,
      },
    };
  }

  /**
   * Calculates normalized criticality score C in [0.0, 1.0] with factor-level breakdown
   */
  public calculateCriticality(params: CriticalityParameters): FactorBreakdown {
    let score = 0.3;

    if (params.tierAnchorLevel === 1) {
      score += 0.35; // Primary regional anchor
    } else if (params.tierAnchorLevel === 2) {
      score += 0.2;
    }

    if (params.isSinglePointOfFailure) {
      score += 0.25; // SPOF bottleneck
    }

    if (params.servesEmergencyResponders) {
      score += 0.15;
    }

    score += Math.min(0.2, params.systemicDownstreamBranches * 0.05);

    const normalized = Math.min(1.0, Math.max(0.1, Math.round(score * 1000) / 1000));

    return {
      raw: score,
      normalized,
      weight: 0.25,
      explanation: `Network systemic criticality: Tier-${params.tierAnchorLevel} regional anchor, ${
        params.systemicDownstreamBranches
      } downstream branches${params.isSinglePointOfFailure ? ' (Single Point of Failure)' : ''}.`,
      contributingMetrics: {
        tierAnchorLevel: params.tierAnchorLevel,
        isSinglePointOfFailure: params.isSinglePointOfFailure,
        systemicDownstreamBranches: params.systemicDownstreamBranches,
        servesEmergencyResponders: params.servesEmergencyResponders,
      },
    };
  }

  /**
   * Computes composite deterministic risk score R = H * E * V * C
   */
  public computeRisk(input: {
    assetId: string;
    hazard: HazardParameters;
    exposure: ExposureParameters;
    vulnerability: VulnerabilityParameters;
    criticality: CriticalityParameters;
  }): DetailedRiskScore {
    const h = this.calculateHazard(input.hazard);
    const e = this.calculateExposure(input.exposure);
    const v = this.calculateVulnerability(input.vulnerability);
    const c = this.calculateCriticality(input.criticality);

    const compositeRisk = Math.round(h.normalized * e.normalized * v.normalized * c.normalized * 1000) / 1000;

    let riskCategory: DetailedRiskScore['riskCategory'] = 'LOW';
    if (compositeRisk >= 0.45) {
      riskCategory = 'CRITICAL';
    } else if (compositeRisk >= 0.20) {
      riskCategory = 'HIGH';
    } else if (compositeRisk >= 0.08) {
      riskCategory = 'MODERATE';
    }

    // Statutory rule verification
    const statutoryNotes: string[] = [];
    let statutoryThresholdBreached = false;

    // Check CERC Grid Code §5.2.1
    if (
      input.hazard.stormSurgeMeters > input.vulnerability.floodWallThresholdMeters &&
      input.vulnerability.elevationAmsl < 3.0
    ) {
      statutoryThresholdBreached = true;
      statutoryNotes.push(
        `CERC Grid Code §5.2.1 Breach: Surge (+${input.hazard.stormSurgeMeters}m) exceeds floodwall (+${input.vulnerability.floodWallThresholdMeters}m). Protective isolation required.`
      );
    }

    // Check NDMA SOP §4.2 (Hospital fuel cutoff)
    if (input.exposure.hasIcuOrEmergencyUnit && input.vulnerability.dieselFuelReserveHours < 12) {
      statutoryThresholdBreached = true;
      statutoryNotes.push(
        `NDMA SOP §4.2 Emergency Gate: Hospital ICU diesel reserve is ${input.vulnerability.dieselFuelReserveHours}h (< 12h mandate). Immediate fuel bowser dispatch required.`
      );
    }

    return {
      assetId: input.assetId,
      hazardScore: h.normalized,
      exposureScore: e.normalized,
      vulnerabilityScore: v.normalized,
      criticalityScore: c.normalized,
      compositeRisk,
      riskCategory,
      factors: {
        hazard: h,
        exposure: e,
        vulnerability: v,
        criticality: c,
      },
      statutoryThresholdBreached,
      statutoryNotes,
      deterministicFormulaProof: `R = H(${h.normalized}) × E(${e.normalized}) × V(${v.normalized}) × C(${c.normalized}) = ${compositeRisk}`,
      calculatedAt: new Date().toISOString(),
    };
  }
}
