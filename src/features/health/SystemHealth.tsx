import React, { useState, useEffect } from 'react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge.tsx';
import { INITIAL_SYSTEM_HEALTH } from '../../data/coastalScenarioData.ts';
import { ResilienceTier } from '../../shared/types/index.ts';
import { SystemHealthCheckReport, HealthCheckResult } from '../../server/adapters/types.ts';

interface SystemHealthProps {
  degradedModeActive: boolean;
  onToggleDegradedMode: () => void;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({
  degradedModeActive,
  onToggleDegradedMode,
}) => {
  const [healthReport, setHealthReport] = useState<SystemHealthCheckReport | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Initializing...');

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data: SystemHealthCheckReport = await res.json();
        setHealthReport(data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch {
      // Offline or SSR fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeTier: ResilienceTier = degradedModeActive
    ? 'TIER_2_SATELLITE_ONLY'
    : healthReport?.calculatedResilienceTier || 'TIER_0_CLOUD_EDGE';

  const tiers: Array<{
    id: ResilienceTier;
    name: string;
    description: string;
    status: string;
    isCurrent: boolean;
  }> = [
    {
      id: 'TIER_0_CLOUD_EDGE',
      name: 'Tier 0: Cloud Edge Hybrid',
      description: 'Dual fiber WAN with low-latency Google Cloud Run & Earth Engine streaming.',
      status: activeTier === 'TIER_0_CLOUD_EDGE' ? 'NOMINAL ACTIVE' : 'STANDBY',
      isCurrent: activeTier === 'TIER_0_CLOUD_EDGE',
    },
    {
      id: 'TIER_1_CLOUD_DEGRADED',
      name: 'Tier 1: Cloud Degraded',
      description: 'Terrestrial packet loss > 15%. Aggressive context caching & pre-computed risk rasters.',
      status: activeTier === 'TIER_1_CLOUD_DEGRADED' ? 'ACTIVE DEGRADED' : 'STANDBY',
      isCurrent: activeTier === 'TIER_1_CLOUD_DEGRADED',
    },
    {
      id: 'TIER_2_SATELLITE_ONLY',
      name: 'Tier 2: Satellite Transponder',
      description: 'Terrestrial backhaul severed. Operating on GSAT-7A Ku-Band & Starlink terminals.',
      status: activeTier === 'TIER_2_SATELLITE_ONLY' ? (degradedModeActive ? 'ACTIVE (DRILL)' : 'ACTIVE FAILOVER') : 'STANDBY HOT',
      isCurrent: activeTier === 'TIER_2_SATELLITE_ONLY',
    },
    {
      id: 'TIER_3_AIR_GAPPED',
      name: 'Tier 3: Air-Gapped EOC Terminal',
      description: 'Zero external connectivity. 100% local edge arithmetic inference with VHF packet broadcast.',
      status: activeTier === 'TIER_3_AIR_GAPPED' ? 'ACTIVE AIR-GAPPED' : 'READY FOR ISOLATION',
      isCurrent: activeTier === 'TIER_3_AIR_GAPPED',
    },
  ];

  // Adapter status list from live report or fallback
  const adaptersList: Array<{ id: string; name: string; health?: HealthCheckResult; defaultDesc: string }> = [
    {
      id: 'earthEngine',
      name: 'Google Earth Engine (SAR Flood Inundation)',
      health: healthReport?.adapters.earthEngine,
      defaultDesc: 'Sentinel-1 C-SAR Flood Inundation Engine',
    },
    {
      id: 'bigQuery',
      name: 'Google BigQuery (Spatial GIS & OSDI)',
      health: healthReport?.adapters.bigQuery,
      defaultDesc: 'ST_DWithin Geospatial Query Engine',
    },
    {
      id: 'firebaseAuth',
      name: 'Firebase Authentication & Dual 2FA Desk',
      health: healthReport?.adapters.firebaseAuth,
      defaultDesc: 'FIPS 140-2 Statutory Dual-Officer Gateway',
    },
    {
      id: 'firestore',
      name: 'Google Cloud Firestore (Lifelines & Audit)',
      health: healthReport?.adapters.firestore,
      defaultDesc: 'WORM Merkle Audit & Asset Store',
    },
    {
      id: 'cloudStorage',
      name: 'Google Cloud Storage (Artifacts & GeoTIFFs)',
      health: healthReport?.adapters.cloudStorage,
      defaultDesc: 'Secure V4 Signed Object Repository',
    },
    {
      id: 'googleMaps',
      name: 'Google Maps Platform (Hazard-Aware Routes)',
      health: healthReport?.adapters.googleMaps,
      defaultDesc: 'Evacuation Corridors & Distance Matrix',
    },
    {
      id: 'advisoryDispatch',
      name: 'Simulated Advisory Dispatch Hub (CBS / Sirens)',
      health: healthReport?.adapters.advisoryDispatch,
      defaultDesc: 'OASIS CAP-v1.2 Multi-Channel Gateway',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
              SRE RESILIENCE &amp; HARDWARE CONSOLE
            </span>
            <ProvenanceBadge
              classification={healthReport ? 'observed' : 'simulated'}
              confidence={healthReport?.overallStatus === 'HEALTHY' ? 0.999 : 0.85}
              freshness={lastUpdated}
              source="Hardware IPMI, PingMesh &amp; Adapter Health"
              size="sm"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Public_Sans'] text-[#dae2fd]">
            System Health &amp; 4-Tier Resilience
          </h1>
          <p className="text-xs text-[#bfc7d2] font-['Inter'] mt-0.5">
            Mission-critical infrastructure guarantees survival through severe storm surge, fiber cuts, and grid failure.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHealth}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl text-xs font-mono bg-[#1e293b] hover:bg-[#334155] text-slate-200 border border-slate-700/60 transition-all flex items-center gap-1.5"
            title="Poll upstream server adapter health check endpoints"
          >
            <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {isRefreshing ? 'Checking...' : 'Check Adapters'}
          </button>

          {/* Drill Toggle Button */}
          <button
            onClick={onToggleDegradedMode}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 shrink-0 ${
              degradedModeActive
                ? 'bg-[#d97707] hover:bg-[#b45309] text-[#060e20]'
                : 'bg-[#1e293b] hover:bg-[#334155] text-amber-300 border border-amber-500/40'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {degradedModeActive ? 'wifi' : 'wifi_off'}
            </span>
            {degradedModeActive ? 'DISENGAGE AIR-GAP DRILL' : 'SIMULATE AIR-GAP DRILL'}
          </button>
        </div>
      </div>

      {/* 4-Tier Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
              tier.isCurrent
                ? 'bg-[#182544] border-[#3198dc] shadow-md ring-1 ring-[#3198dc]'
                : 'bg-[#131b2e] border-[#222a3d] opacity-80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] uppercase text-[#6bd8cb] font-bold">
                  {tier.id.split('_')[0]}_{tier.id.split('_')[1]}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                    tier.isCurrent
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#060e20] text-[#89929b]'
                  }`}
                >
                  {tier.status}
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#dae2fd]">{tier.name}</h3>
              <p className="text-[11px] text-[#bfc7d2] mt-1 leading-relaxed">
                {tier.description}
              </p>
            </div>

            {tier.isCurrent && (
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 font-bold pt-2 border-t border-[#171f33]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Resilience Tier</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SRE Telemetry Gauges & Hardware Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Communications & Upstream Adapter Mesh */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-[#dae2fd] border-b border-[#171f33] pb-2 flex items-center justify-between">
              <span>Network Backhaul &amp; PingMesh Latency</span>
              <span className="font-mono text-xs text-[#89929b]">
                {healthReport ? `Uptime: ${healthReport.uptimeSeconds}s` : 'Dual WAN Active'}
              </span>
            </h3>

            {/* Latency Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#060e20] p-3 rounded-xl border border-[#222a3d]">
                <span className="text-[#89929b] text-[10px] block">Inmarsat BGAN</span>
                <span className="text-xl font-bold text-[#dae2fd] block mt-1">
                  {INITIAL_SYSTEM_HEALTH.inmarsatPingMs} ms
                </span>
                <span className="text-[10px] text-white/50">RTT Latency</span>
              </div>

              <div className="bg-[#060e20] p-3 rounded-xl border border-[#222a3d]">
                <span className="text-[#89929b] text-[10px] block">Starlink Terminal</span>
                <span className="text-xl font-bold text-[#6bd8cb] block mt-1">
                  {INITIAL_SYSTEM_HEALTH.starlinkPingMs} ms
                </span>
                <span className="text-[10px] text-white/50">Auxiliary Uplink</span>
              </div>

              <div className="bg-[#060e20] p-3 rounded-xl border border-[#222a3d]">
                <span className="text-[#89929b] text-[10px] block">WAN Packet Loss</span>
                <span className="text-xl font-bold text-emerald-400 block mt-1">
                  {INITIAL_SYSTEM_HEALTH.wanPacketLossPercent}%
                </span>
                <span className="text-[10px] text-white/50">Carrier Grade</span>
              </div>

              <div className="bg-[#060e20] p-3 rounded-xl border border-[#222a3d]">
                <span className="text-[#89929b] text-[10px] block">Adapters Operational</span>
                <span className="text-xl font-bold text-[#93ccff] block mt-1">
                  {healthReport
                    ? `${healthReport.adapterCount.healthy} / ${healthReport.adapterCount.total}`
                    : '7 / 7'}
                </span>
                <span className="text-[10px] text-emerald-300">
                  {healthReport?.overallStatus === 'HEALTHY' ? 'All Healthy' : 'Active'}
                </span>
              </div>
            </div>

            {/* Replaceable Server-Side Adapter Mesh Status */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#89929b] font-semibold block">
                  Replaceable Server-Side Adapter Mesh (Phase 4):
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {healthReport ? `${healthReport.adapterCount.mockCount} Mock / ${healthReport.adapterCount.cloudCount} Cloud` : 'Local Mock Mode'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                {adaptersList.map((item) => {
                  const isHealthy = !item.health || item.health.status === 'HEALTHY';
                  const isDegraded = item.health?.status === 'DEGRADED';
                  const mode = item.health?.mode || 'mock';
                  const latency = item.health ? `${item.health.latencyMs}ms` : '< 5ms';
                  const provStatus = item.health?.provenance.status || 'SIMULATED';

                  return (
                    <div
                      key={item.id}
                      className="bg-[#060e20] p-2.5 rounded-lg border border-[#222a3d] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isHealthy ? 'bg-emerald-400' : isDegraded ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                        />
                        <span className="text-slate-200 font-medium">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-[#131b2e] border border-[#222a3d] text-slate-400">
                          {mode.toUpperCase()}
                        </span>
                        <span className="text-slate-400">{latency}</span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            isHealthy
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isDegraded
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {provStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Edge Hardware Vital Signs */}
        <div className="space-y-4">
          <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-[#dae2fd] border-b border-[#171f33] pb-2">
              EOC Bunker Hardware Telemetry
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-[#060e20] p-3 rounded-lg border border-[#222a3d] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Edge Tensor Accelerator:</span>
                  <span className="text-emerald-400 font-bold">41°C / 24% Load</span>
                </div>
                <div className="w-full bg-[#131b2e] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[24%]"></div>
                </div>
              </div>

              <div className="bg-[#060e20] p-3 rounded-lg border border-[#222a3d] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Local NVMe Cache:</span>
                  <span className="text-white font-bold">1.8 TB / 3.8 TB</span>
                </div>
                <div className="w-full bg-[#131b2e] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#3198dc] h-full w-[47%]"></div>
                </div>
              </div>

              <div className="bg-[#060e20] p-3 rounded-lg border border-[#222a3d] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Emergency Battery UPS:</span>
                  <span className="text-emerald-400 font-bold">98.4% (8.4h Run)</span>
                </div>
                <div className="w-full bg-[#131b2e] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[98%]"></div>
                </div>
              </div>

              <div className="bg-[#060e20] p-3 rounded-lg border border-[#222a3d] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#89929b]">VHF Radio Transmitter:</span>
                  <span className="text-white font-bold">50 Watts RF</span>
                </div>
                <span className="text-[10px] text-[#89929b] block">
                  Broadcasts digital advisories on 145.825 MHz APRS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
