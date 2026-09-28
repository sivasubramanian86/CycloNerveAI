import React, { useState } from 'react';
import { InfrastructureAsset } from '../../shared/types/index.ts';
import { ProvenanceBadge } from '../../components/ProvenanceBadge.tsx';
import { SCENARIO_ASSETS, SCENARIO_EDGES } from '../../data/coastalScenarioData.ts';
import { useDomain } from '../../domain/index.ts';

interface InfrastructureMeshProps {
  onSelectForCascade?: (assetId: string) => void;
}

export const InfrastructureMesh: React.FC<InfrastructureMeshProps> = ({ onSelectForCascade }) => {
  const { riskEngine } = useDomain();
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAsset, setActiveAsset] = useState<InfrastructureAsset | null>(SCENARIO_ASSETS[0]);

  // Filter assets
  const filteredAssets = SCENARIO_ASSETS.filter((asset) => {
    const matchesSector = selectedSector === 'all' || asset.sector === selectedSector;
    const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.subtype.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesStatus && matchesSearch;
  });

  // Calculate dependency edges for active asset
  const incomingEdges = activeAsset
    ? SCENARIO_EDGES.filter((e) => e.targetAssetId === activeAsset.assetId)
    : [];
  const outgoingEdges = activeAsset
    ? SCENARIO_EDGES.filter((e) => e.sourceAssetId === activeAsset.assetId)
    : [];

  // Compute detailed deterministic risk via domain RiskScoringEngine
  const activeDetailedRisk = activeAsset
    ? riskEngine.computeRisk({
        assetId: activeAsset.assetId,
        hazard: {
          sustainedWindKmh: 195,
          gustsKmh: 230,
          stormSurgeMeters: 3.6,
          rain24hMm: 280,
          distanceToEyeKm: 18,
        },
        exposure: {
          populationServed: activeAsset.populationServed,
          hasIcuOrEmergencyUnit: activeAsset.sector === 'health',
          evacueeShelterHeadcount: activeAsset.sector === 'shelter' ? (activeAsset.specs.currentOccupancy as number) || 0 : 0,
          directEconomicAssetValueUsd: 12000000,
        },
        vulnerability: {
          elevationAmsl: activeAsset.elevationAmsl,
          floodWallThresholdMeters: activeAsset.failureThresholds.inundationMeters,
          hasBackupDieselGenerator: activeAsset.specs.dgFuelReserveHours !== undefined,
          dieselFuelReserveHours: (activeAsset.specs.dgFuelReserveHours as number) || 0,
          buildingStructuralCodeCompliant: true,
          isCoastalZone1: activeAsset.elevationAmsl < 3.0,
        },
        criticality: {
          systemicDownstreamBranches: outgoingEdges.length,
          isSinglePointOfFailure: activeAsset.criticality >= 9.0,
          tierAnchorLevel: activeAsset.criticality >= 9.0 ? 1 : activeAsset.criticality >= 7.5 ? 2 : 3,
          servesEmergencyResponders: activeAsset.sector === 'health' || activeAsset.sector === 'telecom',
        },
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/30">
              NEURO-SYMBOLIC MESH TOPOLOGY
            </span>
            <ProvenanceBadge
              classification="observed"
              confidence={0.99}
              freshness="Live SCADA"
              source="State Electricity Transmission & Public Works GIS"
              size="sm"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Public_Sans'] text-[#dae2fd]">
            Critical Infrastructure Lifelines Mesh
          </h1>
          <p className="text-xs text-[#bfc7d2] font-['Inter'] mt-0.5">
            Directed civil dependency graph modeling inter-asset physical, electrical, and telemetry links.
          </p>
        </div>

        {/* Total Assets Summary Pill */}
        <div className="flex items-center gap-2 bg-[#060e20] px-3.5 py-2 rounded-xl border border-[#222a3d] font-mono text-xs">
          <div>
            <span className="text-[#89929b] block text-[10px]">Total Nodes</span>
            <span className="font-bold text-white text-base">{SCENARIO_ASSETS.length} Assets</span>
          </div>
          <span className="text-[#3f4850] mx-1">|</span>
          <div>
            <span className="text-[#89929b] block text-[10px]">Dependency Edges</span>
            <span className="font-bold text-[#6bd8cb] text-base">{SCENARIO_EDGES.length} Links</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131b2e] border border-[#222a3d] p-3 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#89929b] text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Search by asset name, sector, or ID (e.g. Substation, DH01)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#060e20] text-xs font-mono text-[#dae2fd] pl-9 pr-3 py-2 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#3198dc]"
          />
        </div>

        {/* Sector Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
          {['all', 'power', 'health', 'telecom', 'transport', 'water', 'shelter'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-2.5 py-1.5 rounded-lg uppercase text-[11px] font-semibold transition-colors ${
                selectedSector === sec
                  ? 'bg-[#3198dc] text-[#001d31]'
                  : 'bg-[#060e20] text-[#89929b] hover:text-[#dae2fd] border border-[#222a3d]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#060e20] text-xs font-mono text-[#93ccff] px-3 py-2 rounded-lg border border-[#222a3d] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="breached">Breached Only</option>
          <option value="threatened">Threatened Only</option>
          <option value="nominal">Nominal Only</option>
          <option value="offline">Offline Only</option>
        </select>
      </div>

      {/* Main Grid: Asset List (Left) + Selected Asset Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Asset Table / Cards */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-[#131b2e] border border-[#222a3d] rounded-xl overflow-hidden">
            <div className="p-3 border-b border-[#171f33] flex items-center justify-between text-xs text-[#89929b] font-mono">
              <span>Showing {filteredAssets.length} of {SCENARIO_ASSETS.length} nodes</span>
              <span>Click node to inspect dependencies</span>
            </div>

            <div className="divide-y divide-[#171f33] max-h-[640px] overflow-y-auto">
              {filteredAssets.map((asset) => {
                const isSelected = activeAsset?.assetId === asset.assetId;
                return (
                  <div
                    key={asset.assetId}
                    onClick={() => setActiveAsset(asset)}
                    className={`p-3.5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#1c2742] border-l-4 border-l-[#3198dc]'
                        : 'hover:bg-[#182136]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-[#6bd8cb] font-bold">
                          {asset.assetId}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#060e20] font-mono text-[10px] uppercase text-[#93ccff] border border-[#222a3d]">
                          {asset.sector}
                        </span>
                        <ProvenanceBadge
                          classification={asset.classification}
                          confidence={asset.confidence}
                          size="sm"
                        />
                      </div>

                      <h4 className="font-bold text-sm text-[#dae2fd]">
                        {asset.name}
                      </h4>
                      <p className="text-[11px] text-[#89929b] font-['Inter']">
                        {asset.subtype} • Elev: +{asset.elevationAmsl}m MSL • Serves {asset.populationServed.toLocaleString()} citizens
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                          asset.status === 'breached'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : asset.status === 'threatened'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {asset.status}
                      </span>
                      <span className="font-mono text-[11px] text-amber-300">
                        Crit: {asset.criticality}/10
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Active Asset Deep Inspector */}
        {activeAsset && (
          <div className="space-y-4">
            <div className="bg-[#131b2e] border border-[#3198dc]/40 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg sticky top-20">
              <div className="flex items-start justify-between border-b border-[#171f33] pb-3">
                <div>
                  <span className="font-mono text-[11px] text-[#6bd8cb] uppercase block font-bold">
                    {activeAsset.sector} Lifeline Node
                  </span>
                  <h3 className="font-bold text-base text-[#dae2fd] leading-tight">
                    {activeAsset.name}
                  </h3>
                  <span className="font-mono text-xs text-[#89929b]">
                    {activeAsset.assetId}
                  </span>
                </div>
                <ProvenanceBadge
                  classification={activeAsset.classification}
                  confidence={activeAsset.confidence}
                  freshness={activeAsset.freshness}
                  source={activeAsset.source}
                />
              </div>

              {/* Deterministic Risk Breakdown */}
              {activeDetailedRisk && (
                <div className="bg-[#060e20] p-3 rounded-lg border border-[#222a3d] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#89929b] uppercase">
                      Composite Risk Score
                    </span>
                    <span className="font-mono text-sm font-bold text-red-400">
                      {(activeDetailedRisk.compositeRisk * 10).toFixed(1)} / 10 ({activeDetailedRisk.riskCategory})
                    </span>
                  </div>
                  <div className="w-full bg-[#131b2e] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-red-500 h-full"
                      style={{ width: `${Math.min(100, activeDetailedRisk.compositeRisk * 120)}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-[#bfc7d2] text-center pt-1">
                    <div title={activeDetailedRisk.factors.hazard.explanation}>
                      H: {activeDetailedRisk.hazardScore.toFixed(2)}
                    </div>
                    <div title={activeDetailedRisk.factors.exposure.explanation}>
                      E: {activeDetailedRisk.exposureScore.toFixed(2)}
                    </div>
                    <div title={activeDetailedRisk.factors.vulnerability.explanation}>
                      V: {activeDetailedRisk.vulnerabilityScore.toFixed(2)}
                    </div>
                    <div title={activeDetailedRisk.factors.criticality.explanation}>
                      C: {activeDetailedRisk.criticalityScore.toFixed(2)}
                    </div>
                  </div>
                  {activeDetailedRisk.statutoryThresholdBreached && (
                    <div className="mt-1 pt-1.5 border-t border-red-500/30 text-[10px] text-red-300 font-mono">
                      {activeDetailedRisk.statutoryNotes[0]}
                    </div>
                  )}
                </div>
              )}

              {/* Hardware Specifications */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#89929b] font-semibold block">
                  Engineering Specifications
                </span>
                <div className="bg-[#060e20] p-3 rounded-lg border border-[#171f33] space-y-1.5 text-xs font-mono">
                  {Object.entries(activeAsset.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[#89929b] capitalize">
                        {k.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <span className="text-[#dae2fd] font-medium">{String(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 border-t border-[#171f33]">
                    <span className="text-[#89929b]">Wind Failure Threshold:</span>
                    <span className="text-red-300 font-bold">
                      {activeAsset.failureThresholds.windGustKmh} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#89929b]">Surge Inundation Limit:</span>
                    <span className="text-red-300 font-bold">
                      +{activeAsset.failureThresholds.inundationMeters}m MSL
                    </span>
                  </div>
                </div>
              </div>

              {/* Inbound & Outbound Dependency Edges */}
              <div className="space-y-2 text-xs font-mono">
                <span className="text-[11px] uppercase tracking-wider text-[#89929b] font-semibold block">
                  Lifeline Interdependencies
                </span>

                <div className="space-y-1.5">
                  <div className="text-[11px] text-[#89929b]">Feeds Into (Downstream Impact):</div>
                  {outgoingEdges.length === 0 ? (
                    <span className="text-[11px] text-[#3f4850] italic">No outbound edges</span>
                  ) : (
                    outgoingEdges.map((e) => (
                      <div
                        key={e.id}
                        className={`p-2 rounded border text-[11px] flex justify-between items-center ${
                          e.isSevered
                            ? 'bg-red-950/40 border-red-500/40 text-red-200'
                            : 'bg-[#060e20] border-[#222a3d] text-[#93ccff]'
                        }`}
                      >
                        <span>→ {e.targetAssetId} ({e.dependencyType})</span>
                        <span className="font-bold">{e.isSevered ? 'SEVERED' : 'NOMINAL'}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] text-[#89929b]">Powered / Fed By (Upstream):</div>
                  {incomingEdges.length === 0 ? (
                    <span className="text-[11px] text-[#3f4850] italic">Root power or self-sufficient</span>
                  ) : (
                    incomingEdges.map((e) => (
                      <div
                        key={e.id}
                        className={`p-2 rounded border text-[11px] flex justify-between items-center ${
                          e.isSevered
                            ? 'bg-red-950/40 border-red-500/40 text-red-200'
                            : 'bg-[#060e20] border-[#222a3d] text-[#93ccff]'
                        }`}
                      >
                        <span>← {e.sourceAssetId}</span>
                        <span className="font-bold">{e.isSevered ? 'SEVERED' : 'ONLINE'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Button: Run Cascade from this node */}
              {onSelectForCascade && (
                <button
                  onClick={() => onSelectForCascade(activeAsset.assetId)}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#3198dc] hover:bg-[#93ccff] text-[#001d31] font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-base">account_tree</span>
                  Simulate Cascade from this Node
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
