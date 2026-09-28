/**
 * CycloNerveAI - Shared Type Definitions
 * Neuro-Symbolic Cyclone Cascade Intelligence and Anticipatory Action Platform
 */

export type DataClassification = 'observed' | 'forecast' | 'derived' | 'simulated';

export interface DataProvenance {
  id: string;
  source: string;
  sourceType: string;
  observedAt: string;
  ingestedAt: string;
  geographicCoverage: string;
  classification: DataClassification;
  confidence: number; // 0 to 1
  freshness: string; // e.g. "3m ago"
  isSimulated: boolean;
  version: string;
}

export type UserRole =
  | 'Viewer'
  | 'Analyst'
  | 'Field Officer'
  | 'Incident Commander'
  | 'Administrator';

export interface UserSession {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  token2FAValid: boolean;
  jurisdiction: string;
  fipsKeyId?: string;
}

export type AssetSector =
  | 'power'
  | 'health'
  | 'telecom'
  | 'transport'
  | 'water'
  | 'shelter';

export type AssetStatus = 'nominal' | 'threatened' | 'breached' | 'offline' | 'safeguarded';

export interface InfrastructureAsset extends DataProvenance {
  assetId: string;
  name: string;
  sector: AssetSector;
  subtype: string; // e.g. '220/33kV Substation', 'District Hospital', 'BTS Tower', 'Causeway Bridge'
  coordinates: {
    lat: number;
    lng: number;
  };
  elevationAmsl: number; // Meters above mean sea level
  status: AssetStatus;
  criticality: number; // 0 to 10 scale
  populationServed: number;
  specs: Record<string, string | number | boolean>;
  telemetry?: {
    lastReading: string;
    metrics: Record<string, number | string>;
  };
  failureThresholds: {
    windGustKmh: number;
    inundationMeters: number;
  };
}

export type DependencyType =
  | 'power_feed'
  | 'road_access'
  | 'telecom_backhaul'
  | 'potable_water'
  | 'emergency_dispatch';

export interface DependencyEdge {
  id: string;
  sourceAssetId: string;
  targetAssetId: string;
  dependencyType: DependencyType;
  propagationLatencyMinutes: number;
  failureTransferProbability: number; // 0 to 1
  isSevered: boolean;
  severedReason?: string;
  isSimulated: boolean;
}

export interface RiskCalculation {
  assetId: string;
  hazard: number; // 0 to 1
  exposure: number; // 0 to 1
  vulnerability: number; // 0 to 1
  criticality: number; // 0 to 1
  compositeRisk: number; // H * E * V * C (0 to 1)
  contributingFactors: string[];
  confidence: number;
  timestamp: string;
  isSimulated: boolean;
}

export interface CascadeSimulationStep {
  stepIndex: number;
  timestampOffsetMinutes: number; // e.g. 0, 15, 30, 90, 180
  label: string;
  description: string;
  newlyAffectedAssetIds: string[];
  totalCumulativeAffectedPopulation: number;
  criticalServicesCompromised: string[];
  sectorImpactSummaries: Record<AssetSector, string>;
}

export interface CascadeSimulationResult {
  initiatingAssetId: string;
  scenarioName: string;
  maxCascadeDepth: number;
  indirectImpactMultiplier: number;
  totalPopulationDarkZone: number;
  directLossEstimateUsd: number;
  indirectSpilloverLossUsd: number;
  hospitalUptimeLimitHours: number;
  steps: CascadeSimulationStep[];
  affectedAssetIds: string[];
  disconnectedShelterIds: string[];
  beforeAfterComparison: {
    statusQuo: {
      directLossUsd: number;
      cascadingLossUsd: number;
      icuLimitHours: number;
      darkZonePopulation: number;
      casualtyRiskBand: 'LOW' | 'MODERATE' | 'HIGH';
      casualtyEstimateRange: [number, number];
    };
    withPlan: {
      mobilizationCostUsd: number;
      cascadingLossesPreventedUsd: number;
      guaranteedIcuHours: number;
      commsContinuityPercent: number;
      expectedCasualties: 0;
      riskReductionPercent: number;
    };
  };
  symbolicRuleVerified: {
    ruleId: string;
    standard: string;
    conditionText: string;
    isVerified: boolean;
    determinism: string;
  };
}

export interface InterventionAction {
  id: string;
  order: number;
  title: string;
  description: string;
  targetAssetId: string;
  requiredTeamType: string;
  leadTimeHours: number;
  arrivalWindowHours: number;
  costUsd: number;
  status: 'ready' | 'staged' | 'in_transit' | 'deployed' | 'completed';
  isCriticalPath: boolean;
}

export interface InterventionPlan {
  id: string;
  rank: number;
  codename: string;
  title: string;
  summary: string;
  riskReductionPercent: number;
  confidencePercent: number;
  totalCostUsd: number;
  avoidedLossUsd: number;
  roiMultiplier: number;
  protectedIcuBeds: number;
  shieldedPopulation: number;
  safeguardedFeeders: number;
  committedUnitsSummary: string;
  operationalTradeOff: string;
  requires2FA: boolean;
  actions: InterventionAction[];
  isStaged: boolean;
  isExecuted: boolean;
}

export interface MultilingualAdvisoryDraft extends DataProvenance {
  advisoryCode: string; // e.g. "ADV-2025-089-REV2"
  priority: 'ROUTINE' | 'HIGH PRIORITY' | 'CRITICAL' | 'OPERATIONAL';
  targetDistricts: string[];
  validFrom: string;
  validTo: string;
  estimatedReach: number;
  versions: {
    en: { headline: string; body: string };
    or: { headline: string; body: string }; // Odia
    hi: { headline: string; body: string }; // Hindi
    te: { headline: string; body: string }; // Telugu
  };
  keyInstructions: {
    evacRoute: string;
    safeShelters: string[];
    helpline: string;
    hazardAlert: string;
  };
  safetyGuardrails: {
    prohibitedClaimsCheck: boolean;
    geographicPrecisionCheck: boolean;
    terminologyConsistencyCheck: boolean;
    actionableLifelinesCheck: boolean;
    allPassed: boolean;
  };
  approvalStatus: 'draft' | 'pending_2fa' | 'approved' | 'rejected' | 'returned_for_revision';
  approver?: {
    officerName: string;
    role: string;
    timestamp: string;
    fido2KeyId: string;
    comment?: string;
  };
  channelsArmed: {
    cellBroadcast: boolean;
    smsGateway: boolean;
    municipalSirens: boolean;
    whatsAppBot: boolean;
    controlRoomLed: boolean;
  };
  isDispatched: boolean;
}

export interface AuditTraceEvent {
  traceId: string;
  scenarioId: string;
  timestamp: string;
  agentName: string;
  toolName: string;
  inputSource: string;
  outputStatus: 'SUCCESS' | 'INTERCEPTED' | 'REPROMPTED' | 'SEALED';
  latencyMs: number;
  tokenMetrics: {
    inputTokens: number;
    cachedTokens: number;
    outputTokens: number;
    thinkingTokens?: number;
    costUsd: number;
  };
  cacheHit: boolean;
  validationResult: 'PASSED' | 'FLAGGED' | 'MODIFIED';
  guardrailNote?: string;
  approvalStatus: string;
  merkleHash: string;
  signedBy?: string;
  toolPayloadDigest?: string;
}

export type ResilienceTier =
  | 'TIER_0_CLOUD_EDGE'
  | 'TIER_1_CLOUD_DEGRADED'
  | 'TIER_2_SATELLITE_ONLY'
  | 'TIER_3_AIR_GAPPED';

export interface SystemHealthState {
  currentTier: ResilienceTier;
  degradedModeActive: boolean;
  earthEngineStatus: number; // e.g. 99.98%
  bigQueryActive: boolean;
  neuroSymbolicEngineNominal: boolean;
  satcomLatencyMs: number;
  inmarsatPingMs: number;
  starlinkPingMs: number;
  wanPacketLossPercent: number;
  activeServiceCount: number;
  totalServiceCount: number;
  merkleQuorum: [number, number]; // [5, 5]
  edgeHardware: {
    gpuTempC: number;
    gpuUtilPercent: number;
    localCacheTb: [number, number];
    upsBatteryPercent: number;
    upsRuntimeHours: number;
    vhfWattage: number;
  };
}
