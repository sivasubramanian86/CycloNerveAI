import React from 'react';
import { AppTheme } from './SettingsModal.tsx';

interface FooterProps {
  degradedModeActive: boolean;
  onToggleDegradedMode: () => void;
  earthEngineStatus?: number;
  currentTheme?: AppTheme;
}

export const Footer: React.FC<FooterProps> = ({
  degradedModeActive,
  onToggleDegradedMode,
  earthEngineStatus = 99.98,
  currentTheme = 'dark',
}) => {
  const isDark = currentTheme === 'dark';

  return (
    <footer className={`fixed bottom-0 left-0 md:left-64 right-0 h-7 backdrop-blur-md z-30 px-4 flex items-center justify-between text-[11px] font-mono transition-colors ${
      isDark
        ? 'bg-[#060e20]/95 shadow-[0_-1px_6px_rgba(0,0,0,0.35)] border-t border-[#171f33] text-[#bfc7d2]'
        : 'bg-white/95 shadow-sm border-t border-slate-200 text-slate-600'
    }`}>
      <div className="flex items-center gap-3 overflow-hidden truncate">
        {/* Degraded Mode Toggle & Pill */}
        <button
          onClick={onToggleDegradedMode}
          className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer hover:underline ${
            degradedModeActive
              ? isDark ? 'text-[#ffb77d]' : 'text-amber-700'
              : isDark ? 'text-[#6bd8cb]' : 'text-emerald-700'
          }`}
          title="Click to toggle sandbox degraded mode drill"
        >
          <span className="material-symbols-outlined text-[13px]">
            {degradedModeActive ? 'warning' : 'check_circle'}
          </span>
          <span>Degraded Mode: {degradedModeActive ? 'ON (SATCOM FALLBACK)' : 'OFF (HIGH SPEED)'}</span>
        </button>

        <span className="opacity-40">|</span>
        <span>
          Earth Engine: <strong className={isDark ? 'text-[#dae2fd]' : 'text-slate-900'}>{earthEngineStatus}%</strong>
        </span>
        <span className="opacity-40">|</span>
        <span>
          BigQuery: <strong className={isDark ? 'text-[#6bd8cb]' : 'text-emerald-700'}>Active</strong>
        </span>
        <span className="opacity-40 hidden sm:inline">|</span>
        <span className="hidden sm:inline">
          Cascade Inference Engine: <strong className={isDark ? 'text-[#6bd8cb]' : 'text-emerald-700'}>Nominal (0 Drift)</strong>
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`px-1.5 py-0.5 rounded font-bold tracking-wider uppercase text-[10px] border ${
            isDark
              ? 'bg-[#d97707]/30 text-[#ffdcc3] border-[#d97707]/40'
              : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}
          title="Sandbox security policy: all consequential dispatch commands are sandboxed unless dual 2FA verified"
        >
          Dispatch: SIMULATED ONLY
        </span>
      </div>
    </footer>
  );
};
