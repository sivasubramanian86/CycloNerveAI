/**
 * CycloNerveAI - Graph Dependency & Cascade Propagation Engine
 * Directed Acyclic / Cyclic Graph Traversal with Cycle Detection & Duplicate Suppression
 */

import { DependencyEdge, InfrastructureAsset } from '../types/index.ts';

export interface GraphNodeState {
  assetId: string;
  isFailed: boolean;
  hopDistance: number;
  timeToFailureMinutes: number;
  propagationPath: string[];
}

export function detectCycles(edges: DependencyEdge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adj.has(edge.sourceAssetId)) adj.set(edge.sourceAssetId, []);
    adj.get(edge.sourceAssetId)!.push(edge.targetAssetId);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const node of adj.keys()) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }

  return false;
}

export function simulateCascade(params: {
  rootFailedAssetId: string;
  assets: InfrastructureAsset[];
  edges: DependencyEdge[];
  maxHops?: number;
}): {
  failedNodeStates: Map<string, GraphNodeState>;
  maxDepthReached: number;
  disruptedAssetCount: number;
  totalPopulationAffected: number;
  disruptedSectors: string[];
  isolatedShelterCount: number;
} {
  const { rootFailedAssetId, assets, edges, maxHops = 6 } = params;
  const assetMap = new Map(assets.map((a) => [a.assetId, a]));

  const adj = new Map<string, Array<{ targetId: string; latencyMinutes: number; probability: number }>>();
  for (const edge of edges) {
    if (!adj.has(edge.sourceAssetId)) adj.set(edge.sourceAssetId, []);
    adj.get(edge.sourceAssetId)!.push({
      targetId: edge.targetAssetId,
      latencyMinutes: edge.propagationLatencyMinutes,
      probability: edge.failureTransferProbability,
    });
  }

  const failedNodeStates = new Map<string, GraphNodeState>();
  const queue: Array<{ assetId: string; currentHop: number; cumulativeMinutes: number; path: string[] }> = [];

  // Root node breach
  failedNodeStates.set(rootFailedAssetId, {
    assetId: rootFailedAssetId,
    isFailed: true,
    hopDistance: 0,
    timeToFailureMinutes: 0,
    propagationPath: [rootFailedAssetId],
  });

  queue.push({
    assetId: rootFailedAssetId,
    currentHop: 0,
    cumulativeMinutes: 0,
    path: [rootFailedAssetId],
  });

  let maxDepth = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    maxDepth = Math.max(maxDepth, current.currentHop);

    if (current.currentHop >= maxHops) continue;

    const neighbors = adj.get(current.assetId) || [];
    for (const edge of neighbors) {
      if (!failedNodeStates.has(edge.targetId)) {
        const failureMinutes = current.cumulativeMinutes + edge.latencyMinutes;
        const newPath = [...current.path, edge.targetId];

        failedNodeStates.set(edge.targetId, {
          assetId: edge.targetId,
          isFailed: true,
          hopDistance: current.currentHop + 1,
          timeToFailureMinutes: failureMinutes,
          propagationPath: newPath,
        });

        queue.push({
          assetId: edge.targetId,
          currentHop: current.currentHop + 1,
          cumulativeMinutes: failureMinutes,
          path: newPath,
        });
      }
    }
  }

  // Aggregate stats
  let totalPop = 0;
  const sectorsSet = new Set<string>();
  let isolatedShelters = 0;

  for (const [id] of failedNodeStates.entries()) {
    const asset = assetMap.get(id);
    if (asset) {
      totalPop += asset.populationServed;
      sectorsSet.add(asset.sector);
      if (asset.sector === 'shelter') {
        isolatedShelters += 1;
      }
    }
  }

  return {
    failedNodeStates,
    maxDepthReached: maxDepth,
    disruptedAssetCount: failedNodeStates.size,
    totalPopulationAffected: totalPop,
    disruptedSectors: Array.from(sectorsSet),
    isolatedShelterCount: isolatedShelters,
  };
}
