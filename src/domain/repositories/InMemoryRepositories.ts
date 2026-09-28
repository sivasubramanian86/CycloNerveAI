/**
 * CycloNerveAI - In-Memory Repository Implementations
 * Provides default production and test fixtures implementing domain repository contracts.
 */

import {
  IDependencyRepository,
  IInfrastructureRepository,
  IInterventionRepository,
  IScenarioRepository,
} from '../types.ts';
import {
  ACTIVE_SCENARIO_META,
  SCENARIO_ASSETS,
  SCENARIO_EDGES,
  SCENARIO_INTERVENTION_PLANS,
} from '../../data/coastalScenarioData.ts';
import {
  AssetSector,
  AssetStatus,
  DependencyEdge,
  InfrastructureAsset,
  InterventionPlan,
} from '../../shared/types/index.ts';

export class InMemoryInfrastructureRepository implements IInfrastructureRepository {
  private assets: Map<string, InfrastructureAsset>;

  constructor(initialAssets: InfrastructureAsset[] = SCENARIO_ASSETS) {
    this.assets = new Map(initialAssets.map((a) => [a.assetId, JSON.parse(JSON.stringify(a))]));
  }

  public async getAllAssets(): Promise<InfrastructureAsset[]> {
    return Array.from(this.assets.values());
  }

  public async getAssetById(id: string): Promise<InfrastructureAsset | null> {
    return this.assets.get(id) || null;
  }

  public async getAssetsBySector(sector: AssetSector): Promise<InfrastructureAsset[]> {
    return Array.from(this.assets.values()).filter((a) => a.sector === sector);
  }

  public async updateAssetStatus(id: string, status: AssetStatus): Promise<boolean> {
    const asset = this.assets.get(id);
    if (!asset) return false;
    asset.status = status;
    return true;
  }
}

export class InMemoryDependencyRepository implements IDependencyRepository {
  private edges: Map<string, DependencyEdge>;

  constructor(initialEdges: DependencyEdge[] = SCENARIO_EDGES) {
    this.edges = new Map(initialEdges.map((e) => [e.id, JSON.parse(JSON.stringify(e))]));
  }

  public async getAllEdges(): Promise<DependencyEdge[]> {
    return Array.from(this.edges.values());
  }

  public async getEdgesFromSource(sourceId: string): Promise<DependencyEdge[]> {
    return Array.from(this.edges.values()).filter((e) => e.sourceAssetId === sourceId);
  }

  public async getEdgesToTarget(targetId: string): Promise<DependencyEdge[]> {
    return Array.from(this.edges.values()).filter((e) => e.targetAssetId === targetId);
  }

  public async getEdgeById(id: string): Promise<DependencyEdge | null> {
    return this.edges.get(id) || null;
  }

  public async severEdge(id: string, reason?: string): Promise<boolean> {
    const edge = this.edges.get(id);
    if (!edge) return false;
    edge.isSevered = true;
    if (reason) edge.severedReason = reason;
    return true;
  }

  public async restoreEdge(id: string): Promise<boolean> {
    const edge = this.edges.get(id);
    if (!edge) return false;
    edge.isSevered = false;
    return true;
  }
}

export class InMemoryInterventionRepository implements IInterventionRepository {
  private plans: Map<string, InterventionPlan>;

  constructor(initialPlans: InterventionPlan[] = SCENARIO_INTERVENTION_PLANS) {
    this.plans = new Map(initialPlans.map((p) => [p.id, JSON.parse(JSON.stringify(p))]));
  }

  public async getAllPlans(): Promise<InterventionPlan[]> {
    return Array.from(this.plans.values());
  }

  public async getPlanById(id: string): Promise<InterventionPlan | null> {
    return this.plans.get(id) || null;
  }

  public async stagePlan(id: string): Promise<boolean> {
    for (const plan of this.plans.values()) {
      plan.isStaged = plan.id === id;
    }
    return this.plans.has(id);
  }

  public async executePlan(id: string, officerKeyId: string): Promise<boolean> {
    const plan = this.plans.get(id);
    if (!plan) return false;
    plan.isExecuted = true;
    return true;
  }
}

export class InMemoryScenarioRepository implements IScenarioRepository {
  public async getActiveScenarioMeta() {
    return {
      id: ACTIVE_SCENARIO_META.id,
      name: ACTIVE_SCENARIO_META.name,
      category: ACTIVE_SCENARIO_META.category,
      centralPressureHpa: ACTIVE_SCENARIO_META.centralPressureHpa,
      sustainedWindKmh: ACTIVE_SCENARIO_META.sustainedWindKmh,
      gustsKmh: ACTIVE_SCENARIO_META.gustsKmh,
      stormSurgePeakMeters: ACTIVE_SCENARIO_META.stormSurgePeakMeters,
      actionWindowHours: ACTIVE_SCENARIO_META.actionWindowHours,
      hoursToLandfall: ACTIVE_SCENARIO_META.hoursToLandfall,
    };
  }
}
