/**
 * CycloNerveAI - Modular Agent Skills Definitions
 */

export interface AgentSkill {
  id: string;
  name: string;
  purpose: string;
  permittedTools: string[];
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  safetyRestrictions: string[];
  tokenBudget: number;
  failureBehavior: string;
}

export const AGENT_SKILLS: Record<string, AgentSkill> = {
  'cyclone-data': {
    id: 'cyclone-data',
    name: 'Cyclone Meteorological & Track Ingestion',
    purpose: 'Ingests IBTrACS and real-time IMD radar/meteorological feeds for tropical cyclones.',
    permittedTools: ['fetch_cyclone_track', 'get_radar_reflectivity', 'parse_gale_wind_radii'],
    inputSchema: { stormId: 'string', basin: 'string', timestampUtc: 'string' },
    outputSchema: { centralPressureHpa: 'number', sustainedWindKmh: 'number', eyeLat: 'number', eyeLng: 'number' },
    safetyRestrictions: ['Read-only data access', 'Strict timestamp validation against stale telemetry'],
    tokenBudget: 500,
    failureBehavior: 'Fallback to latest cached IMD bulletin with [FCST] stale warning tag',
  },
  'earth-engine-risk': {
    id: 'earth-engine-risk',
    name: 'Earth Engine Hydrological & SAR Risk Inversion',
    purpose: 'Queries Sentinel-1 SAR coherence and elevation rasters to generate flood risk polygons.',
    permittedTools: ['copernicus_sentinel1_query', 'srtm_elevation_profile', 'hydro_inundation_matcher'],
    inputSchema: { aoiBBox: 'array[number]', waterLevelAmsl: 'number' },
    outputSchema: { inundatedAreaKm2: 'number', estuarineOvertoppingMeters: 'number' },
    safetyRestrictions: ['No unconstrained geometry generation', 'Requires raster-to-vector clamp'],
    tokenBudget: 800,
    failureBehavior: 'Serve pre-rendered GEE GeoTIFF cache with [DERV] proxy designation',
  },
  'infrastructure-graph': {
    id: 'infrastructure-graph',
    name: 'Infrastructure Dependency Graph Engine',
    purpose: 'Maintains civil lifeline graph and traverses interdependencies to predict cascade depth.',
    permittedTools: ['networkx_graph_diffusion', 'scada_telemetry_fetch', 'detect_cycles'],
    inputSchema: { rootBreachNodeId: 'string', maxDepth: 'number' },
    outputSchema: { disruptedNodeIds: 'array[string]', affectedPopulation: 'number', icuRiskLevel: 'string' },
    safetyRestrictions: ['Cycle detection mandatory before traversal', 'Duplicate suppression enforced'],
    tokenBudget: 1200,
    failureBehavior: 'Execute deterministic BFS on static regional topology with [SIM] label',
  },
  'vulnerability-rules': {
    id: 'vulnerability-rules',
    name: 'Deterministic Vulnerability & Policy Ruleset',
    purpose: 'Applies statutory engineering thresholds (CERC Grid Code, NDMA SOP §4.2) without LLM drift.',
    permittedTools: ['check_cerc_substation_trip', 'validate_hospital_diesel_limit'],
    inputSchema: { assetType: 'string', waterLevel: 'number', gridLoad: 'number' },
    outputSchema: { tripImminent: 'boolean', thresholdBreachMeters: 'number', deterministicProof: 'string' },
    safetyRestrictions: ['Mathematical constraints cannot be relaxed by generative weights'],
    tokenBudget: 400,
    failureBehavior: 'Fail-safe state: assert maximum protective trip isolation',
  },
  'intervention-planning': {
    id: 'intervention-planning',
    name: 'Constrained Intervention Optimization',
    purpose: 'Solves Mixed-Integer Linear Program to rank pre-landfall resource dispatch under budget and time.',
    permittedTools: ['scipy_milp_solver', 'route_accessibility_evaluator', 'shelter_capacity_balancer'],
    inputSchema: { budgetCapUsd: 'number', leadTimeHours: 'number', availableTeams: 'number' },
    outputSchema: { rankedPlans: 'array[object]', avoidedLossUsd: 'number', paretoOptimality: 'string' },
    safetyRestrictions: ['Zero speculative cost assumptions', 'Route clearance check mandatory'],
    tokenBudget: 1500,
    failureBehavior: 'Return standard Plan Alpha triad contingency package',
  },
  'standard-operating-procedure-advisory': {
    id: 'standard-operating-procedure-advisory',
    name: 'Multilingual CAP Advisory Generator',
    purpose: 'Synthesizes OASIS CAP v1.2 warning alerts in English, Odia, Hindi, and Telugu.',
    permittedTools: ['cap_v1_2_formatter', 'hallucination_guardrail_validator'],
    inputSchema: { hazardSummary: 'string', targetDistricts: 'array[string]', cutOffTimes: 'object' },
    outputSchema: { capXml: 'string', localizedPayloads: 'object', allPassed: 'boolean' },
    safetyRestrictions: ['No autonomous public dispatch', 'Prohibited casualty claims scan mandatory'],
    tokenBudget: 2000,
    failureBehavior: 'Generate standard approved NDMA static emergency bulletin template',
  },
  'multilingual-terminology': {
    id: 'multilingual-terminology',
    name: 'Sovereign Disaster Lexicon Grounding',
    purpose: 'Enforces regional terminology consistency with IMD & State Disaster Management authority glossaries.',
    permittedTools: ['lexicon_parity_validator'],
    inputSchema: { textPayload: 'string', targetLang: 'string' },
    outputSchema: { verifiedText: 'string', matchConfidence: 'number' },
    safetyRestrictions: ['Zero speculative medical or triage advice'],
    tokenBudget: 600,
    failureBehavior: 'Lock to official Odia/Hindi disaster warning phrases',
  },
  'audit-and-evidence': {
    id: 'audit-and-evidence',
    name: 'Cryptographic Chain of Custody & Audit',
    purpose: 'Records all sensor inputs, tool invocations, and commander signatures to an append-only ledger.',
    permittedTools: ['sha256_merkle_hash', 'bigquery_audit_append', 'fido2_key_verifier'],
    inputSchema: { traceId: 'string', agentData: 'object' },
    outputSchema: { merkleHash: 'string', ledgerStatus: 'string' },
    safetyRestrictions: ['Append-only WORM policy', 'No PII or raw credentials in audit stream'],
    tokenBudget: 300,
    failureBehavior: 'Local cryptographic disk buffer with delayed ledger synchronization',
  },
};
