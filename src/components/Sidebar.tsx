import React from 'react';
import { AppTheme } from './SettingsModal.tsx';

export type NavRoute =
  | 'situation-overview'
  | 'cyclone-intelligence'
  | 'infrastructure-mesh'
  | 'cascade-simulation'
  | 'intervention-planner'
  | 'advisories-and-approval'
  | 'evidence-and-audit'
  | 'system-health'
  | 'mobile-field'
  | 'help-and-sops';

interface SidebarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  degradedModeActive: boolean;
  satcomPingMs: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  currentTheme?: AppTheme;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  degradedModeActive,
  satcomPingMs,
  isOpenMobile = false,
  onCloseMobile,
  currentTheme = 'dark',
}) => {
  const isDark = currentTheme === 'dark';

  const navItems: Array<{ route: NavRoute; label: string; icon: string; badge?: string; badgeColor?: string }> = [
    { route: 'situation-overview', label: 'Situation Overview', icon: 'radar' },
    { route: 'cyclone-intelligence', label: 'Cyclone Intelligence', icon: 'cyclone', badge: 'v4.8' },
    { route: 'infrastructure-mesh', label: 'Infrastructure Mesh', icon: 'hub', badge: '78 Nodes' },
    { route: 'cascade-simulation', label: 'Cascade Simulation', icon: 'account_tree', badge: 'Level 4', badgeColor: 'bg-red-500/20 text-red-300' },
    { route: 'intervention-planner', label: 'Intervention Planner', icon: 'flowsheet', badge: 'Pareto Opt' },
    { route: 'advisories-and-approval', label: 'Advisories & Approval', icon: 'verified_user', badge: '2FA Req', badgeColor: 'bg-amber-500/20 text-amber-300' },
    { route: 'evidence-and-audit', label: 'Evidence and Audit', icon: 'fact_check', badge: 'WORM' },
    { route: 'system-health', label: 'System Health', icon: 'monitor_heart', badge: degradedModeActive ? 'Degraded' : 'Nominal' },
    { route: 'mobile-field', label: 'Mobile Field View', icon: 'smartphone', badge: 'SOS Active' },
    { route: 'help-and-sops', label: 'Help & SOPs / FAQ', icon: 'menu_book' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 z-40 flex flex-col pt-24 pb-8 transition-transform duration-200 ${
          isDark
            ? 'bg-[#060e20] text-[#dae2fd] shadow-[1px_0_12px_rgba(0,0,0,0.5)] border-r border-[#171f33]'
            : 'bg-slate-50 text-slate-800 shadow-md border-r border-slate-200'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-4 py-2 mb-2 flex items-center justify-between">
          <span className={`text-[11px] uppercase tracking-wider font-semibold ${
            isDark ? 'text-[#89929b]' : 'text-slate-500'
          }`}>
            Tactical Command Routing
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
              isDark ? 'bg-[#171f33] text-[#6bd8cb]' : 'bg-slate-200 text-blue-700'
            }`}>
              EOC-HQ
            </span>
            {isOpenMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden text-[#89929b] hover:text-white p-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => {
                  onRouteChange(item.route);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-[#3198dc] text-[#002c47] font-bold shadow-md shadow-cyan-600/20'
                      : 'bg-blue-600 text-white font-bold shadow-sm'
                    : isDark
                    ? 'text-[#bfc7d2] hover:bg-[#222a3d] hover:text-[#dae2fd]'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`material-symbols-outlined text-[19px] ${
                      isActive
                        ? isDark
                          ? 'text-[#002c47]'
                          : 'text-white'
                        : isDark
                        ? 'text-[#89929b]'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[13px] font-['Inter'] truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-semibold shrink-0 ${
                      isActive
                        ? isDark
                          ? 'bg-[#002c47] text-[#93ccff]'
                          : 'bg-blue-800 text-white'
                        : item.badgeColor || (isDark ? 'bg-[#171f33] text-[#89929b]' : 'bg-slate-200 text-slate-700')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Satellite Up-Link Telemetry Footer */}
        <div className={`px-4 pt-3 border-t transition-colors ${
          isDark ? 'border-[#171f33] bg-[#060e20] text-[#bfc7d2]' : 'border-slate-200 bg-slate-100 text-slate-700'
        }`}>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  degradedModeActive ? 'bg-[#d97707] animate-pulse' : 'bg-[#6bd8cb]'
                }`}
              ></span>
              {degradedModeActive ? 'GSAT-7A SATCOM' : 'UP-LINK OK'}
            </span>
            <span className={isDark ? 'text-[#89929b]' : 'text-slate-500'}>{satcomPingMs}ms RTT</span>
          </div>
        </div>
      </aside>
    </>
  );
};
