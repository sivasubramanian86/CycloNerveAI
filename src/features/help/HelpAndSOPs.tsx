import React, { useState } from 'react';

export const HelpAndSOPs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'sop' | 'faq' | 'contacts'>('sop');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold border border-blue-500/30 block w-fit mb-1">
            STANDARD OPERATING PROCEDURES &amp; REFERENCE
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-['Public_Sans'] text-[#dae2fd]">
            Operational Protocols, SOPs &amp; FAQ
          </h1>
          <p className="text-xs text-[#bfc7d2] font-['Inter'] mt-0.5">
            Statutory authorities, engineering rulesets, dual-authorization rules, and frequently asked questions.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#060e20] p-1 rounded-xl border border-[#222a3d] text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveSection('sop')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeSection === 'sop'
                ? 'bg-[#3198dc] text-[#001d31]'
                : 'text-[#89929b] hover:text-[#dae2fd]'
            }`}
          >
            Statutory SOPs
          </button>
          <button
            onClick={() => setActiveSection('faq')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeSection === 'faq'
                ? 'bg-[#3198dc] text-[#001d31]'
                : 'text-[#89929b] hover:text-[#dae2fd]'
            }`}
          >
            Knowledge Base / FAQ
          </button>
          <button
            onClick={() => setActiveSection('contacts')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeSection === 'contacts'
                ? 'bg-[#3198dc] text-[#001d31]'
                : 'text-[#89929b] hover:text-[#dae2fd]'
            }`}
          >
            Command Tree
          </button>
        </div>
      </div>

      {/* Section 1: Standard Operating Procedures (SOPs) */}
      {activeSection === 'sop' && (
        <div className="space-y-4">
          <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
            <div className="border-b border-[#171f33] pb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3198dc]">policy</span>
                NDMA SOP §4.2: Anticipatory Action &amp; Evacuation Protocol
              </h2>
              <span className="text-xs font-mono text-[#89929b]">
                National Disaster Management Authority Guidelines (Act 2005)
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#dae2fd]">
              <p>
                <strong>1. Pre-Landfall Golden Window:</strong> All physical mobilization of heavy diesel bowsers, mobile dewatering units, and life-support assets MUST commence at least <strong>12 hours before predicted landfall</strong>, and terminate before the anticipated submersion cutoff time of primary coastal arterial routes.
              </p>
              <p>
                <strong>2. Dual-Key Authorization:</strong> Under Section 24 of the Disaster Management Act, public cell broadcasts, municipal audio siren triggers, and emergency evacuations exceeding 50,000 citizens require simultaneous sign-off from both the designated Incident Commander and the District Collector or Grid Escrow officer.
              </p>
              <p>
                <strong>3. ICU Lifeline Guarantee:</strong> Tier-1 district general hospitals caring for ventilated, neonatal, or surgical patients MUST have guaranteed minimum fuel reserves of 72 hours, or undergo precautionary medical evacuation via designated inland corridors.
              </p>
            </div>
          </div>

          <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
            <div className="border-b border-[#171f33] pb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">electrical_services</span>
                CERC Indian Electricity Grid Code §5.2.1
              </h2>
              <span className="text-xs font-mono text-[#89929b]">
                Central Electricity Regulatory Commission Protective Standards
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#dae2fd]">
              <p>
                <strong>Substation Inundation Isolation:</strong> When flood or storm surge waters exceed <strong>+0.5 meters above the primary dyke floodwall</strong> or reach the busbar base foundation, transmission grid control operators must execute automated busbar islanding. This prevents explosive terminal arc faults and limits replacement lead times from 18 months down to 48 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Knowledge Base & FAQ */}
      {activeSection === 'faq' && (
        <div className="space-y-4">
          <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white border-b border-[#171f33] pb-2">
              Frequently Asked Questions (FAQ)
            </h2>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-[#93ccff] text-sm">
                  Q1: How does CycloNerveAI differ from standard meteorological cyclone trackers?
                </h4>
                <p className="text-[#bfc7d2] leading-relaxed">
                  Traditional cyclone platforms show track cones and satellite clouds. CycloNerveAI is a <strong>Neuro-Symbolic Infrastructure Mesh</strong>: it couples meteorology with physical infrastructure graphs (power substations, hospitals, BTS towers, water plants, bridges) to predict <em>cascading second- and third-order failures</em> and rank interventions before disaster strikes.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#171f33]">
                <h4 className="font-bold text-[#93ccff] text-sm">
                  Q2: Why are deterministic algorithms used instead of raw LLM outputs for arithmetic?
                </h4>
                <p className="text-[#bfc7d2] leading-relaxed">
                  Large Language Models are prone to arithmetic drift and hallucinations. CycloNerveAI calculates risk using verified deterministic functions (<code className="font-mono text-white">Risk = H × E × V × C</code>) and computes cascades via graph breadth-first search. Generative AI is strictly used for multimodal synthesis and multilingual advisory drafts, bounded by rigid safety guardrails.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#171f33]">
                <h4 className="font-bold text-[#93ccff] text-sm">
                  Q3: What do the Data Provenance badges indicate?
                </h4>
                <p className="text-[#bfc7d2] leading-relaxed">
                  Every data point is explicitly tagged: <strong>[OBS] Observed</strong> (live physical telemetry from SCADA, Doppler radar), <strong>[FCST] Forecast</strong> (numerical weather models), <strong>[DERV] Derived</strong> (SAR satellite flood extents), and <strong>[SIM] Simulated</strong> (scenario simulations). This ensures emergency personnel always know whether they are looking at ground truth or projections.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#171f33]">
                <h4 className="font-bold text-[#93ccff] text-sm">
                  Q4: What happens during Degraded Air-Gap Mode?
                </h4>
                <p className="text-[#bfc7d2] leading-relaxed">
                  If storm winds sever terrestrial fiber cables, CycloNerveAI seamlessly falls back to satellite uplinks (GSAT-7A Ku-Band) or complete air-gapped local execution on edge server hardware, ensuring uninterrupted decision support.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Command Tree & Emergency Roster */}
      {activeSection === 'contacts' && (
        <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white border-b border-[#171f33] pb-2">
            Incident Command Directory &amp; Escalation Tree
          </h2>

          <div className="divide-y divide-[#171f33] text-xs font-mono">
            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-bold text-white">State Incident Commander (EOC HQ)</span>
                <span className="text-[#89929b] block text-[11px]">Dr. A. Sharma (IAS)</span>
              </div>
              <span className="text-[#6bd8cb] font-bold">+91 674 239XXXX (Secured VOIP)</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-bold text-white">District Collector &amp; DM (Bhadrak)</span>
                <span className="text-[#89929b] block text-[11px]">Collectorate Emergency Desk</span>
              </div>
              <span className="text-[#6bd8cb] font-bold">1077 (Toll-Free)</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-bold text-white">NDRF 3rd Battalion Headquarters</span>
                <span className="text-[#89929b] block text-[11px]">Mundali / Dhamra Quick Response Team</span>
              </div>
              <span className="text-[#6bd8cb] font-bold">+91 671 287XXXX</span>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-bold text-white">State Load Despatch Centre (OPTCL)</span>
                <span className="text-[#89929b] block text-[11px]">Grid Islanding Control Desk</span>
              </div>
              <span className="text-[#6bd8cb] font-bold">+91 674 254XXXX</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
