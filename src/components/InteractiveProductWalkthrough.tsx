/**
 * CycloNerveAI - 1-Click Interactive Operational Walkthrough
 * Highlights the 3 best "Aha!" moments in under 60 seconds for evaluators and Incident Commanders.
 * Zero Geek Jargon: Focuses strictly on physical lifelines, flood breaches, and anticipatory actions.
 */

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Waves, Network, ShieldCheck, Compass, X } from 'lucide-react';
import { NavRoute } from './Sidebar.tsx';

interface WalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: NavRoute) => void;
}

export const InteractiveProductWalkthrough: React.FC<WalkthroughProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      stepNumber: '1 of 3',
      title: 'Aha 1: Deterministic Floodwall Breach Prediction',
      tagline: 'Physical arithmetic replacing black-box guesswork.',
      body: 'At Dhamra Substation, the predicted storm surge of 3.6m exceeds the 2.8m perimeter floodwall by +0.80m. CycloNerveAI computes composite risk strictly as H × E × V × C, triggering a statutory breach warning under CERC Grid Code standards 14 hours before landfall.',
      routeToNavigate: 'situation-overview' as NavRoute,
      icon: Waves,
      highlightBadge: 'Physical Surge Deficit: +0.80m Breach • Zero Hallucinations',
      actionLabel: 'Explore Situation Room',
    },
    {
      stepNumber: '2 of 3',
      title: 'Aha 2: Multi-Step Lifeline Cascade Propagation',
      tagline: 'Predicting second and third-order failures across civil infrastructure.',
      body: 'When the primary substation trips, power loss instantly cascades to Bhadrak District Hospital (where 24 ICU ventilators switch to 6-hour diesel backup) and 4 coastal telecom towers (draining battery buffers in 4 hours). The Directed Acyclic Graph prevents duplicate impact counting.',
      routeToNavigate: 'cascade-simulation' as NavRoute,
      icon: Network,
      highlightBadge: 'Multi-Step Lifeline DAG • Cycle-Safe & Deduplicated',
      actionLabel: 'Inspect Lifeline Cascade Graph',
    },
    {
      stepNumber: '3 of 3',
      title: 'Aha 3: Anticipatory Action Staging & Dual-Officer Dispatch',
      tagline: 'Act before landfall with human-in-the-loop statutory certification.',
      body: 'Plan Alpha stages 4 high-capacity mobile dewatering pumps and a 500kVA mobile genset at Bhadrak Hospital, delivering ₹78 Lakhs in avoided damage with a 4.22x ROI. Public dissemination requires Dual-Officer 2FA certification—no alert is ever broadcast autonomously.',
      routeToNavigate: 'advisories-and-approval' as NavRoute,
      icon: ShieldCheck,
      highlightBadge: 'Dual-Officer FIDO2 Certification • Multilingual CAP Broadcast',
      actionLabel: 'Review Advisory & Dispatch Desk',
    },
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    onNavigate(current.routeToNavigate);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="max-w-xl w-full p-6 bg-[#131b2e] border border-[#222a3d] shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-lg text-[#dae2fd] relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[#222a3d] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#171f33] border border-[#3198dc]/30 rounded text-[#3198dc]">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-[#93ccff]">
              60-Second Operational Walkthrough • {current.stepNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono text-[#89929b] hover:text-[#dae2fd] underline cursor-pointer"
          >
            Skip Tour
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#171f33] border border-[#3198dc]/30 rounded-lg shrink-0">
              <Icon className="w-6 h-6 text-[#93ccff]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#dae2fd] leading-snug">
                {current.title}
              </h3>
              <p className="text-xs text-[#6bd8cb] font-mono mt-0.5">
                {current.tagline}
              </p>
            </div>
          </div>

          <p className="text-sm text-[#bfc7d2] leading-relaxed bg-[#0b1326] p-3.5 border border-[#222a3d] rounded">
            {current.body}
          </p>

          <div className="flex items-center gap-2 text-xs font-mono bg-[#171f33] text-[#6bd8cb] px-3 py-1.5 border border-[#29a195]/30 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6bd8cb]" />
            <span>{current.highlightBadge}</span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#222a3d]">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-[#3198dc]' : 'w-2 bg-[#222a3d]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-4 py-2 bg-[#3198dc] hover:bg-[#2080c0] text-[#002c47] font-semibold text-xs font-mono flex items-center gap-2 rounded transition-colors cursor-pointer"
          >
            <span>{currentStep === steps.length - 1 ? 'Finish Tour & Take Command' : 'Next Milestone'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
