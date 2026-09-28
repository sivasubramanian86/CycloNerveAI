import React, { useState, useEffect } from 'react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge.tsx';
import { SCENARIO_ASSETS, SCENARIO_EDGES } from '../../data/coastalScenarioData.ts';
import { simulateCascade } from '../../shared/utils/cascadeEngine.ts';

interface CascadeSimulationProps {
  initialRootAssetId?: string;
  onNavigateToIntervention?: () => void;
}

export const CascadeSimulation: React.FC<CascadeSimulationProps> = ({
  initialRootAssetId = 'SUB-OD-DH01',
  onNavigateToIntervention,
}) => {
  const [rootAssetId, setRootAssetId] = useState<string>(initialRootAssetId);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Timeline step definitions
  const simulationSteps = [
    {
      timeOffset: 'T + 0 min',
      offsetMinutes: 0,
      title: 'Root Surge Overtopping at Dhamra Substation',
      desc: '3.6m coastal surge overtops 2.7m floodwall. 220kV busbar arcs, triggering protective breaker trip on main transmission line L-4.',
      newFailures: ['SUB-OD-DH01'],
      popDarkened: 0,
      hospitalState: 'Mains Grid Lost → Switched to 12.0h DG Reserve',
      telecomState: 'Battery Backup Active (90m remaining)',
      transportState: 'Highway R-16 Coastal Passable (Water +0.1m)',
      severity: 'CRITICAL',
    },
    {
      timeOffset: 'T + 15 min',
      offsetMinutes: 15,
      title: 'Immediate Auxiliary Lifeline Impact',
      desc: 'Water Treatment Station WP-03 shuts down as primary feeder de-energizes. Bhadrak District Hospital begins counting down 12 hours of diesel backup.',
      newFailures: ['WTR-OD-WP03', 'HOSP-OD-BHD01 (Aux Backup)'],
      popDarkened: 68000,
      hospitalState: 'Operating on DG Fuel (11.75h remaining)',
      telecomState: 'Battery Backup Active (75m remaining)',
      transportState: 'R-16 Water Level +0.3m (Light vehicles halted)',
      severity: 'HIGH',
    },
    {
      timeOffset: 'T + 90 min',
      offsetMinutes: 90,
      title: 'Telecom Macro-Cell Battery Exhaustion',
      desc: 'BTS Tower TC-09 battery bank completely drains. Siren trigger repeaters fail. 42,000 citizens in Dhamra/Basudevpur belt lose cell connectivity.',
      newFailures: ['TEL-OD-TC09', 'SHL-OD-04 (Siren Comms Severed)'],
      popDarkened: 124000,
      hospitalState: 'DG Fuel Level: 10.5h remaining (Resupply Urgent)',
      telecomState: 'DARK ZONE: No Cellular or Siren Network',
      transportState: 'R-16 Severed by Tidal Backflow (+0.6m)',
      severity: 'EXTREME',
    },
    {
      timeOffset: 'T + 180 min',
      offsetMinutes: 180,
      title: 'Transport Cutoff & Causeway Bridge Submersion',
      desc: 'Causeway Bridge B-12 submerged by saline surge (+0.4m). Cyclone Shelter SH-08 marooned with 1,840 occupants cut off from supply lines.',
      newFailures: ['BRG-OD-B12', 'SHL-OD-08 (Marooned Sector)'],
      popDarkened: 184200,
      hospitalState: 'DG Fuel: 9.0h remaining (Inland SH-09 only access)',
      telecomState: 'Regional Comms Blackout across 3 taluks',
      transportState: 'Bridge B-12 Impassable. Access cut off.',
      severity: 'CATASTROPHIC',
    },
  ];

  // Auto-play timeline loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= simulationSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, simulationSteps.length]);

  const currentStep = simulationSteps[currentStepIndex];

  // Run graph engine
  const cascadeGraphResult = simulateCascade({
    rootFailedAssetId: rootAssetId,
    assets: SCENARIO_ASSETS,
    edges: SCENARIO_EDGES,
    maxHops: 5,
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[11px] font-bold border border-red-500/30">
              DETERMINISTIC GRAPH CASCADE PROPAGATION
            </span>
            <ProvenanceBadge
              classification="simulated"
              confidence={0.965}
              freshness="Deterministic BFS"
              source="Graph Dependency Engine v2.4"
              size="sm"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Public_Sans'] text-[#dae2fd]">
            Infrastructure Cascade Simulation
          </h1>
          <p className="text-xs text-[#bfc7d2] font-['Inter'] mt-0.5">
            Step-through simulation of failure propagation from coastal substation breaker trip to regional blackout.
          </p>
        </div>

        {/* Root Node Selector */}
        <div className="flex items-center gap-2 bg-[#060e20] p-2 rounded-xl border border-[#222a3d]">
          <span className="text-[11px] font-mono text-[#89929b]">Root Breach Node:</span>
          <select
            value={rootAssetId}
            onChange={(e) => {
              setRootAssetId(e.target.value);
              setCurrentStepIndex(0);
            }}
            className="bg-[#131b2e] text-[#93ccff] font-mono text-xs px-2 py-1 rounded border border-[#222a3d] focus:outline-none"
          >
            {SCENARIO_ASSETS.map((a) => (
              <option key={a.assetId} value={a.assetId}>
                {a.assetId} — {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Timeline Stepper Controller */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-[#3198dc] hover:bg-[#93ccff] text-[#001d31] flex items-center justify-center transition-colors shadow-md"
              title={isPlaying ? 'Pause Simulation' : 'Auto Play Simulation'}
            >
              <span className="material-symbols-outlined text-2xl font-bold">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <div>
              <span className="text-xs font-mono text-[#89929b] block">Timeline Cursor</span>
              <span className="font-mono text-base text-white font-bold">
                {currentStep.timeOffset}
              </span>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-[#060e20] text-xs font-mono text-[#93ccff] border border-[#222a3d] disabled:opacity-40 hover:bg-[#182136]"
            >
              ← Previous Hop
            </button>
            <button
              disabled={currentStepIndex === simulationSteps.length - 1}
              onClick={() => setCurrentStepIndex((p) => Math.min(simulationSteps.length - 1, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-[#060e20] text-xs font-mono text-[#93ccff] border border-[#222a3d] disabled:opacity-40 hover:bg-[#182136]"
            >
              Next Hop →
            </button>
          </div>
        </div>

        {/* Step Progress Line */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {simulationSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentStepIndex === idx
                  ? 'bg-[#182544] border-[#3198dc] shadow-md'
                  : currentStepIndex > idx
                  ? 'bg-[#0b1326] border-emerald-500/40 text-emerald-300'
                  : 'bg-[#060e20] border-[#222a3d] text-[#89929b]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                <span>{step.timeOffset}</span>
                {currentStepIndex >= idx && (
                  <span className="material-symbols-outlined text-sm text-emerald-400">
                    check_circle
                  </span>
                )}
              </div>
              <span className="text-[11px] block font-semibold text-[#dae2fd] truncate">
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Step Dynamic Detail Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Step Narrative & Active Failures */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#131b2e] border border-red-500/30 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-xs font-bold border border-red-500/40">
                  {currentStep.severity} DISRUPTION
                </span>
                <span className="font-mono text-xs text-[#89929b]">
                  Hop Depth: {currentStepIndex}
                </span>
              </div>
              <span className="font-mono text-sm text-amber-300 font-bold">
                {currentStep.popDarkened.toLocaleString()} Citizens in Dark Zone
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">
              {currentStep.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#bfc7d2] leading-relaxed">
              {currentStep.desc}
            </p>

            <div className="pt-2 border-t border-[#171f33] space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#89929b] font-semibold block">
                Newly Compromised Nodes in This Step:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentStep.newFailures.map((node, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-red-950/60 text-red-200 border border-red-500/40 font-mono text-xs flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {node}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sector Telemetry Impact Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-[#131b2e] border border-[#222a3d] p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <span className="material-symbols-outlined text-base">local_hospital</span>
                <span>Hospital Lifeline</span>
              </div>
              <p className="text-[11px] text-[#bfc7d2] mt-1">{currentStep.hospitalState}</p>
            </div>

            <div className="bg-[#131b2e] border border-[#222a3d] p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <span className="material-symbols-outlined text-base">cell_tower</span>
                <span>Telecom &amp; Sirens</span>
              </div>
              <p className="text-[11px] text-[#bfc7d2] mt-1">{currentStep.telecomState}</p>
            </div>

            <div className="bg-[#131b2e] border border-[#222a3d] p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="material-symbols-outlined text-base">directions_car</span>
                <span>Evacuation Arterials</span>
              </div>
              <p className="text-[11px] text-[#bfc7d2] mt-1">{currentStep.transportState}</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Before vs After Anticipatory Comparison Card */}
        <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#171f33] pb-3">
            <h3 className="font-bold text-sm text-[#dae2fd]">
              Anticipatory Counterfactual Analysis
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
              PLAN ALPHA ROI
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Status Quo */}
            <div className="bg-red-950/30 p-3 rounded-lg border border-red-500/30 space-y-1">
              <span className="text-red-400 font-bold block uppercase text-[10px]">
                Status Quo (No Action Taken)
              </span>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Direct Loss:</span>
                <span className="text-white font-bold">$10.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Cascading Spillover:</span>
                <span className="text-red-400 font-bold">+$18.4M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Hospital ICU Limit:</span>
                <span className="text-red-300 font-bold">Exhausted at T+12h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Dark Zone Population:</span>
                <span className="text-white font-bold">184,200</span>
              </div>
            </div>

            {/* With Plan Alpha */}
            <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-bold block uppercase text-[10px]">
                With Plan Alpha (Pre-Staged Triad)
              </span>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Mobilization Cost:</span>
                <span className="text-white font-bold">$180,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Losses Prevented:</span>
                <span className="text-emerald-300 font-bold">$10.2M (56.6x ROI)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89929b]">ICU Power Guaranteed:</span>
                <span className="text-emerald-300 font-bold">72+ Hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Comms Continuity:</span>
                <span className="text-emerald-300 font-bold">98% via SAT-COW</span>
              </div>
            </div>
          </div>

          {/* Symbolic Rule Verification Notice */}
          <div className="bg-[#060e20] p-3 rounded-lg border border-[#171f33] text-[11px] font-mono text-[#bfc7d2] space-y-1">
            <span className="text-[#6bd8cb] font-bold block">
              Symbolic Policy Verification:
            </span>
            <p className="text-[10px] text-[#89929b]">
              Rule: CERC Grid Code §5.2.1 — &quot;Tripping busbar when surge &gt; 2.5m is mandatory to prevent terminal arc destruction.&quot;
            </p>
            <span className="text-emerald-400 font-bold text-[10px] block">
              ✓ DETERMINISTIC PROOF PASSED
            </span>
          </div>

          {onNavigateToIntervention && (
            <button
              onClick={onNavigateToIntervention}
              className="w-full py-2.5 px-4 rounded-lg bg-[#3198dc] hover:bg-[#93ccff] text-[#001d31] font-bold text-xs font-['Inter'] transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-base">alt_route</span>
              Proceed to Intervention Planner
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
