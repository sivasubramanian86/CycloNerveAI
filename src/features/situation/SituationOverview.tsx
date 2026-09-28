import React, { useState } from 'react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge.tsx';
import { TacticalMap } from '../../components/TacticalMap.tsx';
import {
  ACTIVE_SCENARIO_META,
  SCENARIO_ASSETS,
  SCENARIO_EDGES,
} from '../../data/coastalScenarioData.ts';
import { NavRoute } from '../../components/Sidebar.tsx';
import { GLOBAL_CYCLONE_REGIONS } from '../../data/globalCycloneRegions.ts';
import { AppTheme } from '../../components/SettingsModal.tsx';
import { PlainEnglishStormStory } from '../../components/PlainEnglishStormStory.tsx';
import { AgenticIntelligenceAssistant } from '../../components/AgenticIntelligenceAssistant.tsx';
import { Heart, Map, Bot } from 'lucide-react';

interface SituationOverviewProps {
  onNavigate: (route: NavRoute) => void;
  degradedModeActive: boolean;
  onOpen2FAModal: () => void;
  selectedRegionId?: string;
  currentTheme?: AppTheme;
}

export const SituationOverview: React.FC<SituationOverviewProps> = ({
  onNavigate,
  degradedModeActive,
  onOpen2FAModal,
  selectedRegionId = 'odisha-dhamra',
  currentTheme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'story' | 'map' | 'ai_assistant'>('story');

  const currentRegion =
    GLOBAL_CYCLONE_REGIONS.find((r) => r.id === selectedRegionId) || GLOBAL_CYCLONE_REGIONS[0];

  const isDark = currentTheme === 'dark';

  return (
    <div className="space-y-6">
      {/* Top Incident Header & Anticipatory Action Window */}
      <div className={`border rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-lg transition-colors ${
        isDark ? 'bg-[#131b2e] border-[#222a3d]' : 'bg-white border-slate-200'
      }`}>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-xs font-bold border border-red-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                ACTIVE THREAT: {currentRegion.activeCyclone.alertStatus}
              </span>
              <ProvenanceBadge
                classification="observed"
                confidence={0.99}
                freshness="30s ago"
                source={currentRegion.activeCyclone.warningAuthority}
                size="sm"
              />
              <span className="text-[#89929b] text-xs font-mono">
                {currentRegion.basin} • {currentRegion.country}
              </span>
            </div>

            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold font-['Public_Sans'] tracking-tight ${
              isDark ? 'text-[#dae2fd]' : 'text-slate-900'
            }`}>
              {currentRegion.flagEmoji} {currentRegion.activeCyclone.name} — Anticipatory Action Console
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl font-['Inter'] ${
              isDark ? 'text-[#bfc7d2]' : 'text-slate-600'
            }`}>
              Pre-landfall cascade intelligence for <strong>{currentRegion.regionName}</strong>.
              Predicted peak surge ({currentRegion.activeCyclone.surgePeakMeters}m) towards {currentRegion.activeCyclone.landfallTarget}.
            </p>
          </div>

          {/* Golden Action Window Countdown */}
          <div className={`flex items-center gap-3 border px-4 py-3 rounded-xl shadow-md shrink-0 transition-colors ${
            isDark ? 'bg-[#060e20] border-[#d97707]/40' : 'bg-amber-50/70 border-amber-300'
          }`}>
            <div className="w-10 h-10 rounded-lg bg-[#d97707]/20 flex items-center justify-center text-[#ffb77d]">
              <span className="material-symbols-outlined text-2xl">timer</span>
            </div>
            <div>
              <span className="text-[10px] text-[#ffb77d] uppercase tracking-wider font-mono font-bold block">
                Golden Anticipatory Window
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  0{Math.floor(currentRegion.interventionHighlight.actionWindowHours)}h {Math.round((currentRegion.interventionHighlight.actionWindowHours % 1) * 60)}m
                </span>
                <span className="text-[11px] text-[#ffb4ab] font-mono font-medium">
                  before critical cutoff
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cascade Risk Index */}
        <div className={`border p-4 rounded-xl flex flex-col justify-between transition-colors ${
          isDark ? 'bg-[#131b2e] border-[#222a3d] hover:border-[#3198dc]/50' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#89929b] uppercase tracking-wider">
                Cascade Risk Index
              </span>
              <ProvenanceBadge classification="derived" confidence={0.96} size="sm" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-red-400">8.9</span>
              <span className="text-xs font-mono text-[#89929b]">/ 10 (CRITICAL)</span>
            </div>
          </div>
          <div className={`mt-3 pt-2 border-t text-[11px] font-mono ${
            isDark ? 'border-[#171f33] text-[#bfc7d2]' : 'border-slate-100 text-slate-600'
          }`}>
            <span>R = H (0.94) × E (0.98) × V (0.96) × C</span>
          </div>
        </div>

        {/* Card 2: Population at Risk */}
        <div className={`border p-4 rounded-xl flex flex-col justify-between transition-colors ${
          isDark ? 'bg-[#131b2e] border-[#222a3d] hover:border-[#3198dc]/50' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#89929b] uppercase tracking-wider">
                Population in Dark Zone
              </span>
              <ProvenanceBadge classification="simulated" confidence={0.94} size="sm" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-amber-400">{currentRegion.populationAtRisk}</span>
              <span className="text-xs font-mono text-amber-500">Citizens</span>
            </div>
          </div>
          <div className={`mt-3 pt-2 border-t text-[11px] ${
            isDark ? 'border-[#171f33] text-[#bfc7d2]' : 'border-slate-100 text-slate-600'
          }`}>
            <span className="truncate block">{currentRegion.topRiskThreat}</span>
          </div>
        </div>

        {/* Card 3: ICU Hospital Resilience */}
        <div className={`border p-4 rounded-xl flex flex-col justify-between transition-colors ${
          isDark ? 'bg-[#131b2e] border-[#222a3d] hover:border-[#3198dc]/50' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#89929b] uppercase tracking-wider">
                Hospital ICU Fuel Limit
              </span>
              <ProvenanceBadge classification="observed" confidence={0.98} size="sm" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-red-400">12.0h</span>
              <span className="text-xs font-mono text-red-400">DG Fuel Remaining</span>
            </div>
          </div>
          <div className={`mt-3 pt-2 border-t text-[11px] ${
            isDark ? 'border-[#171f33] text-[#bfc7d2]' : 'border-slate-100 text-slate-600'
          }`}>
            <span className="truncate block">{currentRegion.criticalLifelines.primaryHospital}</span>
          </div>
        </div>

        {/* Card 4: Staged Intervention ROI */}
        <div className={`border p-4 rounded-xl flex flex-col justify-between transition-colors ${
          isDark ? 'bg-[#131b2e] border-[#222a3d] hover:border-[#3198dc]/50' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#89929b] uppercase tracking-wider">
                Action Plan ROI
              </span>
              <ProvenanceBadge classification="derived" confidence={0.99} size="sm" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono text-[#6bd8cb]">
                {currentRegion.interventionHighlight.roiMultiplier}x
              </span>
              <span className="text-xs font-mono text-[#89929b]">Damage Avoidance</span>
            </div>
          </div>
          <div className={`mt-3 pt-2 border-t text-[11px] ${
            isDark ? 'border-[#171f33] text-[#bfc7d2]' : 'border-slate-100 text-slate-600'
          }`}>
            <span className="truncate block">{currentRegion.interventionHighlight.title}</span>
          </div>
        </div>
      </div>

      {/* Perspective Tabs: Human Story vs Geospatial Map vs Agentic AI Companion */}
      <div className="flex items-center justify-between border-b border-[#222a3d] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('story')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'story'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-[#131b2e] border border-[#222a3d] text-[#bfc7d2] hover:text-[#dae2fd]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>1. The Human Story (5 Ws &amp; How)</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-[#3198dc] text-[#002c47] shadow-md'
                : 'bg-[#131b2e] border border-[#222a3d] text-[#bfc7d2] hover:text-[#dae2fd]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>2. Command Center GIS &amp; Lifeline Map</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_assistant')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ai_assistant'
                ? 'bg-[#29a195] text-[#00302b] shadow-md'
                : 'bg-[#131b2e] border border-[#222a3d] text-[#bfc7d2] hover:text-[#dae2fd]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>3. Ask AI Companion (Agentic RAG &amp; MCP)</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-[#89929b] hidden md:inline">
          Human-in-the-Loop Transparency • Zero AI Slop
        </span>
      </div>

      {/* Tab 1: Plain-English Human Story of the Storm */}
      {activeTab === 'story' && (
        <PlainEnglishStormStory
          region={currentRegion}
          onNavigateToCascade={() => onNavigate('cascade-simulation')}
          onNavigateToIntervention={() => onNavigate('intervention-planner')}
        />
      )}

      {/* Tab 2: GIS Tactical Map + Decision Support Center */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Left 2 Cols: Tactical GIS Map */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold font-['Inter'] text-[#dae2fd] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3198dc] text-lg">map</span>
                Coastal Lifeline GIS &amp; Dependency Radar ({currentRegion.regionName})
              </h2>
              <button
                onClick={() => onNavigate('infrastructure-mesh')}
                className="text-xs text-[#93ccff] hover:underline font-mono"
              >
                Open Full Mesh View →
              </button>
            </div>
            <TacticalMap
              assets={SCENARIO_ASSETS}
              edges={SCENARIO_EDGES}
              heightClass="h-[480px]"
            />
          </div>

          {/* Right 1 Col: Anticipatory Decision Support & Staged Plans */}
          <div className="space-y-4">
            <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#171f33] pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6bd8cb]">bolt</span>
                  <h3 className="font-bold text-sm text-[#dae2fd]">Recommended Intervention</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  RANK 1 (PARETO)
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-bold text-[#93ccff] text-base">{currentRegion.interventionHighlight.planCode}</h4>
                  <span className="font-mono text-xs text-emerald-400 font-semibold">
                    {currentRegion.interventionHighlight.roiMultiplier}x ROI
                  </span>
                </div>
                <p className="text-xs text-[#bfc7d2] mt-1">
                  {currentRegion.interventionHighlight.title}
                </p>
              </div>

              <div className="bg-[#060e20] p-3 rounded-lg border border-[#171f33] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Action Window:</span>
                  <span className="text-amber-400 font-bold">{currentRegion.interventionHighlight.actionWindowHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Avoided Loss:</span>
                  <span className="text-emerald-400 font-bold">
                    {currentRegion.interventionHighlight.currencySymbol}{currentRegion.interventionHighlight.avoidedDamageInMillions}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Protected Population:</span>
                  <span className="text-white font-bold">{currentRegion.populationAtRisk}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => onNavigate('intervention-planner')}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#3198dc] hover:bg-[#93ccff] text-[#001d31] font-bold text-xs font-['Inter'] transition-colors flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">alt_route</span>
                  Inspect Intervention Plan
                </button>
                <button
                  onClick={onOpen2FAModal}
                  className="w-full py-2 px-4 rounded-lg bg-[#131b2e] hover:bg-[#222a3d] text-[#ffb77d] font-semibold text-xs border border-[#d97707]/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  Authorize Emergency Dispatch (2FA)
                </button>
              </div>
            </div>

            {/* Quick Route Shortcuts */}
            <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#89929b] font-semibold block">
                Direct Anticipatory Tools
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onNavigate('cascade-simulation')}
                  className="p-2.5 rounded-lg bg-[#060e20] hover:bg-[#171f33] border border-[#222a3d] text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#3198dc] text-lg block mb-1">
                    account_tree
                  </span>
                  <span className="font-semibold text-[#dae2fd] block">Cascade Sim</span>
                  <span className="text-[10px] text-[#89929b]">T+0 to T+180m</span>
                </button>
                <button
                  onClick={() => onNavigate('advisories-and-approval')}
                  className="p-2.5 rounded-lg bg-[#060e20] hover:bg-[#171f33] border border-[#222a3d] text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-amber-400 text-lg block mb-1">
                    campaign
                  </span>
                  <span className="font-semibold text-[#dae2fd] block">Advisories</span>
                  <span className="text-[10px] text-[#89929b]">10 Languages</span>
                </button>
                <button
                  onClick={() => onNavigate('evidence-and-audit')}
                  className="p-2.5 rounded-lg bg-[#060e20] hover:bg-[#171f33] border border-[#222a3d] text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#6bd8cb] text-lg block mb-1">
                    verified
                  </span>
                  <span className="font-semibold text-[#dae2fd] block">Audit Ledger</span>
                  <span className="text-[10px] text-[#89929b]">WORM Merkle</span>
                </button>
                <button
                  onClick={() => onNavigate('mobile-field')}
                  className="p-2.5 rounded-lg bg-[#060e20] hover:bg-[#171f33] border border-[#222a3d] text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-purple-400 text-lg block mb-1">
                    smartphone
                  </span>
                  <span className="font-semibold text-[#dae2fd] block">Field Responder</span>
                  <span className="text-[10px] text-[#89929b]">Offline Ready</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Ask AI Cyclone Companion (Agentic RAG & MCP Tools) */}
      {activeTab === 'ai_assistant' && (
        <AgenticIntelligenceAssistant
          currentRegion={currentRegion}
          onNavigateToCascade={() => onNavigate('cascade-simulation')}
          onNavigateToIntervention={() => onNavigate('intervention-planner')}
        />
      )}
    </div>
  );
};
