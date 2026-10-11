import React, { useState } from 'react';
import {
  SUPPORTED_COMMUNITY_LANGUAGES,
  VernacularLanguage,
  HazardCategory,
  CitizenHazardReport,
} from './citizenTypes.ts';
import { communityService } from './communityService.ts';
import { ProvenanceBadge } from '../../components/ProvenanceBadge.tsx';
import {
  ShieldAlert,
  MapPin,
  Mic,
  Camera,
  Radio,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Share2,
  Users,
  Compass,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';

interface JanRakshaPortalProps {
  onReportSubmittedToMesh?: (report: CitizenHazardReport) => void;
}

export const JanRakshaCitizenPortal: React.FC<JanRakshaPortalProps> = ({
  onReportSubmittedToMesh,
}) => {
  // Navigation Tabs: 'shelters' | 'reporter' | 'voice' | 'offline_sms'
  const [activeTab, setActiveTab] = useState<'shelters' | 'reporter' | 'voice' | 'offline_sms'>('shelters');
  const [selectedLanguage, setSelectedLanguage] = useState<VernacularLanguage>('od'); // Odia default for Bay of Bengal coast
  const [portalMode, setPortalMode] = useState<'citizen' | 'volunteer'>('citizen');

  // Shelter state
  const shelters = communityService.getNearestSafeShelters();

  // Voice AI State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceSpokenText, setVoiceSpokenText] = useState<string>(
    'ନମସ୍କାର! ଭଦ୍ରକ ମଡେଲ ସୁପର-ଶେଲ୍ଟର ସବୁଠାରୁ ନିରାପଦ ଅଟେ। ସେଠାରେ ପିଇବା ପାଣି, ଲାଇଟ୍ ଏବଂ ଡାକ୍ତର ଅଛନ୍ତି।'
  );

  // Field Hazard Reporter State
  const [selectedCategory, setSelectedCategory] = useState<HazardCategory>('ROAD_BREACH');
  const [reportVillage, setReportVillage] = useState<string>('Dhamra Coastal Ward 4');
  const [reportDescription, setReportDescription] = useState<string>('Sea water overflowed the coastal bund road. Water is 2.5 feet deep.');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
  const [recentSubmittedReport, setRecentSubmittedReport] = useState<CitizenHazardReport | null>(null);

  // Offline SMS Beacon State
  const [smsHeadcount, setSmsHeadcount] = useState<number>(4);
  const [hasVulnerableMember, setHasVulnerableMember] = useState<boolean>(true);
  const [smsUrgentNeed, setSmsUrgentNeed] = useState<string>('Evacuation Boat & Infant Food');

  const generatedSms = communityService.generateOfflineSmsBeacon({
    villageName: reportVillage,
    lat: 20.814,
    lng: 86.955,
    peopleHeadcount: smsHeadcount,
    hasInfantOrElderly: hasVulnerableMember,
    urgentNeed: smsUrgentNeed,
  });

  // Handle Speech Output using Web Speech API
  const handleSpeak = (questionKey: string) => {
    const { text, audioLanguageCode } = communityService.getVernacularVoiceGuidance(questionKey, selectedLanguage);
    setVoiceSpokenText(text);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = audioLanguageCode;
      utterance.rate = 0.95; // Clear, measured pace for emergency announcements

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  // Submit Multimodal Report
  const handleSubmitHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);

    try {
      const newReport = await communityService.submitHazardReport({
        villageName: reportVillage,
        category: selectedCategory,
        description: reportDescription,
        reporterRole: portalMode === 'citizen' ? 'Citizen' : 'Panchayat Volunteer',
      });

      setRecentSubmittedReport(newReport);
      if (onReportSubmittedToMesh) {
        onReportSubmittedToMesh(newReport);
      }
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12 font-['Inter']">
      
      {/* Grassroots Banner with Language & Role Switcher */}
      <div className="bg-gradient-to-r from-[#0d2238] via-[#102a45] to-[#131b2e] border border-[#224466] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3198dc] to-[#6bd8cb] flex items-center justify-center text-[#060e20] shadow-md shadow-cyan-500/30 shrink-0">
              <span className="material-symbols-outlined text-3xl font-bold">diversity_1</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Jan-Raksha • ଜନ-ରକ୍ଷା
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  LIVE COMMUNITY LIFELINE
                </span>
              </div>
              <p className="text-xs text-[#9ec5e8] mt-0.5">
                Citizen-first disaster companion • Verified safe shelters, multimodal crowd reporting & vernacular voice
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#89929b] font-mono hidden md:inline">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const lang = e.target.value as VernacularLanguage;
                setSelectedLanguage(lang);
                const { text } = communityService.getVernacularVoiceGuidance('nearest_shelter', lang);
                setVoiceSpokenText(text);
              }}
              className="bg-[#171f33] border border-[#2d3b55] text-white text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3198dc]"
            >
              {SUPPORTED_COMMUNITY_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Portal Mode Toggle: Citizen vs Volunteer */}
        <div className="mt-4 pt-3 border-t border-[#1e344e] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center bg-[#091424] p-1 rounded-xl border border-[#1b3149]">
            <button
              onClick={() => setPortalMode('citizen')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                portalMode === 'citizen'
                  ? 'bg-[#3198dc] text-white shadow-sm'
                  : 'text-[#89929b] hover:text-white'
              }`}
            >
              🧑‍🌾 Citizen / Family Mode
            </button>
            <button
              onClick={() => setPortalMode('volunteer')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                portalMode === 'volunteer'
                  ? 'bg-amber-500 text-slate-900 shadow-sm'
                  : 'text-[#89929b] hover:text-white'
              }`}
            >
              🦺 Panchayat Volunteer Mode
            </button>
          </div>

          <ProvenanceBadge
            classification="observed"
            freshness="Realtime Sync"
            size="sm"
          />
        </div>
      </div>

      {/* Main 4 Feature Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('shelters')}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
            activeTab === 'shelters'
              ? 'bg-[#152945] border-[#3198dc] text-white shadow-lg shadow-cyan-950/40'
              : 'bg-[#10192a] border-[#1d273a] text-[#89929b] hover:border-[#2a3952] hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5 text-[#3198dc]" />
          <span className="text-xs font-bold leading-tight">Safe Shelters & Routes</span>
          <span className="text-[10px] text-[#6bd8cb] font-mono">DAG-Verified</span>
        </button>

        <button
          onClick={() => setActiveTab('reporter')}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
            activeTab === 'reporter'
              ? 'bg-[#152945] border-[#3198dc] text-white shadow-lg shadow-cyan-950/40'
              : 'bg-[#10192a] border-[#1d273a] text-[#89929b] hover:border-[#2a3952] hover:text-white'
          }`}
        >
          <Camera className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold leading-tight">Eye on the Storm</span>
          <span className="text-[10px] text-amber-300 font-mono">Multimodal AI</span>
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
            activeTab === 'voice'
              ? 'bg-[#152945] border-[#3198dc] text-white shadow-lg shadow-cyan-950/40'
              : 'bg-[#10192a] border-[#1d273a] text-[#89929b] hover:border-[#2a3952] hover:text-white'
          }`}
        >
          <Mic className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold leading-tight">Suno / Bolo Voice</span>
          <span className="text-[10px] text-emerald-300 font-mono">6 Languages</span>
        </button>

        <button
          onClick={() => setActiveTab('offline_sms')}
          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
            activeTab === 'offline_sms'
              ? 'bg-[#152945] border-[#3198dc] text-white shadow-lg shadow-cyan-950/40'
              : 'bg-[#10192a] border-[#1d273a] text-[#89929b] hover:border-[#2a3952] hover:text-white'
          }`}
        >
          <Radio className="w-5 h-5 text-rose-400" />
          <span className="text-xs font-bold leading-tight">2G / Offline SOS</span>
          <span className="text-[10px] text-rose-300 font-mono">0 KB Text / SMS</span>
        </button>
      </div>

      {/* TAB 1: Safe Shelters & Google Maps Navigation */}
      {activeTab === 'shelters' && (
        <div className="space-y-4">
          <div className="bg-[#10192a] border border-[#1e2d42] p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3198dc]" />
                Nearest Resilient Cyclone Shelters
              </h2>
              <p className="text-xs text-[#89929b] mt-0.5">
                Every shelter is dynamically cross-checked against our Directed Acyclic Graph (power, water, and flood passability).
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#6bd8cb] bg-[#0d2238] px-2.5 py-1 rounded-lg border border-[#1b3a5a]">
              4 Located
            </span>
          </div>

          <div className="grid gap-3">
            {shelters.map((s) => {
              const isSafe = s.status === 'SAFE_AND_ACCEPTING';
              const isNearCap = s.status === 'NEAR_CAPACITY';
              const isDanger = s.status === 'COMPROMISED_AVOID';

              return (
                <div
                  key={s.id}
                  className={`border rounded-2xl p-4 transition-all ${
                    isSafe
                      ? 'bg-[#0e2136] border-emerald-500/40 shadow-md shadow-emerald-950/30'
                      : isNearCap
                      ? 'bg-[#142033] border-amber-500/40'
                      : 'bg-[#1c141d] border-red-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{s.name}</span>
                        {isSafe && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            VERIFIED SAFE
                          </span>
                        )}
                        {isNearCap && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            97% FULL
                          </span>
                        )}
                        {isDanger && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                            AVOID • SUBMERGED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#9bb3cf] flex items-center gap-3 mt-1 font-mono">
                        <span>{s.villageWard}</span>
                        <span>•</span>
                        <span className="font-bold text-white">{s.distanceKm} km away</span>
                      </div>
                    </div>

                    {/* Google Maps External Safe Navigation Button */}
                    <a
                      href={s.googleMapsDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 ${
                        isSafe
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : isNearCap
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-red-800 text-white cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Google Maps Route</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Lifeline Badges */}
                  <div className="mt-3 pt-3 border-t border-[#20314a] flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                      s.isGridPowered ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Zap className="w-3 h-3" />
                      {s.isGridPowered ? 'Grid Power Live' : 'Diesel Buffer Only'}
                    </span>

                    <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                      s.hasCleanWaterRO ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      💧 Drinking Water Tank
                    </span>

                    <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                      s.hasMedicalPost ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      🩺 First Aid Post
                    </span>

                    <span className="ml-auto text-[11px] text-[#89929b]">
                      Capacity: {s.currentOccupancy} / {s.capacityHeadcount}
                    </span>
                  </div>

                  {/* Actionable Community Note */}
                  <div className="mt-2 text-xs text-[#a3c3e5] bg-[#0c1626]/70 p-2 rounded-lg border border-[#1b2b40]">
                    <span className="font-semibold text-[#6bd8cb]">Guidance: </span>
                    {s.recommendedRouteNote}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Multimodal "Eye on the Storm" Hazard Reporter */}
      {activeTab === 'reporter' && (
        <div className="space-y-4">
          <div className="bg-[#10192a] border border-[#1e2d42] p-4 rounded-2xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              Community Crowd Hazard Reporting ("Eye on the Storm")
            </h2>
            <p className="text-xs text-[#89929b] mt-1">
              Upload photos of flooded roads, fallen electric lines, or damaged bridges. Google Gemini verifies the image and updates the Incident Command mesh instantly.
            </p>
          </div>

          <form onSubmit={handleSubmitHazard} className="bg-[#10192a] border border-[#1e2d42] p-5 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#89929b] uppercase mb-1">
                Hazard Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { cat: 'ROAD_BREACH', label: '🌊 Road/Culvert Flood' },
                  { cat: 'POWER_LINE_DOWN', label: '⚡ Downed Power Line' },
                  { cat: 'TREE_FALL', label: '🌳 Fallen Tree Blockage' },
                  { cat: 'EMBANKMENT_CRACK', label: '🧱 Embankment Breach' },
                  { cat: 'MEDICAL_EMERGENCY', label: '🚑 Medical SOS' },
                ].map((item) => (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => setSelectedCategory(item.cat as HazardCategory)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                      selectedCategory === item.cat
                        ? 'bg-[#3198dc] border-[#3198dc] text-white shadow-md'
                        : 'bg-[#171f33] border-[#222f47] text-[#89929b] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#89929b] uppercase mb-1">
                  Village / Landmark Location
                </label>
                <input
                  type="text"
                  value={reportVillage}
                  onChange={(e) => setReportVillage(e.target.value)}
                  placeholder="e.g. Dhamra Coastal Ward 3 near Primary School"
                  className="w-full bg-[#171f33] border border-[#222f47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3198dc]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#89929b] uppercase mb-1">
                  Field Photo / Image Evidence
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReportDescription('Simulated photo: 11kV distribution conductor severed, fallen across road with standing floodwater.');
                      setSelectedCategory('POWER_LINE_DOWN');
                    }}
                    className="flex-1 bg-[#171f33] hover:bg-[#222f47] border border-[#222f47] rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono text-center cursor-pointer"
                  >
                    📸 Attach Field Photo
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#89929b] uppercase mb-1">
                Description & Ground-Truth Details
              </label>
              <textarea
                rows={3}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe current water level, whether vehicles can pass, or if lives are in danger..."
                className="w-full bg-[#171f33] border border-[#222f47] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#3198dc]"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-[#89929b] font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Gemini 2.5 Flash Automated Triage
              </span>

              <button
                type="submit"
                disabled={isSubmittingReport}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#006398] to-[#3198dc] hover:from-[#1b7dbf] hover:to-[#4bb2f5] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmittingReport ? (
                  <span>Verifying via Gemini...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to EOC Command Mesh</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Recently Verified Report Card */}
          {recentSubmittedReport && (
            <div className="bg-[#0c241b] border border-emerald-500/50 p-4 rounded-2xl animate-fade-in space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  VERIFIED BY GEMINI 2.5 FLASH ({recentSubmittedReport.reportId})
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                  SEVERITY: {recentSubmittedReport.severity}/5
                </span>
              </div>
              <p className="text-xs text-white font-semibold">
                {recentSubmittedReport.geminiAnalysis?.identifiedHazard}
              </p>
              <div className="text-xs text-emerald-100/90 bg-[#081a13] p-2.5 rounded-xl border border-emerald-500/20 font-mono">
                💡 <span className="font-bold">EOC Recommendation:</span> {recentSubmittedReport.geminiAnalysis?.actionableAdvice}
              </div>
              <p className="text-[11px] text-emerald-300/70 font-mono">
                Cascade Impact: {recentSubmittedReport.geminiAnalysis?.cascadeImpactNote}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: "Suno / Bolo" Vernacular Voice AI */}
      {activeTab === 'voice' && (
        <div className="space-y-4">
          <div className="bg-[#10192a] border border-[#1e2d42] p-5 rounded-2xl text-center space-y-3">
            <h2 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <Mic className="w-5 h-5 text-emerald-400" />
              Suno / Bolo • ସୁଣ / କୁହ • Multilingual Voice Lifeline
            </h2>
            <p className="text-xs text-[#89929b] max-w-lg mx-auto">
              Empathetic, clear voice answers for coastal communities in their native tongue. No complex jargon—just clear advice on where to walk, eat, and stay safe.
            </p>

            {/* Big Friendly Microphone Button */}
            <div className="py-4 flex flex-col items-center justify-center">
              <button
                onClick={() => handleSpeak('nearest_shelter')}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                  isSpeaking
                    ? 'bg-emerald-500 text-slate-950 scale-110 shadow-emerald-500/50 animate-pulse'
                    : 'bg-gradient-to-tr from-[#006398] to-[#3198dc] text-white hover:scale-105 shadow-cyan-500/30'
                }`}
                title="Tap to Listen to Live Voice Guidance"
              >
                {isSpeaking ? (
                  <Volume2 className="w-9 h-9" />
                ) : (
                  <Mic className="w-9 h-9" />
                )}
              </button>
              <span className="text-xs font-mono text-[#6bd8cb] mt-3">
                {isSpeaking ? 'SPEAKING VERNACULAR AUDIO...' : 'TAP MICROPHONE TO LISTEN'}
              </span>
            </div>

            {/* Live Subtitle Transcript */}
            <div className="bg-[#0b1424] border border-[#1c2c45] p-4 rounded-xl text-left">
              <span className="text-[10px] font-mono text-[#89929b] uppercase block mb-1">
                Spoken Voice Output Subtitles:
              </span>
              <p className="text-sm font-semibold text-white leading-relaxed">
                "{voiceSpokenText}"
              </p>
            </div>

            {/* Quick Community Audio Prompts */}
            <div className="pt-2">
              <span className="text-xs text-[#89929b] block mb-2 font-mono">
                Tap to hear immediate advice:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleSpeak('nearest_shelter')}
                  className="px-3 py-1.5 rounded-xl bg-[#171f33] hover:bg-[#202c47] border border-[#23314f] text-xs text-white cursor-pointer"
                >
                  🏠 Where is our safest shelter?
                </button>
                <button
                  onClick={() => handleSpeak('road_status')}
                  className="px-3 py-1.5 rounded-xl bg-[#171f33] hover:bg-[#202c47] border border-[#23314f] text-xs text-white cursor-pointer"
                >
                  🌊 Is Dhamra road flooded?
                </button>
                <button
                  onClick={() => handleSpeak('hospital_power')}
                  className="px-3 py-1.5 rounded-xl bg-[#171f33] hover:bg-[#202c47] border border-[#23314f] text-xs text-white cursor-pointer"
                >
                  ⚡ Is Bhadrak hospital running on power?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 2G / Offline Zero-Data SMS Distress Beacon */}
      {activeTab === 'offline_sms' && (
        <div className="space-y-4">
          <div className="bg-[#10192a] border border-[#1e2d42] p-4 rounded-2xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400" />
              Low-Bandwidth 2G / Offline Distress Beacon
            </h2>
            <p className="text-xs text-[#89929b] mt-1">
              When internet and 4G cell towers fail, this generates a calibrated, compact 160-character statutory SMS code that can be transmitted over plain 2G cellular network to District Control (1077).
            </p>
          </div>

          <div className="bg-[#10192a] border border-[#1e2d42] p-5 rounded-2xl space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#89929b] uppercase mb-1">
                  Family / Group Headcount
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={smsHeadcount}
                  onChange={(e) => setSmsHeadcount(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#171f33] border border-[#222f47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#89929b] uppercase mb-1">
                  Urgent Priority Need
                </label>
                <input
                  type="text"
                  value={smsUrgentNeed}
                  onChange={(e) => setSmsUrgentNeed(e.target.value)}
                  placeholder="e.g. Boat Rescue, Baby Milk, Insulin"
                  className="w-full bg-[#171f33] border border-[#222f47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="vuln"
                checked={hasVulnerableMember}
                onChange={(e) => setHasVulnerableMember(e.target.checked)}
                className="w-4 h-4 rounded text-[#3198dc] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="vuln" className="text-xs text-white cursor-pointer">
                Includes pregnant mother, elderly citizen, or infant (High Rescue Priority)
              </label>
            </div>

            {/* Generated Raw SMS Box */}
            <div className="bg-[#09111c] border border-rose-500/30 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-rose-400 font-bold uppercase">
                  Standard Statutory SMS Output (160 Chars)
                </span>
                <span className="text-[#89929b]">{generatedSms.estimatedBytes} Bytes • 0 KB Data</span>
              </div>
              <div className="p-3 bg-[#131b2e] rounded-lg font-mono text-xs text-emerald-300 break-all select-all">
                {generatedSms.encodedText}
              </div>
            </div>

            {/* Direct Dispatch Triggers */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <a
                href={generatedSms.smsDeepLink}
                className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Radio className="w-4 h-4" />
                <span>Transmit SMS to Helpline 1077</span>
              </a>

              <a
                href={generatedSms.whatsappDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Broadcast via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
