/**
 * CycloNerveAI - Domain Engine Type Definitions
 * Framework-independent domain interfaces, entities, and repository contracts.
 */

import {
  AssetSector,
  AssetStatus,
  DataProvenance,
  DependencyType,
  InfrastructureAsset,
  DependencyEdge,
  InterventionPlan,
  InterventionAction,
  UserRole,
} from '../shared/types/index.ts';

// -------------------------------------------------------------
// 1. Risk Scoring Types & Factor-Level Explanations
// -------------------------------------------------------------

export interface HazardParameters {
  sustainedWindKmh: number;
  gustsKmh: number;
  stormSurgeMeters: number;
  rain24hMm: number;
  distanceToEyeKm: number;
}

export interface ExposureParameters {
  populationServed: number;
  hasIcuOrEmergencyUnit: boolean;
  evacueeShelterHeadcount: number;
  directEconomicAssetValueUsd: number;
}

export interface VulnerabilityParameters {
  elevationAmsl: number;
  floodWallThresholdMeters: number;
  hasBackupDieselGenerator: boolean;
  dieselFuelReserveHours: number;
  buildingStructuralCodeCompliant: boolean;
  isCoastalZone1: boolean;
}

export interface CriticalityParameters {
  systemicDownstreamBranches: number;
  isSinglePointOfFailure: boolean;
  tierAnchorLevel: 1 | 2 | 3;
  servesEmergencyResponders: boolean;
}

export interface FactorBreakdown {
  raw: number;
  normalized: number; // 0.0 to 1.0
  weight: number;
  explanation: string;
  contributingMetrics: Record<string, number | string | boolean>;
}

export interface FactorExplanation {
  hazard: FactorBreakdown;
  exposure: FactorBreakdown;
  vulnerability: FactorBreakdown;
  criticality: FactorBreakdown;
}

export interface DetailedRiskScore {
  assetId: string;
  hazardScore: number; // H: 0.0 - 1.0
  exposureScore: number; // E: 0.0 - 1.0
  vulnerabilityScore: number; // V: 0.0 - 1.0
  criticalityScore: number; // C: 0.0 - 1.0
  compositeRisk: number; // H * E * V * C (0.0 - 1.0)
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: FactorExplanation;
  statutoryThresholdBreached: boolean;
  statutoryNotes: string[];
  deterministicFormulaProof: string;
  calculatedAt: string;
}

// -------------------------------------------------------------
// 2. Directed Infrastructure Graph & Cascade Propagation Types
// -------------------------------------------------------------

export interface GraphNode {
  asset: InfrastructureAsset;
  outDegree: number;
  inDegree: number;
  downstreamAssetIds: string[];
  upstreamAssetIds: string[];
}

export interface PropagationState {
  assetId: string;
  failedAtMinute: number;
  hopDistance: number;
  rootInitiatorId: string;
  propagationPath: string[];
  severedEdgeId?: string;
  failureTrigger: string;
}

export interface DuplicateSuppressionRecord {
  assetId: string;
  firstFailedAtHop: number;
  firstFailedAtMinute: number;
  suppressedRedundantTriggersCount: number;
  alternativeIncomingEdgeIds: string[];
}

export interface CyclePath {
  cycleLength: number;
  nodes: string[];
  edges: string[];
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycleCount: number;
  cycles: CyclePath[];
  isAcyclicDAG: boolean;
}

export interface CascadeStep {
  stepIndex: number;
  timeOffsetMinutes: number;
  label: string;
  description: string;
  newlyDisruptedAssetIds: string[];
  cumulativeDisruptedAssetIds: string[];
  cumulativeAffectedPopulation: number;
  compromisedSectors: AssetSector[];
  criticalLifelinesSevered: string[];
  suppressedDuplicateCount: number;
}

export interface CascadePropagationResult {
  rootFailedAssetId: string;
  totalHops: number;
  totalAssetsDisrupted: number;
  totalPopulationDarkened: number;
  isolatedSheltersCount: number;
  compromisedHospitalsCount: number;
  severedEdgeCount: number;
  steps: CascadeStep[];
  nodeStates: Map<string, PropagationState>;
  duplicateSuppressionLog: DuplicateSuppressionRecord[];
  cycleAudit: CycleDetectionResult;
  completedAt: string;
}

// -------------------------------------------------------------
// 3. Before-and-After Counterfactual & Constraint Ranking Types
// -------------------------------------------------------------

export interface CounterfactualMetrics {
  directLossEstimateUsd: number;
  indirectCascadingSpilloverUsd: number;
  totalEconomicImpactUsd: number;
  hospitalIcuUptimeLimitHours: number;
  darkZonePopulation: number;
  casualtyRiskBand: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  telecomCoveragePercentage: number;
  potableWaterServicePercentage: number;
}

export interface BeforeAfterComparison {
  scenarioId: string;
  planId: string;
  planCodename: string;
  statusQuoBaseline: CounterfactualMetrics;
  postInterventionProjection: CounterfactualMetrics;
  netBenefit: {
    avoidedLossUsd: number;
    riskReductionPercent: number;
    additionalGuaranteedIcuHours: number;
    shieldedPopulationCount: number;
    roiMultiplier: number;
  };
  actionsTaken: InterventionAction[];
  isParetoOptimal: boolean;
}

export interface OperationalConstraints {
  maxBudgetUsd: number;
  maxLeadTimeHours: number;
  landfallTimeWindowHours: number;
  availableTeamTypes: string[];
  mandatoryProtectedAssetIds?: string[];
}

export interface RankedInterventionPlan {
  plan: InterventionPlan;
  isFeasible: boolean;
  violatedConstraints: string[];
  paretoRank: number;
  roiMultiplier: number;
  riskReductionScore: number;
  implementationFeasibilityScore: number;
  recommendedOrder: number;
  reasoning: string;
}

// -------------------------------------------------------------
// 4. Repository Interfaces for Dependency Injection
// -------------------------------------------------------------

export interface IInfrastructureRepository {
  getAllAssets(): Promise<InfrastructureAsset[]>;
  getAssetById(id: string): Promise<InfrastructureAsset | null>;
  getAssetsBySector(sector: AssetSector): Promise<InfrastructureAsset[]>;
  updateAssetStatus(id: string, status: AssetStatus): Promise<boolean>;
}

export interface IDependencyRepository {
  getAllEdges(): Promise<DependencyEdge[]>;
  getEdgesFromSource(sourceId: string): Promise<DependencyEdge[]>;
  getEdgesToTarget(targetId: string): Promise<DependencyEdge[]>;
  getEdgeById(id: string): Promise<DependencyEdge | null>;
  severEdge(id: string, reason?: string): Promise<boolean>;
  restoreEdge(id: string): Promise<boolean>;
}

export interface IInterventionRepository {
  getAllPlans(): Promise<InterventionPlan[]>;
  getPlanById(id: string): Promise<InterventionPlan | null>;
  stagePlan(id: string): Promise<boolean>;
  executePlan(id: string, officerKeyId: string): Promise<boolean>;
}

export interface IScenarioRepository {
  getActiveScenarioMeta(): Promise<{
    id: string;
    name: string;
    category: string;
    centralPressureHpa: number;
    sustainedWindKmh: number;
    gustsKmh: number;
    stormSurgePeakMeters: number;
    actionWindowHours: number;
    hoursToLandfall: number;
  }>;
  changeScenario?(scenarioId: string, userRole: UserRole): Promise<{ success: boolean; error?: string }>;
}
