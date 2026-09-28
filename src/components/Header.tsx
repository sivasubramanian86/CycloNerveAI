import React from 'react';
import { UserRole } from '../shared/types/index.ts';
import { AppTheme } from './SettingsModal.tsx';
import { GLOBAL_CYCLONE_REGIONS } from '../data/globalCycloneRegions.ts';
import { Sun, Moon, Settings, Globe, Clock, ShieldCheck, Compass } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentTheme: AppTheme;
  onToggleTheme: () => void;
  selectedRegionId: string;
  onRegionChange: (regionId: string) => void;
  onOpenSettings: () => void;
  onOpen2FAModal: () => void;
  degradedModeActive: boolean;
  onToggleMobileMenu?: () => void;
  onOpenWalkthrough?: () => void;
  onOpenPitchDesk?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  currentTheme,
  onToggleTheme,
  selectedRegionId,
  onRegionChange,
  onOpenSettings,
  onOpen2FAModal,
  degradedModeActive,
  onToggleMobileMenu,
  onOpenWalkthrough,
  onOpenPitchDesk,
}) => {
  const currentRegion =
    GLOBAL_CYCLONE_REGIONS.find((r) => r.id === selectedRegionId) || GLOBAL_CYCLONE_REGIONS[0];

  const isDark = currentTheme === 'dark';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-md transition-colors ${
      isDark
        ? 'bg-[#060e20]/95 border-b border-[#222a3d] text-[#dae2fd]'
        : 'bg-white/95 border-b border-slate-200 text-slate-900 shadow-slate-200/50'
    }`}>
      {/* Top Emergency Status Ribbon */}
      <div
        className={`w-full px-4 py-1 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider transition-colors ${
          degradedModeActive
            ? 'bg-[#d97707] text-[#060e20] font-bold'
            : isDark
            ? 'bg-[#93000a] text-[#ffdad6]'
            : 'bg-red-700 text-white'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="material-symbols-outlined text-[15px] animate-pulse">
            {degradedModeActive ? 'wifi_off' : 'warning'}
          </span>
          <span className="font-bold">
            {degradedModeActive ? 'DEGRADED AIR-GAP MODE' : 'EMERGENCY MODE ACTIVE'}
          </span>
          <span className="opacity-40">|</span>
          <span className="hidden sm:inline truncate">
            {degradedModeActive
              ? 'Terrestrial Backhaul Severed • Operating on GSAT-7A Satellite Cache'
              : 'Statutory Actions Require Dual-Officer 2FA Authorization Quorum'}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] shrink-0">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            DEFCON 2
          </span>
          <span className="opacity-40 hidden md:inline">|</span>
          <span className="hidden md:inline opacity-80">FIPS 140-3 L3</span>
        </div>
      </div>

      {/* Main Header Content Bar */}
      <div className="h-14 w-full px-4 flex items-center justify-between gap-3">
        
        {/* Left: Brand Emblem & Active Cyclone Alert Chip */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Hamburger Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className={`md:hidden p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-[#89929b] hover:text-white hover:bg-[#131b2e]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#006398] to-[#93ccff] flex items-center justify-center p-1.5 shadow-md shadow-cyan-500/20">
              <span className="material-symbols-outlined text-[#001d31] text-[20px] font-bold">
                cyclone
              </span>
            </div>
            <div className="flex flex-col">
              <span className={`font-['Public_Sans'] text-[17px] font-bold tracking-tight leading-none ${
                isDark ? 'text-[#93ccff]' : 'text-blue-600'
              }`}>
                CycloNerveAI
              </span>
              <span className={`text-[10px] uppercase tracking-widest mt-0.5 font-['Inter'] font-semibold ${
                isDark ? 'text-[#bfc7d2]' : 'text-slate-500'
              }`}>
                Global Cascade Intelligence
              </span>
            </div>
          </div>

          {/* Active Storm Alert Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600/90 text-white text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[13px]">cyclone</span>
            <span>{currentRegion.activeCyclone.name} ({currentRegion.activeCyclone.category})</span>
          </div>
        </div>

        {/* Center: Global Cyclone Location & Landfall Countdown Selector */}
        <div className="flex items-center gap-2 max-w-md">
          {/* Global Basin / Region Selector */}
          <div className="relative">
            <select
              value={selectedRegionId}
              onChange={(e) => onRegionChange(e.target.value)}
              className={`text-xs font-mono font-medium py-1.5 pl-7 pr-4 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3198dc] transition-colors truncate max-w-[200px] sm:max-w-[260px] ${
                isDark
                  ? 'bg-[#131b2e] border-[#222a3d] text-[#dae2fd] hover:border-[#3198dc]'
                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-blue-500'
              }`}
              title="Switch Global Cyclone Basin & Region"
            >
              {GLOBAL_CYCLONE_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.flagEmoji} {r.regionName}
                </option>
              ))}
            </select>
            <span className="absolute left-2 top-2 pointer-events-none text-xs">
              <Globe className="w-3.5 h-3.5 text-[#3198dc]" />
            </span>
          </div>

          {/* Landfall ETA */}
          <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[11px] border shrink-0 ${
            isDark
              ? 'bg-[#222a3d] text-[#dae2fd] border-[#3f4850]/50'
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d97707] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffb77d]"></span>
            </span>
            <span className={isDark ? 'text-[#ffb77d] font-semibold' : 'text-amber-700 font-semibold'}>
              T-{currentRegion.activeCyclone.hoursToLandfall}h to Landfall
            </span>
          </div>
        </div>

        {/* Right: Actions, Theme Mode, Settings & Commander Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
          
          {/* 60s Tour Button */}
          {onOpenWalkthrough && (
            <button
              onClick={onOpenWalkthrough}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#171f33] hover:bg-[#222a3d] text-[#6bd8cb] border border-[#29a195]/40'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}
              title="Launch 60-Second Operational Tour"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>60s Tour</span>
            </button>
          )}

          {/* Evaluator Pitch Desk Button */}
          {onOpenPitchDesk && (
            <button
              onClick={onOpenPitchDesk}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded bg-[#3198dc] hover:bg-[#2080c0] text-[#002c47] font-semibold text-xs font-mono transition-colors cursor-pointer shadow-sm"
              title="Open Evaluator 70/20/10 Pitch Desk"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pitch Desk</span>
            </button>
          )}

          {/* Theme Toggle Button (Light/Dark mode) */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#131b2e] border-[#222a3d] text-amber-400 hover:bg-[#171f33]'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode (Default)'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Button (Language & Preferences) */}
          <button
            onClick={onOpenSettings}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#131b2e] border-[#222a3d] text-[#93ccff] hover:bg-[#171f33]'
                : 'bg-slate-100 border-slate-300 text-blue-600 hover:bg-slate-200'
            }`}
            title="Open Settings (Language, Basin & Preferences)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Role Switcher & 2FA Quorum */}
          <div className={`flex items-center gap-1.5 pl-1.5 border-l ${
            isDark ? 'border-[#222a3d]' : 'border-slate-300'
          }`}>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className={`font-mono text-[11px] py-1 px-1.5 rounded border focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-[#131b2e] text-[#93ccff] border-[#222a3d] focus:border-[#93ccff]'
                  : 'bg-slate-100 text-slate-800 border-slate-300 focus:border-blue-500'
              }`}
              title="Change active incident command role"
            >
              <option value="Viewer">Viewer</option>
              <option value="Analyst">Analyst</option>
              <option value="Field Officer">Field Officer</option>
              <option value="Incident Commander">Incident Commander</option>
              <option value="Administrator">Administrator</option>
            </select>

            {/* Tactile 2FA Trigger Button */}
            <button
              onClick={onOpen2FAModal}
              className="w-7 h-7 rounded-full bg-[#3198dc] hover:bg-[#93ccff] text-[#001d31] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Open Dual-Officer 2FA Signing Station"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
