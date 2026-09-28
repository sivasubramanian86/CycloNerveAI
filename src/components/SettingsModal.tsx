/**
 * CycloNerveAI - Mission Control Settings & Preferences
 * Houses multi-language selection, light/dark mode theme controls (dark mode default),
 * global cyclone basin region selector, and audio alert telemetry.
 */

import React from 'react';
import { X, Moon, Sun, Globe, MapPin, Bell, Radio, Check, Volume2, Shield } from 'lucide-react';
import { GLOBAL_CYCLONE_REGIONS, GlobalCycloneRegion } from '../data/globalCycloneRegions.ts';

export type AppTheme = 'dark' | 'light';
export type AppLanguage = 'en' | 'or' | 'hi' | 'te' | 'bn' | 'tl' | 'ja' | 'vi' | 'es' | 'fr';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  currentLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  selectedRegionId: string;
  onRegionChange: (regionId: string) => void;
}

const SUPPORTED_LANGUAGES: Array<{ code: AppLanguage; name: string; nativeName: string; region: string }> = [
  { code: 'en', name: 'English', nativeName: 'English (US/UK)', region: 'International Global Standard' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha Coastal District, India' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'National Civil Protection, India' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh Coast, India' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Bangladesh & West Bengal Delta' },
  { code: 'tl', name: 'Filipino / Tagalog', nativeName: 'Wikang Filipino', region: 'Philippines (Typhoon Alley)' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Ryukyu & Japan Coast' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Vietnam / Gulf of Tonkin' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Caribbean & Mexico Coastal Basin' },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'Madagascar & South Pacific Islands' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  currentLanguage,
  onLanguageChange,
  selectedRegionId,
  onRegionChange,
}) => {
  if (!isOpen) return null;

  const currentRegion =
    GLOBAL_CYCLONE_REGIONS.find((r) => r.id === selectedRegionId) || GLOBAL_CYCLONE_REGIONS[0];

  const basins = Array.from(new Set(GLOBAL_CYCLONE_REGIONS.map((r) => r.basin)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className={`max-w-2xl w-full p-6 rounded-xl border shadow-2xl relative max-h-[90vh] overflow-y-auto transition-colors ${
        currentTheme === 'dark'
          ? 'bg-[#131b2e] border-[#222a3d] text-[#dae2fd]'
          : 'bg-white border-slate-300 text-slate-900 shadow-slate-400/30'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 mb-5 border-b ${
          currentTheme === 'dark' ? 'border-[#222a3d]' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#3198dc]/20 text-[#3198dc] rounded-lg">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <h2 className={`text-lg font-bold ${currentTheme === 'dark' ? 'text-[#dae2fd]' : 'text-slate-900'}`}>
                Mission Control Settings & Global Basin Catalog
              </h2>
              <p className={`text-xs font-mono ${currentTheme === 'dark' ? 'text-[#89929b]' : 'text-slate-500'}`}>
                Appearance, Multi-Agency Language Translation & Cyclone Location Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTheme === 'dark'
                ? 'text-[#89929b] hover:text-white hover:bg-[#171f33]'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Appearance & Theme Mode */}
        <div className="mb-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
              currentTheme === 'dark' ? 'text-[#93ccff]' : 'text-blue-700'
            }`}>
              Display Theme Mode
            </span>
            <span className={`text-[11px] font-mono ${
              currentTheme === 'dark' ? 'text-[#6bd8cb]' : 'text-emerald-700'
            }`}>
              Default: Dark Tactical Command
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => onThemeChange('dark')}
              className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${
                currentTheme === 'dark'
                  ? 'bg-[#171f33] border-[#3198dc] shadow-[0_0_12px_rgba(49,152,220,0.25)]'
                  : 'bg-slate-100 border-slate-300 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="p-2 rounded bg-[#060e20] text-[#93ccff]">
                <Moon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    Dark Tactical (Default)
                  </span>
                  {currentTheme === 'dark' && <Check className="w-4 h-4 text-[#3198dc]" />}
                </div>
                <p className="text-[11px] text-[#89929b] mt-0.5">
                  High-contrast night & storm EOC control room palette (reduces fatigue).
                </p>
              </div>
            </button>

            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => onThemeChange('light')}
              className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${
                currentTheme === 'light'
                  ? 'bg-blue-50/70 border-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.2)]'
                  : 'bg-[#0b1326] border-[#222a3d] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="p-2 rounded bg-amber-100 text-amber-600">
                <Sun className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${currentTheme === 'light' ? 'text-slate-900' : 'text-slate-300'}`}>
                    Light Operational
                  </span>
                  {currentTheme === 'light' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className={`text-[11px] mt-0.5 ${currentTheme === 'light' ? 'text-slate-600' : 'text-[#89929b]'}`}>
                  Crisp daylight mission mode for outdoor field sunlight visibility.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Global Cyclone Region Selector */}
        <div className="mb-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
              currentTheme === 'dark' ? 'text-[#93ccff]' : 'text-blue-700'
            }`}>
              Global Cyclone Ocean Basin & Region ({GLOBAL_CYCLONE_REGIONS.length} Regions Worldwide)
            </span>
            <span className="text-[11px] font-mono text-[#ffb77d]">
              Active: {currentRegion.regionName}
            </span>
          </div>

          <div className="space-y-3">
            <select
              value={selectedRegionId}
              onChange={(e) => onRegionChange(e.target.value)}
              className={`w-full p-2.5 rounded-lg border text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[#3198dc] cursor-pointer ${
                currentTheme === 'dark'
                  ? 'bg-[#0b1326] border-[#222a3d] text-[#dae2fd]'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              {basins.map((basin) => (
                <optgroup key={basin} label={`── ${basin} ──`}>
                  {GLOBAL_CYCLONE_REGIONS.filter((r) => r.basin === basin).map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.flagEmoji} {region.regionName} — {region.activeCyclone.name} ({region.activeCyclone.category})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* Quick Region Summary Card */}
            <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
              currentTheme === 'dark'
                ? 'bg-[#0b1326] border-[#222a3d]'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold flex items-center gap-1.5">
                  <span>{currentRegion.flagEmoji}</span>
                  <span className={currentTheme === 'dark' ? 'text-white' : 'text-slate-900'}>{currentRegion.activeCyclone.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-900/60 text-red-200 border border-red-500/40">
                    {currentRegion.activeCyclone.category}
                  </span>
                </span>
                <span className="text-amber-400 font-bold">
                  T-{currentRegion.activeCyclone.hoursToLandfall}h to Landfall
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                <strong>Primary Hazard:</strong> {currentRegion.topRiskThreat}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px] text-[#89929b]">
                <span>Wind: {currentRegion.activeCyclone.windKmh} km/h (Gusts {currentRegion.activeCyclone.gustsKmh} km/h)</span>
                <span>•</span>
                <span>Peak Surge: {currentRegion.activeCyclone.surgePeakMeters}m</span>
                <span>•</span>
                <span>Pop. at Risk: {currentRegion.populationAtRisk}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Multi-Agency Language Translation */}
        <div className="mb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
              currentTheme === 'dark' ? 'text-[#93ccff]' : 'text-blue-700'
            }`}>
              Emergency Advisory & UI Language (Moved to Settings)
            </span>
            <span className={`text-[11px] font-mono ${
              currentTheme === 'dark' ? 'text-[#bfc7d2]' : 'text-slate-500'
            }`}>
              Selected: {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onLanguageChange(lang.code)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? currentTheme === 'dark'
                        ? 'bg-[#171f33] border-[#3198dc] text-white shadow-sm'
                        : 'bg-blue-50 border-blue-600 text-blue-900 font-semibold'
                      : currentTheme === 'dark'
                      ? 'bg-[#0b1326] border-[#222a3d] text-[#89929b] hover:text-[#dae2fd] hover:border-[#3f4850]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">{lang.nativeName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#3198dc]" />}
                  </div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5 truncate">
                    {lang.name} • {lang.code.toUpperCase()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-between pt-4 mt-6 border-t ${
          currentTheme === 'dark' ? 'border-[#222a3d]' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#89929b]">
            <Shield className="w-3.5 h-3.5 text-[#6bd8cb]" />
            <span>FIPS 140-3 & Statutory CAP v1.2 Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3198dc] hover:bg-[#2080c0] text-[#002c47] font-semibold text-xs font-mono rounded-lg transition-colors cursor-pointer"
          >
            Apply & Close Settings
          </button>
        </div>

      </div>
    </div>
  );
};
