/**
 * CycloNerveAI - Comprehensive Domain Engines Unit Test Suite
 * Tests deterministic risk scoring, graph cascade propagation, cycle detection,
 * duplicate suppression, counterfactual comparison, and constraint-based ranking.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  RiskScoringEngine,
  InfrastructureGraphEngine,
  InterventionEngine,
  InMemoryInfrastructureRepository,
  InMemoryDependencyRepository,
  InMemoryInterventionRepository,
} from '../src/domain/index.ts';
import { DependencyEdge, InfrastructureAsset } from '../src/shared/types/index.ts';

describe('1. Risk Scoring Engine (Deterministic Math & Explanations)', () => {
  const engine = new RiskScoringEngine();

  it('calculates deterministic composite risk strictly as H * E * V * C', () => {
    const result = engine.computeRisk({
      assetId: 'SUB-TEST-01',
      hazard: {
        sustainedWindKmh: 195,
        gustsKmh: 230,
        stormSurgeMeters: 3.6,
        rain24hMm: 280,
        distanceToEyeKm: 15,
      },
      exposure: {
        populationServed: 184200,
        hasIcuOrEmergencyUnit: false,
        evacueeShelterHeadcount: 0,
        directEconomicAssetValueUsd: 14000000,
      },
      vulnerability: {
        elevationAmsl: 1.9,
        floodWallThresholdMeters: 2.7,
        hasBackupDieselGenerator: false,
        dieselFuelReserveHours: 0,
        buildingStructuralCodeCompliant: true,
        isCoastalZone1: true,
      },
      criticality: {
        systemicDownstreamBranches: 8,
        isSinglePointOfFailure: true,
        tierAnchorLevel: 1,
        servesEmergencyResponders: true,
      },
    });

    assert.ok(result.compositeRisk >= 0 && result.compositeRisk <= 1.0);
    const expected =
      Math.round(
        result.hazardScore *
          result.exposureScore *
          result.vulnerabilityScore *
          result.criticalityScore *
          1000
      ) / 1000;
    assert.equal(result.compositeRisk, expected);
    assert.equal(result.riskCategory, 'CRITICAL');
  });

  it('exposes factor-level explanations with physical units', () => {
    const result = engine.computeRisk({
      assetId: 'HOSP-TEST-01',
      hazard: {
        sustainedWindKmh: 150,
        gustsKmh: 180,
        stormSurgeMeters: 1.5,
        rain24hMm: 120,
        distanceToEyeKm: 45,
      },
      exposure: {
        populationServed: 45000,
        hasIcuOrEmergencyUnit: true,
        evacueeShelterHeadcount: 0,
        directEconomicAssetValueUsd: 8000000,
      },
      vulnerability: {
        elevationAmsl: 5.5,
        floodWallThresholdMeters: 4.0,
        hasBackupDieselGenerator: true,
        dieselFuelReserveHours: 8, // < 12h triggers NDMA gate
        buildingStructuralCodeCompliant: true,
        isCoastalZone1: false,
      },
      criticality: {
        systemicDownstreamBranches: 2,
        isSinglePointOfFailure: false,
        tierAnchorLevel: 1,
        servesEmergencyResponders: true,
      },
    });

    assert.ok(result.factors.hazard.explanation.includes('km/h wind'));
    assert.ok(result.factors.exposure.explanation.includes('Tier-1 ICU unit present'));
    assert.ok(result.factors.vulnerability.explanation.includes('8h DG fuel reserve'));
    assert.equal(result.statutoryThresholdBreached, true);
    assert.ok(result.statutoryNotes.some((n) => n.includes('NDMA SOP §4.2')));
  });

  it('triggers CERC Grid Code statutory breach when surge overtopping exceeds floodwall', () => {
    const result = engine.computeRisk({
      assetId: 'SUB-DYKE-BREACH',
      hazard: {
        sustainedWindKmh: 200,
        gustsKmh: 240,
        stormSurgeMeters: 3.8,
        rain24hMm: 200,
        distanceToEyeKm: 10,
      },
      exposure: {
        populationServed: 50000,
        hasIcuOrEmergencyUnit: false,
        evacueeShelterHeadcount: 0,
        directEconomicAssetValueUsd: 10000000,
      },
      vulnerability: {
        elevationAmsl: 2.1,
        floodWallThresholdMeters: 2.5, // 3.8m surge > 2.5m floodwall!
        hasBackupDieselGenerator: true,
        dieselFuelReserveHours: 24,
        buildingStructuralCodeCompliant: true,
        isCoastalZone1: true,
      },
      criticality: {
        systemicDownstreamBranches: 4,
        isSinglePointOfFailure: true,
        tierAnchorLevel: 1,
        servesEmergencyResponders: false,
      },
    });

    assert.equal(result.statutoryThresholdBreached, true);
    assert.ok(result.statutoryNotes.some((n) => n.includes('CERC Grid Code §5.2.1')));
  });
});

describe('2. Infrastructure Graph & Cycle Detection Engine', () => {
  it('confirms coastal scenario baseline dependency graph is an acyclic DAG', async () => {
    const infraRepo = new InMemoryInfrastructureRepository();
    const edgeRepo = new InMemoryDependencyRepository();
    const graphEngine = new InfrastructureGraphEngine(infraRepo, edgeRepo);

    const audit = await graphEngine.detectCycles();
    assert.equal(audit.hasCycle, false);
    assert.equal(audit.isAcyclicDAG, true);
    assert.equal(audit.cycleCount, 0);
  });

  it('detects cycles and identifies exact loop path when a circular dependency is introduced', async () => {
    const mockAssets: InfrastructureAsset[] = [
      {
        id: 'A1',
        assetId: 'NODE-A',
        source: 'TEST',
        sourceType: 'TEST',
        observedAt: '',
        ingestedAt: '',
        geographicCoverage: '',
        classification: 'simulated',
        confidence: 1,
        freshness: '',
        isSimulated: true,
        version: '1',
        name: 'Node A',
        sector: 'power',
        subtype: '',
        coordinates: { lat: 20, lng: 86 },
        elevationAmsl: 5,
        status: 'nominal',
        criticality: 5,
        populationServed: 100,
        specs: {},
        failureThresholds: { windGustKmh: 200, inundationMeters: 3 },
      },
      {
        id: 'A2',
        assetId: 'NODE-B',
        source: 'TEST',
        sourceType: 'TEST',
        observedAt: '',
        ingestedAt: '',
        geographicCoverage: '',
        classification: 'simulated',
        confidence: 1,
        freshness: '',
        isSimulated: true,
        version: '1',
        name: 'Node B',
        sector: 'telecom',
        subtype: '',
        coordinates: { lat: 20, lng: 86 },
        elevationAmsl: 5,
        status: 'nominal',
        criticality: 5,
        populationServed: 100,
        specs: {},
        failureThresholds: { windGustKmh: 200, inundationMeters: 3 },
      },
      {
        id: 'A3',
        assetId: 'NODE-C',
        source: 'TEST',
        sourceType: 'TEST',
        observedAt: '',
        ingestedAt: '',
        geographicCoverage: '',
        classification: 'simulated',
        confidence: 1,
        freshness: '',
        isSimulated: true,
        version: '1',
        name: 'Node C',
        sector: 'water',
        subtype: '',
        coordinates: { lat: 20, lng: 86 },
        elevationAmsl: 5,
        status: 'nominal',
        criticality: 5,
        populationServed: 100,
        specs: {},
        failureThresholds: { windGustKmh: 200, inundationMeters: 3 },
      },
    ];

    // Circular loop: A -> B -> C -> A
    const cyclicEdges: DependencyEdge[] = [
      {
        id: 'E-AB',
        sourceAssetId: 'NODE-A',
        targetAssetId: 'NODE-B',
        dependencyType: 'power_feed',
        propagationLatencyMinutes: 10,
        failureTransferProbability: 1.0,
        isSevered: false,
        isSimulated: true,
      },
      {
        id: 'E-BC',
        sourceAssetId: 'NODE-B',
        targetAssetId: 'NODE-C',
        dependencyType: 'telecom_backhaul',
        propagationLatencyMinutes: 10,
        failureTransferProbability: 1.0,
        isSevered: false,
        isSimulated: true,
      },
      {
        id: 'E-CA',
        sourceAssetId: 'NODE-C',
        targetAssetId: 'NODE-A', // Closes cycle!
        dependencyType: 'emergency_dispatch',
        propagationLatencyMinutes: 10,
        failureTransferProbability: 1.0,
        isSevered: false,
        isSimulated: true,
      },
    ];

    const infraRepo = new InMemoryInfrastructureRepository(mockAssets);
    const edgeRepo = new InMemoryDependencyRepository(cyclicEdges);
    const graphEngine = new InfrastructureGraphEngine(infraRepo, edgeRepo);

    const audit = await graphEngine.detectCycles();
    assert.equal(audit.hasCycle, true);
    assert.equal(audit.isAcyclicDAG, false);
    assert.ok(audit.cycleCount >= 1);
    assert.deepEqual(audit.cycles[0].nodes, ['NODE-A', 'NODE-B', 'NODE-C', 'NODE-A']);
  });
});

describe('3. Duplicate-Impact Prevention & Cascade Propagation', () => {
  it('suppresses duplicate impacts in a diamond dependency graph', async () => {
    // Diamond Topology:
    //      Root (A)
    //     /        \
    //  Left (B)   Right (C)
    //     \        /
    //      Sink (D)
    const mockAssets: InfrastructureAsset[] = ['A', 'B', 'C', 'D'].map((name) => ({
      id: `id-${name}`,
      assetId: `NODE-${name}`,
      source: 'TEST',
      sourceType: 'TEST',
      observedAt: '',
      ingestedAt: '',
      geographicCoverage: '',
      classification: 'simulated',
      confidence: 1,
      freshness: '',
      isSimulated: true,
      version: '1',
      name: `Asset ${name}`,
      sector: 'power',
      subtype: '',
      coordinates: { lat: 20, lng: 86 },
      elevationAmsl: 5,
      status: 'nominal',
      criticality: 6,
      populationServed: 1000,
      specs: {},
      failureThresholds: { windGustKmh: 200, inundationMeters: 3 },
    }));

    const diamondEdges: DependencyEdge[] = [
      {
        id: 'E-AB',
        sourceAssetId: 'NODE-A',
        targetAssetId: 'NODE-B',
        dependencyType: 'power_feed',
        propagationLatencyMinutes: 5,
        failureTransferProbability: 1.0,
        isSevered: false,
        isSimulated: true,
      },
      {
        id: 'E-AC',
        sourceAssetId: 'NODE-A',
        targetAssetId: 'NODE-C',
        dependencyType: 'power_feed',
        propagationLatencyMinutes: 10,
        failureTransferProbability: 1.0,
        isSevered: false,
        isSimulated: true,
      },
      {
        id: 'E-BD',
        sourceAssetId: 'NODE-B',
        targetAssetId: 'NODE-D',
        dependencyType: 'power_feed',
        propagationLatencyMinutes: 5, // D fails at 5+5 = 10m
        failureTransferProbability: 1.0,
        isSevered: false,
        isSimulated: true,
      },
      {
        id: 'E-CD',
        sourceAssetId: 'NODE-C',
        targetAssetId: 'NODE-D', // Second path to D (10+5 = 15m)
        dependencyType: 'power_feed',
        propagationLatencyMinutes: 5,
        failureTransferProbability: 1.0,
        isSevered: false,
        isSimulated: true,
      },
    ];

    const infraRepo = new InMemoryInfrastructureRepository(mockAssets);
    const edgeRepo = new InMemoryDependencyRepository(diamondEdges);
    const graphEngine = new InfrastructureGraphEngine(infraRepo, edgeRepo);

    const result = await graphEngine.simulateCascade({ rootFailedAssetId: 'NODE-A' });

    // D should fail exactly once (total 4 disrupted assets: A, B, C, D)
    assert.equal(result.totalAssetsDisrupted, 4);

    // Node D should be logged in duplicate suppression log
    assert.equal(result.duplicateSuppressionLog.length, 1);
    assert.equal(result.duplicateSuppressionLog[0].assetId, 'NODE-D');
    assert.equal(result.duplicateSuppressionLog[0].suppressedRedundantTriggersCount, 1);

    // Total population affected must sum each node exactly once (4 * 1000 = 4000)
    assert.equal(result.totalPopulationDarkened, 4000);
  });

  it('accurately simulates multi-step cascade for coastal scenario from Dhamra Substation', async () => {
    const infraRepo = new InMemoryInfrastructureRepository();
    const edgeRepo = new InMemoryDependencyRepository();
    const graphEngine = new InfrastructureGraphEngine(infraRepo, edgeRepo);

    const result = await graphEngine.simulateCascade({
      rootFailedAssetId: 'SUB-OD-DH01',
      maxHops: 6,
    });

    assert.equal(result.rootFailedAssetId, 'SUB-OD-DH01');
    assert.ok(result.totalAssetsDisrupted >= 4);
    assert.ok(result.totalPopulationDarkened >= 180000);
    assert.ok(result.steps.length >= 3);
  });
});

describe('4. Counterfactual Before-and-After & Constraint Ranking Engine', () => {
  it('computes before-and-after net benefit and ROI multiplier for Plan Alpha', async () => {
    const infraRepo = new InMemoryInfrastructureRepository();
    const edgeRepo = new InMemoryDependencyRepository();
    const interventionRepo = new InMemoryInterventionRepository();
    const interventionEngine = new InterventionEngine(infraRepo, edgeRepo, interventionRepo);

    const comparison = await interventionEngine.compareBeforeAndAfter({
      planId: 'PLAN-ALPHA-01',
    });

    assert.equal(comparison.planId, 'PLAN-ALPHA-01');
    assert.equal(comparison.planCodename, 'Plan Alpha');
    assert.ok(comparison.netBenefit.avoidedLossUsd > 0);
    assert.equal(comparison.postInterventionProjection.hospitalIcuUptimeLimitHours, 72.0);
    assert.equal(comparison.postInterventionProjection.casualtyRiskBand, 'LOW');
    assert.ok(comparison.netBenefit.roiMultiplier > 30);
  });

  it('ranks plans deterministically and flags constraint violations when budget or time is restricted', async () => {
    const infraRepo = new InMemoryInfrastructureRepository();
    const edgeRepo = new InMemoryDependencyRepository();
    const interventionRepo = new InMemoryInterventionRepository();
    const interventionEngine = new InterventionEngine(infraRepo, edgeRepo, interventionRepo);

    // Case A: Generous budget ($250k) and ample lead time (12h)
    const normalRankings = await interventionEngine.rankInterventions({
      maxBudgetUsd: 250000,
      maxLeadTimeHours: 12.0,
      landfallTimeWindowHours: 12.0,
      availableTeamTypes: ['Heavy Logistics', 'ODRAF', 'SATCOM', 'ALS Ambulance'],
    });

    assert.equal(normalRankings[0].plan.id, 'PLAN-ALPHA-01');
    assert.equal(normalRankings[0].isFeasible, true);

    // Case B: Severe budget restriction ($50,000)
    // Plan Alpha ($180k) and Plan Bravo ($95k) must be flagged infeasible, Plan Charlie ($35k) ranks first
    const budgetConstrainedRankings = await interventionEngine.rankInterventions({
      maxBudgetUsd: 50000,
      maxLeadTimeHours: 12.0,
      landfallTimeWindowHours: 12.0,
      availableTeamTypes: ['Civil Defense', 'Heavy Logistics', 'ODRAF', 'SATCOM'],
    });

    assert.equal(budgetConstrainedRankings[0].plan.id, 'PLAN-CHARLIE-03');
    assert.equal(budgetConstrainedRankings[0].isFeasible, true);

    const alphaPlan = budgetConstrainedRankings.find((r) => r.plan.id === 'PLAN-ALPHA-01')!;
    assert.equal(alphaPlan.isFeasible, false);
    assert.ok(alphaPlan.violatedConstraints.some((c) => c.includes('Budget exceeded')));
  });
});
