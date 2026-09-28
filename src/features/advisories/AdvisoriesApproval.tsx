import React, { useState } from 'react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge.tsx';
import { INITIAL_ADVISORIES } from '../../data/coastalScenarioData.ts';
import { MultilingualAdvisoryDraft } from '../../shared/types/index.ts';

interface AdvisoriesApprovalProps {
  onOpen2FAModal: () => void;
  dispatchedAdvisories: string[];
}

export const AdvisoriesApproval: React.FC<AdvisoriesApprovalProps> = ({
  onOpen2FAModal,
  dispatchedAdvisories,
}) => {
  const [advisoryList, setAdvisoryList] = useState<MultilingualAdvisoryDraft[]>(INITIAL_ADVISORIES);
  const [selectedAdvisoryIndex, setSelectedAdvisoryIndex] = useState<number>(0);
  const [activeLang, setActiveLang] = useState<'en' | 'or' | 'hi' | 'te'>('en');

  const currentAdvisory = advisoryList[selectedAdvisoryIndex] || advisoryList[0];
  const isDispatched = dispatchedAdvisories.includes(currentAdvisory.id) || currentAdvisory.isDispatched;

  const currentVersion = currentAdvisory.versions[activeLang];

  const handleToggleChannel = (channel: keyof typeof currentAdvisory.channelsArmed) => {
    setAdvisoryList((prev) =>
      prev.map((adv, idx) => {
        if (idx !== selectedAdvisoryIndex) return adv;
        return {
          ...adv,
          channelsArmed: {
            ...adv.channelsArmed,
            [channel]: !adv.channelsArmed[channel],
          },
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
              DUAL-OFFICER AUTHORIZATION DESK
            </span>
            <ProvenanceBadge
              classification="derived"
              confidence={0.964}
              freshness="2m ago"
              source="Multi-Agent Synthesis (IMD + GEE SAR + Local Knowledge)"
              size="sm"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Public_Sans'] text-[#dae2fd]">
            Multilingual Early Warning Advisories &amp; Authorization
          </h1>
          <p className="text-xs text-[#bfc7d2] font-['Inter'] mt-0.5">
            Strict human-in-the-loop gate requiring dual cryptographic authorization prior to public cell broadcast.
          </p>
        </div>

        {/* Action Button */}
        <button
          disabled={isDispatched}
          onClick={onOpen2FAModal}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs font-['Inter'] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 shrink-0 ${
            isDispatched
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-[#3198dc] hover:bg-[#93ccff] text-[#001d31]'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {isDispatched ? 'check_circle' : 'verified_user'}
          </span>
          {isDispatched ? 'DISPATCHED VIA CELL BROADCAST' : 'Authorize & Disseminate (2FA)'}
        </button>
      </div>

      {/* Main Advisory Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Multilingual Draft Viewer & Channels */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
            {/* Meta Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#171f33] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-xs font-bold">
                  {currentAdvisory.priority}
                </span>
                <span className="font-mono text-xs text-[#93ccff] font-bold">
                  {currentAdvisory.advisoryCode}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-xs text-[#89929b] font-mono">
                  Target Footprint: {currentAdvisory.estimatedReach.toLocaleString()} Citizens
                </span>
              </div>

              {/* Language Selector Tabs */}
              <div className="flex items-center gap-1 bg-[#060e20] p-1 rounded-xl border border-[#222a3d] text-xs font-mono">
                <button
                  onClick={() => setActiveLang('en')}
                  className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                    activeLang === 'en'
                      ? 'bg-[#3198dc] text-[#001d31]'
                      : 'text-[#89929b] hover:text-[#dae2fd]'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveLang('or')}
                  className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                    activeLang === 'or'
                      ? 'bg-[#3198dc] text-[#001d31]'
                      : 'text-[#89929b] hover:text-[#dae2fd]'
                  }`}
                >
                  ଓଡ଼ିଆ (Odia)
                </button>
                <button
                  onClick={() => setActiveLang('hi')}
                  className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                    activeLang === 'hi'
                      ? 'bg-[#3198dc] text-[#001d31]'
                      : 'text-[#89929b] hover:text-[#dae2fd]'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  onClick={() => setActiveLang('te')}
                  className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                    activeLang === 'te'
                      ? 'bg-[#3198dc] text-[#001d31]'
                      : 'text-[#89929b] hover:text-[#dae2fd]'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
              </div>
            </div>

            {/* Advisory Headline & Body Content */}
            <div className="space-y-3 bg-[#060e20] p-4 sm:p-5 rounded-xl border border-[#171f33]">
              <h2 className="text-base sm:text-lg font-bold text-red-300 font-['Public_Sans'] leading-snug">
                {currentVersion.headline}
              </h2>
              <p className="text-xs sm:text-sm text-[#dae2fd] leading-relaxed whitespace-pre-line font-['Inter']">
                {currentVersion.body}
              </p>
            </div>

            {/* Key Actionable Lifeline Bulletins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#060e20] p-3 rounded-lg border border-emerald-500/30 space-y-1">
                <span className="text-emerald-400 font-bold block">
                  Mandatory Evacuation Corridor:
                </span>
                <span className="text-white block font-semibold">
                  {currentAdvisory.keyInstructions.evacRoute}
                </span>
              </div>

              <div className="bg-[#060e20] p-3 rounded-lg border border-cyan-500/30 space-y-1">
                <span className="text-cyan-400 font-bold block">
                  Designated Safe Shelters:
                </span>
                <span className="text-white block font-semibold">
                  {currentAdvisory.keyInstructions.safeShelters.join(', ')} (Open &amp; Stocked)
                </span>
              </div>

              <div className="bg-[#060e20] p-3 rounded-lg border border-amber-500/30 space-y-1">
                <span className="text-amber-400 font-bold block">
                  Critical Hazard Warning:
                </span>
                <span className="text-[#dae2fd] block">
                  {currentAdvisory.keyInstructions.hazardAlert}
                </span>
              </div>

              <div className="bg-[#060e20] p-3 rounded-lg border border-[#222a3d] space-y-1">
                <span className="text-[#89929b] font-bold block">
                  District EOC Emergency Helpline:
                </span>
                <span className="text-[#6bd8cb] block text-base font-bold">
                  {currentAdvisory.keyInstructions.helpline}
                </span>
              </div>
            </div>

            {/* Armed Broadcast Channels Checklist */}
            <div className="pt-2 border-t border-[#171f33] space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#89929b] font-semibold block">
                Armed Dissemination Gateways (Select to Arm):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                {Object.entries(currentAdvisory.channelsArmed).map(([channel, isArmed]) => (
                  <button
                    key={channel}
                    onClick={() => handleToggleChannel(channel as keyof typeof currentAdvisory.channelsArmed)}
                    className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                      isArmed
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-[#060e20] border-[#222a3d] text-[#89929b]'
                    }`}
                  >
                    <span className="capitalize">
                      {channel.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="material-symbols-outlined text-sm">
                      {isArmed ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Safety Guardrails & Forensic Verification */}
        <div className="space-y-4">
          <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#171f33] pb-2">
              <h3 className="font-bold text-sm text-[#dae2fd]">
                Forensic Safety Guardrails
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                100% PASSED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-base">
                  verified
                </span>
                <div>
                  <span className="font-semibold text-white block">
                    Zero Prohibited Claims Check
                  </span>
                  <p className="text-[11px] text-[#89929b]">
                    No speculative death tolls or unauthorized evacuation zones generated.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-base">
                  verified
                </span>
                <div>
                  <span className="font-semibold text-white block">
                    Geographic Precision Check
                  </span>
                  <p className="text-[11px] text-[#89929b]">
                    Validated against Bhadrak / Dhamra boundary polygon.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-base">
                  verified
                </span>
                <div>
                  <span className="font-semibold text-white block">
                    Official Terminology Alignment
                  </span>
                  <p className="text-[11px] text-[#89929b]">
                    IMD standard scale: &quot;Category 4 Super Cyclone&quot; verified.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-400 text-base">
                  verified
                </span>
                <div>
                  <span className="font-semibold text-white block">
                    Actionable Lifeline Verified
                  </span>
                  <p className="text-[11px] text-[#89929b]">
                    Highway SH-09 verified dry &amp; shelters SH-01 to 12 ready for ingress.
                  </p>
                </div>
              </div>
            </div>

            {/* Dual Authorization escrows */}
            <div className="bg-[#060e20] p-3 rounded-xl border border-[#222a3d] space-y-2 font-mono text-xs">
              <span className="text-[#89929b] text-[10px] uppercase block">
                Dual Sign-Off Status:
              </span>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#dae2fd]">Key 1: Incident Commander</span>
                <span className="text-amber-400 font-bold">CHALLENGE READY</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#dae2fd]">Key 2: District Collector Escrow</span>
                <span className="text-emerald-400 font-bold">PRE-APPROVED</span>
              </div>
            </div>

            <button
              disabled={isDispatched}
              onClick={onOpen2FAModal}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs font-['Inter'] transition-colors flex items-center justify-center gap-2 shadow-md ${
                isDispatched
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-[#3198dc] hover:bg-[#93ccff] text-[#001d31]'
              }`}
            >
              <span className="material-symbols-outlined text-base">verified_user</span>
              {isDispatched ? 'Dispatched to Emergency Gateways' : 'Open 2FA Authorization Terminal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
