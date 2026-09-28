/**
 * CycloNerveAI - Agent Orchestration Types and Schemas
 * Standardized input/output schemas, telemetry records, and client interfaces for Gemini 3.7 Flash.
 */

export interface AgentTelemetry {
  traceId: string;
  model: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  thinkingTokens?: number;
  costUsd: number;
  cacheHit: boolean;
  timestamp: string;
}

export interface AgentConfig {
  modelName: string;
  timeoutMs: number;
  maxVerifierRetries: number; // Strictly 1 retry max as required
  killSwitchActive: boolean;
  temperature?: number;
}

// -------------------------------------------------------------
// 1. Multimodal Field Evidence Schemas
// -------------------------------------------------------------

export interface MultimodalEvidenceInput {
  evidenceId: string;
  title: string;
  imageMimeType: string;
  imageBase64: string; // Base64 encoded payload
  location: {
    lat: number;
    lng: number;
    description: string;
  };
  reporterRole: string;
  capturedAt: string;
}

export interface MultimodalDamageAssessment {
  evidenceId: string;
  damageLevel: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CATASTROPHIC';
  estimatedWaterDepthMeters: number;
  isInfrastructurePassable: boolean;
  identifiedHazards: string[];
  structuralIntegrityScore: number; // 0.0 to 1.0 (1.0 = undamaged)
  humanSafetyRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  keyObservation: string;
  confidence: number;
}

// -------------------------------------------------------------
// 2. Evidence Fusion Schemas
// -------------------------------------------------------------

export interface EvidenceFusionInput {
  cycloneMeta: {
    name: string;
    category: string;
    sustainedWindKmh: number;
    centralPressureHpa: number;
    surgePeakMeters: number;
    hoursToLandfall: number;
  };
  satelliteFloodExtentKm2: number;
  scadaBreachedNodes: string[];
  fieldAssessments: MultimodalDamageAssessment[];
}

export interface FusedEvidenceBrief {
  briefId: string;
  authoritativeSituationStatement: string;
  cycloneHazardSummary: string;
  inundationImpactSummary: string;
  infrastructureStatusSummary: string;
  fieldTruthCrossVerification: string;
  consensusConfidence: number; // 0.0 to 1.0
  generatedAt: string;
}

// -------------------------------------------------------------
// 3. Risk & Intervention Explanation Schemas
// -------------------------------------------------------------

export interface RiskExplanationInput {
  assetName: string;
  sector: string;
  compositeRisk: number; // H * E * V * C
  hazardIndex: number;
  exposureIndex: number;
  vulnerabilityIndex: number;
  criticalityIndex: number;
  populationServed: number;
  failureThresholds: {
    windGustKmh: number;
    inundationMeters: number;
  };
  statutoryNotes: string[];
}

export interface RiskExplanationOutput {
  assetName: string;
  headlineSummary: string;
  plainLanguageExplanation: string;
  whyArithmeticMatters: string;
  priorityMitigationAdvice: string;
  isStatutoryViolationActive: boolean;
}

export interface InterventionExplanationInput {
  selectedPlanCodename: string;
  riskReductionPercent: number;
  totalCostUsd: number;
  avoidedLossUsd: number;
  roiMultiplier: number;
  protectedIcuBeds: number;
  shieldedPopulation: number;
  criticalPathActions: Array<{
    title: string;
    targetAsset: string;
    leadTimeHours: number;
  }>;
  operationalTradeOff: string;
}

export interface InterventionExplanationOutput {
  planCodename: string;
  executiveBriefForCommander: string;
  strategicRationale: string;
  criticalPathBottleneckAnalysis: string;
  tradeOffSummary: string;
  suggestedEscrowBrief: string;
}

// -------------------------------------------------------------
// 4. Safety Verifier Schemas
// -------------------------------------------------------------

export interface SafetyVerificationInput {
  draftAdvisory: {
    headline: string;
    body: string;
    evacRoute: string;
    safeShelters: string[];
    helpline: string;
  };
  permittedDistricts: string[];
  mandatorySafeShelters: string[];
  officialCycloneCategory: string;
}

export interface SafetyVerificationResult {
  passed: boolean;
  prohibitedClaimsDetected: boolean; // Speculative death tolls, unverified alerts
  geographicBoundsValid: boolean;
  officialTerminologyValid: boolean;
  actionableLifelinesIncluded: boolean;
  violationReasons: string[];
  correctionGuidance?: string;
  verifiedAt: string;
}

// -------------------------------------------------------------
// 5. Multilingual Advisory Drafting Schemas
// -------------------------------------------------------------

export interface AdvisoryDraftingInput {
  cycloneName: string;
  category: string;
  landfallEstTimeIst: string;
  surgePeakMeters: number;
  targetDistricts: string[];
  safeCorridor: string;
  cutoffRoute: string;
  cutoffTimeIst: string;
  designatedShelters: string[];
  districtHelpline: string;
}

export interface LanguageAdvisoryContent {
  headline: string;
  body: string;
  keyInstructions: {
    evacRoute: string;
    safeShelters: string;
    hazardAlert: string;
    helpline: string;
  };
}

export interface MultilingualAdvisoryResult {
  advisoryCode: string;
  validFrom: string;
  validTo: string;
  targetDistricts: string[];
  english: LanguageAdvisoryContent;
  hindi: LanguageAdvisoryContent;
  telugu: LanguageAdvisoryContent;
  odia: LanguageAdvisoryContent;
  safetyVerified: boolean;
  retryCount: number; // 0 or 1
  isFallback: boolean;
  telemetry: AgentTelemetry;
}

// -------------------------------------------------------------
// 6. Generic Gemini Client Interface for Dependency Injection
// -------------------------------------------------------------

export interface GeminiStructuredRequest<T> {
  prompt: string;
  systemInstruction?: string;
  responseSchema?: Record<string, any>;
  images?: Array<{ mimeType: string; base64: string }>;
  temperature?: number;
}

export interface GeminiStructuredResponse<T> {
  data: T;
  rawText: string;
  telemetry: AgentTelemetry;
}

export interface IGeminiClient {
  generateStructured<T>(request: GeminiStructuredRequest<T>): Promise<GeminiStructuredResponse<T>>;
}
