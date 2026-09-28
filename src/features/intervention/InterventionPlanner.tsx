import React, { useState } from 'react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge.tsx';
import { SCENARIO_INTERVENTION_PLANS } from '../../data/coastalScenarioData.ts';
import { InterventionPlan } from '../../shared/types/index.ts';

interface InterventionPlannerProps {
  onOpen2FAModal: () => void;
  stagedPlanId: string;
  onSetStagedPlanId: (id: string) => void;
}

export const InterventionPlanner: React.FC<InterventionPlannerProps> = ({
  onOpen2FAModal,
  stagedPlanId,
  onSetStagedPlanId,
}) => {
  const [plans, setPlans] = useState<InterventionPlan[]>(SCENARIO_INTERVENTION_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(stagedPlanId || 'PLAN-ALPHA-01');

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleStageToggle = (planId: string) => {
    onSetStagedPlanId(planId);
    setPlans((prev) =>
      prev.map((p) => ({
        ...p,
        isStaged: p.id === planId,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
              PARETO-OPTIMAL INTERVENTION AGENT
            </span>
            <ProvenanceBadge
              classification="derived"
              confidence={0.942}
              freshness="Deterministic Optimization"
              source="Simplex Constraint Solver v3.1"
              size="sm"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Public_Sans'] text-[#dae2fd]">
            Anticipatory Intervention Planner
          </h1>
          <p className="text-xs text-[#bfc7d2] font-['Inter'] mt-0.5">
            Pre-landfall resource allocation ranked by risk reduction, casualty prevention, and cascading ROI.
          </p>
        </div>

        {/* 2FA Dispatch Button */}
        <button
          onClick={onOpen2FAModal}
          className="px-4 py-2.5 rounded-xl bg-[#3198dc] hover:bg-[#93ccff] text-[#001d31] font-bold text-xs font-['Inter'] transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-98 shrink-0"
        >
          <span className="material-symbols-outlined text-base">verified_user</span>
          Authorize Staged Dispatch (2FA)
        </button>
      </div>

      {/* Plan Selection Cards Grid (Alpha, Bravo, Charlie) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          const isStaged = stagedPlanId === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-[#182544] border-[#3198dc] shadow-xl'
                  : 'bg-[#131b2e] border-[#222a3d] hover:border-[#3198dc]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#6bd8cb]">
                    RANK #{plan.rank} • {plan.codename}
                  </span>
                  {isStaged && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                      STAGED FOR DISPATCH
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-[#dae2fd] leading-tight">
                  {plan.title}
                </h3>
                <p className="text-xs text-[#bfc7d2] mt-2 line-clamp-2">
                  {plan.summary}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#171f33] font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Risk Reduction:</span>
                  <span className="text-emerald-400 font-bold">
                    {plan.riskReductionPercent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Mobilization Cost:</span>
                  <span className="text-white font-bold">${plan.totalCostUsd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Avoided Loss:</span>
                  <span className="text-[#93ccff] font-bold">
                    ${(plan.avoidedLossUsd / 1000000).toFixed(1)}M ({plan.roiMultiplier}x ROI)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">ICU Beds Shielded:</span>
                  <span className="text-amber-300 font-bold">{plan.protectedIcuBeds} Beds</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStageToggle(plan.id);
                }}
                className={`w-full py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
                  isStaged
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-[#060e20] text-[#93ccff] border border-[#222a3d] hover:bg-[#1c2742]'
                }`}
              >
                {isStaged ? '✓ Currently Staged' : 'Stage This Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Plan In-Depth Execution Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tactical Action Sequence & Teams */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#171f33] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#dae2fd]">
                  {selectedPlan.codename}: Action Sequence &amp; Logistics
                </h3>
                <span className="text-xs text-[#89929b] font-mono">
                  {selectedPlan.actions.length} Critical Path Deployments
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#060e20] border border-[#222a3d] font-mono text-xs text-[#6bd8cb] font-bold">
                {selectedPlan.committedUnitsSummary}
              </span>
            </div>

            {/* Actions List */}
            <div className="space-y-3">
              {selectedPlan.actions.map((act) => (
                <div
                  key={act.id}
                  className="bg-[#060e20] border border-[#222a3d] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#3198dc]/20 text-[#93ccff] font-mono font-bold flex items-center justify-center text-[11px]">
                        {act.order}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#dae2fd]">
                        {act.title}
                      </span>
                      {act.isCriticalPath && (
                        <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono text-[10px] font-bold border border-red-500/30">
                          CRITICAL PATH
                        </span>
                      )}
                    </div>
                    <p className="text-[#89929b] text-[11px] leading-relaxed">
                      {act.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-[#bfc7d2]">
                      <span>Target: <strong className="text-white">{act.targetAssetId}</strong></span>
                      <span>•</span>
                      <span>Unit: <strong className="text-[#6bd8cb]">{act.requiredTeamType}</strong></span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 font-mono">
                    <span className="text-emerald-400 font-bold">
                      ${act.costUsd.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#89929b]">
                      Lead: {act.leadTimeHours}h / Arr: T-{act.arrivalWindowHours}h
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-bold uppercase border border-blue-500/30">
                      {act.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Operational Trade-offs & Constraints */}
        <div className="space-y-4">
          <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-[#dae2fd] border-b border-[#171f33] pb-2">
              Operational Trade-Off Assessment
            </h3>

            <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <span className="material-symbols-outlined text-base">balance</span>
                <span>Calculated Trade-Off</span>
              </div>
              <p className="text-[#bfc7d2] text-[11px] leading-relaxed">
                {selectedPlan.operationalTradeOff}
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <span className="text-[11px] uppercase tracking-wider text-[#89929b] font-semibold block">
                Statutory Constraints Verified:
              </span>
              <div className="space-y-1 text-[#dae2fd]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>NDMA SOP §4.2 Anticipatory Dispatch Gate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>CERC Grid Code 220kV Isolation Protocol</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>Disaster Management Act 2005 §24 Authority</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#171f33]">
              <button
                onClick={onOpen2FAModal}
                className="w-full py-2.5 px-4 rounded-lg bg-[#3198dc] hover:bg-[#93ccff] text-[#001d31] font-bold text-xs font-['Inter'] transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-base">verified_user</span>
                Authorize Deployment with 2FA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
