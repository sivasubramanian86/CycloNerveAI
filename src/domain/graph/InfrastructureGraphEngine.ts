/**
 * CycloNerveAI - Directed Infrastructure Graph & Cascade Propagation Engine
 * Includes cycle detection, duplicate-impact suppression, and deterministic BFS time-stepped diffusion.
 * Accepts dependency injection of infrastructure and dependency repositories.
 */

import {
  CascadePropagationResult,
  CascadeStep,
  CycleDetectionResult,
  CyclePath,
  DuplicateSuppressionRecord,
  GraphNode,
  IDependencyRepository,
  IInfrastructureRepository,
  PropagationState,
} from '../types.ts';
import { AssetSector, DependencyEdge, InfrastructureAsset } from '../../shared/types/index.ts';

export class InfrastructureGraphEngine {
  constructor(
    private readonly infraRepo: IInfrastructureRepository,
    private readonly edgeRepo: IDependencyRepository
  ) {}

  /**
   * Constructs the directed adjacency graph representation from injected repositories
   */
  public async buildGraph(): Promise<{
    nodes: Map<string, GraphNode>;
    adjacencyList: Map<string, DependencyEdge[]>;
    reverseAdjacencyList: Map<string, DependencyEdge[]>;
  }> {
    const assets = await this.infraRepo.getAllAssets();
    const edges = await this.edgeRepo.getAllEdges();

    const nodes = new Map<string, GraphNode>();
    const adjacencyList = new Map<string, DependencyEdge[]>();
    const reverseAdjacencyList = new Map<string, DependencyEdge[]>();

    for (const asset of assets) {
      nodes.set(asset.assetId, {
        asset,
        outDegree: 0,
        inDegree: 0,
        downstreamAssetIds: [],
        upstreamAssetIds: [],
      });
      adjacencyList.set(asset.assetId, []);
      reverseAdjacencyList.set(asset.assetId, []);
    }

    for (const edge of edges) {
      if (adjacencyList.has(edge.sourceAssetId)) {
        adjacencyList.get(edge.sourceAssetId)!.push(edge);
        const srcNode = nodes.get(edge.sourceAssetId);
        if (srcNode) {
          srcNode.outDegree += 1;
          srcNode.downstreamAssetIds.push(edge.targetAssetId);
        }
      }

      if (reverseAdjacencyList.has(edge.targetAssetId)) {
        reverseAdjacencyList.get(edge.targetAssetId)!.push(edge);
        const tgtNode = nodes.get(edge.targetAssetId);
        if (tgtNode) {
          tgtNode.inDegree += 1;
          tgtNode.upstreamAssetIds.push(edge.sourceAssetId);
        }
      }
    }

    return { nodes, adjacencyList, reverseAdjacencyList };
  }

  /**
   * Detects cycles in the directed dependency graph using three-color DFS (White=0, Gray=1, Black=2)
   */
  public async detectCycles(): Promise<CycleDetectionResult> {
    const { adjacencyList } = await this.buildGraph();
    const visited = new Map<string, number>(); // 0=unvisited, 1=in-stack, 2=done
    const parentMap = new Map<string, string>();
    const detectedCycles: CyclePath[] = [];

    for (const nodeId of adjacencyList.keys()) {
      visited.set(nodeId, 0);
    }

    const dfs = (curr: string, path: string[]) => {
      visited.set(curr, 1);
      path.push(curr);

      const edges = adjacencyList.get(curr) || [];
      for (const edge of edges) {
        const next = edge.targetAssetId;
        const state = visited.get(next) ?? 0;

        if (state === 1) {
          // Cycle found! Extract the cycle path from 'next' to 'curr'
          const cycleStartIndex = path.indexOf(next);
          if (cycleStartIndex !== -1) {
            const cycleNodes = path.slice(cycleStartIndex);
            cycleNodes.push(next); // Close loop
            detectedCycles.push({
              cycleLength: cycleNodes.length - 1,
              nodes: cycleNodes,
              edges: [edge.id],
            });
          }
        } else if (state === 0) {
          parentMap.set(next, curr);
          dfs(next, path);
        }
      }

      path.pop();
      visited.set(curr, 2);
    };

    for (const nodeId of adjacencyList.keys()) {
      if (visited.get(nodeId) === 0) {
        dfs(nodeId, []);
      }
    }

    return {
      hasCycle: detectedCycles.length > 0,
      cycleCount: detectedCycles.length,
      cycles: detectedCycles,
      isAcyclicDAG: detectedCycles.length === 0,
    };
  }

  /**
   * Simulates cascade propagation from a root breach node.
   * Guarantees duplicate-impact prevention and step-by-step latency diffusion.
   */
  public async simulateCascade(params: {
    rootFailedAssetId: string;
    maxHops?: number;
    minimumTransferProbability?: number;
  }): Promise<CascadePropagationResult> {
    const { rootFailedAssetId, maxHops = 8, minimumTransferProbability = 0.2 } = params;

    const { nodes, adjacencyList } = await this.buildGraph();
    const cycleAudit = await this.detectCycles();

    const rootNode = nodes.get(rootFailedAssetId);
    if (!rootNode) {
      throw new Error(`Root asset ${rootFailedAssetId} not found in infrastructure graph.`);
    }

    const nodeStates = new Map<string, PropagationState>();
    const duplicateSuppressionMap = new Map<string, DuplicateSuppressionRecord>();

    // Priority queue / list sorted by failure minute
    interface QueueItem {
      assetId: string;
      hop: number;
      failedAtMinute: number;
      path: string[];
      edgeId?: string;
      reason: string;
    }

    const queue: QueueItem[] = [];

    // Initialize root breach
    const rootState: PropagationState = {
      assetId: rootFailedAssetId,
      failedAtMinute: 0,
      hopDistance: 0,
      rootInitiatorId: rootFailedAssetId,
      propagationPath: [rootFailedAssetId],
      failureTrigger: 'Direct Physical Surge / Mechanical Breaker Trip',
    };
    nodeStates.set(rootFailedAssetId, rootState);

    queue.push({
      assetId: rootFailedAssetId,
      hop: 0,
      failedAtMinute: 0,
      path: [rootFailedAssetId],
      reason: rootState.failureTrigger,
    });

    let severedEdgeCount = 0;

    while (queue.length > 0) {
      // Sort queue so closest in time executes first
      queue.sort((a, b) => a.failedAtMinute - b.failedAtMinute);
      const current = queue.shift()!;

      if (current.hop >= maxHops) continue;

      const outgoingEdges = adjacencyList.get(current.assetId) || [];
      for (const edge of outgoingEdges) {
        if (edge.failureTransferProbability < minimumTransferProbability) {
          continue;
        }

        const targetId = edge.targetAssetId;
        const latency = edge.propagationLatencyMinutes;
        const projectedFailureTime = current.failedAtMinute + latency;

        // Duplicate-Impact Prevention check:
        if (nodeStates.has(targetId)) {
          // Target already failed in an earlier hop or faster path!
          // Suppress duplicate failure to prevent duplicate counting or infinite loops.
          if (!duplicateSuppressionMap.has(targetId)) {
            const existing = nodeStates.get(targetId)!;
            duplicateSuppressionMap.set(targetId, {
              assetId: targetId,
              firstFailedAtHop: existing.hopDistance,
              firstFailedAtMinute: existing.failedAtMinute,
              suppressedRedundantTriggersCount: 1,
              alternativeIncomingEdgeIds: [edge.id],
            });
          } else {
            const rec = duplicateSuppressionMap.get(targetId)!;
            rec.suppressedRedundantTriggersCount += 1;
            rec.alternativeIncomingEdgeIds.push(edge.id);
          }
          continue;
        }

        // New node failure
        severedEdgeCount += 1;
        const newPath = [...current.path, targetId];
        const reason = `Cascaded from ${current.assetId} via ${edge.dependencyType} (Latency: ${latency}m)`;

        const newState: PropagationState = {
          assetId: targetId,
          failedAtMinute: projectedFailureTime,
          hopDistance: current.hop + 1,
          rootInitiatorId: rootFailedAssetId,
          propagationPath: newPath,
          severedEdgeId: edge.id,
          failureTrigger: reason,
        };

        nodeStates.set(targetId, newState);

        queue.push({
          assetId: targetId,
          hop: current.hop + 1,
          failedAtMinute: projectedFailureTime,
          path: newPath,
          edgeId: edge.id,
          reason,
        });
      }
    }

    // Bucket into logical chronological steps (T+0, T+15, T+90, T+180 min)
    const timeBuckets = [0, 15, 90, 180, 360];
    const steps: CascadeStep[] = [];
    const cumulativeDisrupted = new Set<string>();

    for (let i = 0; i < timeBuckets.length; i++) {
      const bucketMinute = timeBuckets[i];
      const nextMinute = i < timeBuckets.length - 1 ? timeBuckets[i + 1] : Infinity;

      const newlyDisruptedThisBucket: string[] = [];
      for (const [id, state] of nodeStates.entries()) {
        if (state.failedAtMinute >= bucketMinute && state.failedAtMinute < nextMinute) {
          newlyDisruptedThisBucket.push(id);
          cumulativeDisrupted.add(id);
        }
      }

      if (newlyDisruptedThisBucket.length === 0 && i > 0 && i < timeBuckets.length - 1) {
        continue;
      }

      let cumulativePop = 0;
      const sectors = new Set<AssetSector>();
      const criticalLifelines: string[] = [];

      for (const id of cumulativeDisrupted) {
        const asset = nodes.get(id)?.asset;
        if (asset) {
          cumulativePop += asset.populationServed;
          sectors.add(asset.sector);
          if (asset.criticality >= 8.5) {
            criticalLifelines.push(asset.name);
          }
        }
      }

      steps.push({
        stepIndex: steps.length,
        timeOffsetMinutes: bucketMinute,
        label: `T + ${bucketMinute} min`,
        description:
          bucketMinute === 0
            ? `Root surge overtopping at ${rootNode.asset.name}. Primary breaker trip.`
            : `${newlyDisruptedThisBucket.length} downstream assets suffered cascade cutoff.`,
        newlyDisruptedAssetIds: newlyDisruptedThisBucket,
        cumulativeDisruptedAssetIds: Array.from(cumulativeDisrupted),
        cumulativeAffectedPopulation: cumulativePop,
        compromisedSectors: Array.from(sectors),
        criticalLifelinesSevered: criticalLifelines,
        suppressedDuplicateCount: duplicateSuppressionMap.size,
      });
    }

    // Summaries
    let totalPop = 0;
    let isolatedShelters = 0;
    let compromisedHospitals = 0;
    let maxHop = 0;

    for (const [id, state] of nodeStates.entries()) {
      maxHop = Math.max(maxHop, state.hopDistance);
      const asset = nodes.get(id)?.asset;
      if (asset) {
        totalPop += asset.populationServed;
        if (asset.sector === 'shelter') isolatedShelters += 1;
        if (asset.sector === 'health') compromisedHospitals += 1;
      }
    }

    return {
      rootFailedAssetId,
      totalHops: maxHop,
      totalAssetsDisrupted: nodeStates.size,
      totalPopulationDarkened: totalPop,
      isolatedSheltersCount: isolatedShelters,
      compromisedHospitalsCount: compromisedHospitals,
      severedEdgeCount,
      steps,
      nodeStates,
      duplicateSuppressionLog: Array.from(duplicateSuppressionMap.values()),
      cycleAudit,
      completedAt: new Date().toISOString(),
    };
  }
}
