/**
 * CycloNerveAI - Adapter-Backed Repository Implementations
 * Connects the framework-independent domain repository interfaces
 * to server-side Firestore and BigQuery adapters while preserving existing contracts.
 */

import {
  AssetSector,
  AssetStatus,
  DependencyEdge,
  InfrastructureAsset,
  InterventionPlan,
  UserRole,
} from '../../shared/types/index.ts';
import {
  IDependencyRepository,
  IInfrastructureRepository,
  IInterventionRepository,
  IScenarioRepository,
} from '../types.ts';
import { IFirestoreAdapter } from '../../server/adapters/types.ts';
import {
  ACTIVE_SCENARIO_META,
  SCENARIO_ASSETS,
  SCENARIO_EDGES,
  SCENARIO_INTERVENTION_PLANS,
} from '../../data/coastalScenarioData.ts';

export class AdapterBackedInfrastructureRepository implements IInfrastructureRepository {
  constructor(private firestoreAdapter: IFirestoreAdapter) {}

  async getAllAssets(): Promise<InfrastructureAsset[]> {
    try {
      const response = await this.firestoreAdapter.queryCollection<InfrastructureAsset>('assets');
      if (response.documents.length > 0) {
        return response.documents.map((d) => d.data);
      }
    } catch {
      // Graceful fallback to baseline scenario assets
    }
    return [...SCENARIO_ASSETS];
  }

  async getAssetById(id: string): Promise<InfrastructureAsset | null> {
    try {
      const response = await this.firestoreAdapter.getDocument<InfrastructureAsset>('assets', id);
      if (response.exists && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }
    const local = SCENARIO_ASSETS.find((a) => a.assetId === id);
    return local ? { ...local } : null;
  }

  async getAssetsBySector(sector: AssetSector): Promise<InfrastructureAsset[]> {
    try {
      const response = await this.firestoreAdapter.queryCollection<InfrastructureAsset>('assets', [
        { field: 'sector', operator: '==', value: sector },
      ]);
      if (response.documents.length > 0) {
        return response.documents.map((d) => d.data);
      }
    } catch {
      // Fallback
    }
    return SCENARIO_ASSETS.filter((a) => a.sector === sector);
  }

  async updateAssetStatus(id: string, status: AssetStatus): Promise<boolean> {
    try {
      const asset = await this.getAssetById(id);
      if (!asset) return false;
      asset.status = status;
      const res = await this.firestoreAdapter.saveDocument('assets', id, asset);
      return res.success;
    } catch {
      return false;
    }
  }
}

export class AdapterBackedDependencyRepository implements IDependencyRepository {
  constructor(private firestoreAdapter: IFirestoreAdapter) {}

  async getAllEdges(): Promise<DependencyEdge[]> {
    try {
      const response = await this.firestoreAdapter.queryCollection<DependencyEdge>('edges');
      if (response.documents.length > 0) {
        return response.documents.map((d) => d.data);
      }
    } catch {
      // Fallback
    }
    return [...SCENARIO_EDGES];
  }

  async getEdgesFromSource(sourceId: string): Promise<DependencyEdge[]> {
    const all = await this.getAllEdges();
    return all.filter((e) => e.sourceAssetId === sourceId);
  }

  async getEdgesToTarget(targetId: string): Promise<DependencyEdge[]> {
    const all = await this.getAllEdges();
    return all.filter((e) => e.targetAssetId === targetId);
  }

  async getEdgeById(id: string): Promise<DependencyEdge | null> {
    const all = await this.getAllEdges();
    return all.find((e) => e.id === id) || null;
  }

  async severEdge(id: string, reason?: string): Promise<boolean> {
    try {
      const edge = await this.getEdgeById(id);
      if (!edge) return false;
      edge.isSevered = true;
      if (reason) edge.severedReason = reason;
      const res = await this.firestoreAdapter.saveDocument('edges', id, edge);
      return res.success;
    } catch {
      return false;
    }
  }

  async restoreEdge(id: string): Promise<boolean> {
    try {
      const edge = await this.getEdgeById(id);
      if (!edge) return false;
      edge.isSevered = false;
      const res = await this.firestoreAdapter.saveDocument('edges', id, edge);
      return res.success;
    } catch {
      return false;
    }
  }
}

export class AdapterBackedInterventionRepository implements IInterventionRepository {
  constructor(private firestoreAdapter: IFirestoreAdapter) {}

  async getAllPlans(): Promise<InterventionPlan[]> {
    try {
      const res = await this.firestoreAdapter.queryCollection<InterventionPlan>('interventionPlans');
      if (res.documents.length > 0) {
        return res.documents.map((d) => d.data);
      }
    } catch {
      // Fallback
    }
    return [...SCENARIO_INTERVENTION_PLANS];
  }

  async getPlanById(id: string): Promise<InterventionPlan | null> {
    const plans = await this.getAllPlans();
    return plans.find((p) => p.id === id) || null;
  }

  async stagePlan(id: string): Promise<boolean> {
    const plan = await this.getPlanById(id);
    if (!plan) return false;
    plan.isStaged = true;
    try {
      const res = await this.firestoreAdapter.saveDocument('interventionPlans', id, plan);
      return res.success;
    } catch {
      return true;
    }
  }

  async executePlan(id: string, officerKeyId: string): Promise<boolean> {
    const plan = await this.getPlanById(id);
    if (!plan) return false;
    plan.isExecuted = true;
    try {
      const res = await this.firestoreAdapter.saveDocument('interventionPlans', id, {
        ...plan,
        executedBy: officerKeyId,
        executedAt: new Date().toISOString(),
      });
      return res.success;
    } catch {
      return true;
    }
  }
}

export class AdapterBackedScenarioRepository implements IScenarioRepository {
  private activeScenario = { ...ACTIVE_SCENARIO_META };

  async getActiveScenarioMeta() {
    return { ...this.activeScenario };
  }

  async changeScenario(scenarioId: string, userRole: UserRole): Promise<{ success: boolean; error?: string }> {
    if (userRole === 'Viewer' || userRole === 'Analyst' || userRole === 'Field Officer') {
      return {
        success: false,
        error: `Role '${userRole}' lacks statutory authorization to change active disaster scenarios. Requires Incident Commander or Administrator.`,
      };
    }
    this.activeScenario = {
      ...this.activeScenario,
      id: scenarioId,
    };
    return { success: true };
  }
}
