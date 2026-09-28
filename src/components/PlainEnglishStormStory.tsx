/**
 * CycloNerveAI - The Human Story of the Storm (The 5 Ws & How)
 * Designed so that anyone—a child, an affected family, or an Incident Commander—
 * can understand Who, What, When, Where, Why, and How this cyclone affects human lives.
 * Replaces the "alien spaceship" feeling with empathy, clarity, and heart.
 */

import React, { useState } from 'react';
import { 
  Users, 
  Waves, 
  Clock, 
  MapPin, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GlobalCycloneRegion } from '../data/globalCycloneRegions.ts';

interface PlainEnglishStormStoryProps {
  region: GlobalCycloneRegion;
  onNavigateToCascade?: () => void;
  onNavigateToIntervention?: () => void;
}

export const PlainEnglishStormStory: React.FC<PlainEnglishStormStoryProps> = ({
  region,
  onNavigateToCascade,
  onNavigateToIntervention,
}) => {
  const [isKidFriendlyMode, setIsKidFriendlyMode] = useState<boolean>(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('why');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const actionHours = Math.floor(region.interventionHighlight.actionWindowHours);
  const actionMins = Math.round((region.interventionHighlight.actionWindowHours % 1) * 60);

  return (
    <div className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-colors">
      
      {/* Friendly Header with Kid Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#222a3d]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-red-500/20 border border-amber-500/30 rounded-xl text-amber-400">
            <Heart className="w-6 h-6 text-red-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-['Public_Sans'] text-[#dae2fd]">
                The Story of the Storm: Explained for Humans
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6bd8cb]/20 text-[#6bd8cb] border border-[#6bd8cb]/40">
                5 Ws &amp; HOW
              </span>
            </div>
            <p className="text-xs text-[#bfc7d2] mt-0.5 font-['Inter']">
              Clear, gentle answers for everyday families, local teachers, and emergency teams.
            </p>
          </div>
        </div>

        {/* Kid-Friendly / Simple Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#0b1326] p-1.5 rounded-xl border border-[#222a3d] shrink-0">
          <button
            onClick={() => setIsKidFriendlyMode(true)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isKidFriendlyMode
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-[#89929b] hover:text-[#dae2fd]'
            }`}
          >
            <span>🧒 Simple Story Mode</span>
          </button>
          <button
            onClick={() => setIsKidFriendlyMode(false)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              !isKidFriendlyMode
                ? 'bg-[#3198dc] text-[#002c47] shadow-sm font-bold'
                : 'text-[#89929b] hover:text-[#dae2fd]'
            }`}
          >
            <span>🛡️ EOC Commander Mode</span>
          </button>
        </div>
      </div>

      {/* 6 Grid Cards for Who, What, When, Where, Why, How */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        
        {/* 1. WHO */}
        <div className="bg-[#0b1326] border border-[#222a3d] p-4 rounded-xl flex flex-col justify-between hover:border-[#3198dc]/40 transition-all">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-4 h-4" />
              <span>WHO is in danger?</span>
            </div>
            <h3 className="text-sm font-bold text-[#dae2fd] mb-1">
              {region.populationAtRisk} Neighbors &amp; Families
            </h3>
            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              {isKidFriendlyMode ? (
                <>
                  Moms, dads, grandmothers, and school children living near the coast, plus{' '}
                  <strong className="text-amber-300">48 patients in the hospital</strong> and doctors keeping oxygen machines running.
                </>
              ) : (
                <>
                  Estimated population footprint in primary storm surge zone: {region.populationAtRisk}. 
                  Key vulnerable populations: {region.criticalLifelines.primaryHospital} (trauma &amp; ICU).
                </>
              )}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#171f33] text-[11px] text-[#6bd8cb] font-mono flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-400" />
            <span>Priority: Zero lives lost</span>
          </div>
        </div>

        {/* 2. WHAT */}
        <div className="bg-[#0b1326] border border-[#222a3d] p-4 rounded-xl flex flex-col justify-between hover:border-[#3198dc]/40 transition-all">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <Waves className="w-4 h-4" />
              <span>WHAT is happening?</span>
            </div>
            <h3 className="text-sm font-bold text-[#dae2fd] mb-1">
              {region.activeCyclone.category}
            </h3>
            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              {isKidFriendlyMode ? (
                <>
                  The ocean wind is pushing a giant{' '}
                  <strong className="text-cyan-300">{region.activeCyclone.surgePeakMeters}-meter wall of sea water</strong> ashore. 
                  It is taller than the concrete protection wall at {region.criticalLifelines.primarySubstation}!
                </>
              ) : (
                <>
                  Severe cyclonic vortex ({region.activeCyclone.windKmh} km/h sustained, gusts {region.activeCyclone.gustsKmh} km/h). 
                  Coastal storm surge peak: {region.activeCyclone.surgePeakMeters}m overtopping coastal floodwalls.
                </>
              )}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#171f33] text-[11px] text-amber-300 font-mono">
            <span>Threat: {region.topRiskThreat}</span>
          </div>
        </div>

        {/* 3. WHEN */}
        <div className="bg-[#0b1326] border border-[#222a3d] p-4 rounded-xl flex flex-col justify-between hover:border-[#3198dc]/40 transition-all">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              <span>WHEN will it strike?</span>
            </div>
            <h3 className="text-sm font-bold text-[#dae2fd] mb-1">
              Landfall in {region.activeCyclone.hoursToLandfall} Hours
            </h3>
            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              {isKidFriendlyMode ? (
                <>
                  The storm center arrives in {region.activeCyclone.hoursToLandfall} hours. But we must act in the next{' '}
                  <strong className="text-amber-400 font-bold">{actionHours} hours and {actionMins} minutes</strong> before the highway fills with water!
                </>
              ) : (
                <>
                  Anticipatory golden window: {actionHours}h {actionMins}m before road and logistics severance. 
                  Landfall estimated at {region.activeCyclone.landfallTarget}.
                </>
              )}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#171f33] text-[11px] text-red-300 font-mono font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>Clock ticking: Safe window closing</span>
          </div>
        </div>

        {/* 4. WHERE */}
        <div className="bg-[#0b1326] border border-[#222a3d] p-4 rounded-xl flex flex-col justify-between hover:border-[#3198dc]/40 transition-all">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <MapPin className="w-4 h-4" />
              <span>WHERE is the danger?</span>
            </div>
            <h3 className="text-sm font-bold text-[#dae2fd] mb-1 truncate">
              {region.regionName}
            </h3>
            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              {isKidFriendlyMode ? (
                <>
                  Target: <strong>{region.activeCyclone.landfallTarget}</strong>.
                  The sea will hit the port, the electric substation, the main town bridge, and coastal schools.
                </>
              ) : (
                <>
                  Geographic focal center: Lat {region.radarCenter.lat.toFixed(2)}, Lng {region.radarCenter.lng.toFixed(2)}. 
                  Primary lifeline nodes: {region.criticalLifelines.portOrHarbor}, {region.criticalLifelines.primaryShelter}.
                </>
              )}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#171f33] text-[11px] text-[#bfc7d2] font-mono truncate">
            <span>Shelter: {region.criticalLifelines.primaryShelter}</span>
          </div>
        </div>

        {/* 5. WHY: THE CASCADE DOMINO (Highlighted) */}
        <div className="bg-[#0b1326] border-2 border-red-500/50 p-4 rounded-xl flex flex-col justify-between relative shadow-md">
          <div className="absolute top-2 right-2">
            <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 text-[9px] font-mono font-bold">
              DOMINO EFFECT
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4" />
              <span>WHY does electricity break hospitals?</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              The 4-Step Chain Reaction
            </h3>
            <div className="text-xs text-[#dae2fd] space-y-1.5 mt-2 bg-[#060e20] p-2.5 rounded-lg border border-[#222a3d]">
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-red-400">1.</span>
                <span>Seawater floods {region.criticalLifelines.primarySubstation}.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-amber-400">2.</span>
                <span>Power switches off across towns to prevent fire.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-amber-300">3.</span>
                <span>{region.criticalLifelines.primaryHospital} switches to emergency fuel (12h limit).</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-cyan-400">4.</span>
                <span>{region.criticalLifelines.telecomHub} loses battery, silencing rescue phones.</span>
              </div>
            </div>
          </div>
          {onNavigateToCascade && (
            <button
              onClick={onNavigateToCascade}
              className="mt-3 pt-2 text-[11px] font-mono text-[#93ccff] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>See the Live Domino Cascade Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 6. HOW: THE ANTICIPATORY PLAN */}
        <div className="bg-[#0b1326] border-2 border-[#29a195]/60 p-4 rounded-xl flex flex-col justify-between relative shadow-md">
          <div className="absolute top-2 right-2">
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
              PROTECTION PLAN
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[#6bd8cb] font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>HOW do we protect everyone?</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1 truncate">
              {region.interventionHighlight.planCode}: {region.interventionHighlight.title}
            </h3>
            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              {isKidFriendlyMode ? (
                <>
                  Instead of waiting for the disaster, we send{' '}
                  <strong className="text-[#6bd8cb]">heavy water pumps and extra generator diesel</strong> directly to the hospital and substation <em>before</em> the storm hits.
                </>
              ) : (
                <>
                  Anticipatory action staging with verified{' '}
                  <strong>{region.interventionHighlight.roiMultiplier}x ROI multiplier</strong>, preventing{' '}
                  {region.interventionHighlight.currencySymbol}{region.interventionHighlight.avoidedDamageInMillions}M in direct public infrastructure destruction.
                </>
              )}
            </p>
          </div>
          {onNavigateToIntervention && (
            <button
              onClick={onNavigateToIntervention}
              className="mt-3 pt-2 text-[11px] font-mono text-[#6bd8cb] hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>Inspect Action Plan &amp; Deploy</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
