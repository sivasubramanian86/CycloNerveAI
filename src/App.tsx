/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CycloNerveAI - Global Cyclone Cascade Intelligence & Anticipatory Action Platform
 * Designed for Google Cloud Run
 * 
 * "Predict the cascade. Protect the lifeline. Act before landfall."
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar, NavRoute } from './components/Sidebar.tsx';
import { Footer } from './components/Footer.tsx';
import { DualAuthModal } from './components/DualAuthModal.tsx';
import { DegradedModeBanner } from './components/StateIndicators.tsx';
import { UserRole } from './shared/types/index.ts';
import { DomainProvider } from './domain/index.ts';

// Feature Views
import { SituationOverview } from './features/situation/SituationOverview.tsx';
import { CycloneIntelligence } from './features/cyclone/CycloneIntelligence.tsx';
import { InfrastructureMesh } from './features/infrastructure/InfrastructureMesh.tsx';
import { CascadeSimulation } from './features/cascade/CascadeSimulation.tsx';
import { InterventionPlanner } from './features/intervention/InterventionPlanner.tsx';
import { AdvisoriesApproval } from './features/advisories/AdvisoriesApproval.tsx';
import { EvidenceAndAudit } from './features/audit/EvidenceAndAudit.tsx';
import { SystemHealth } from './features/health/SystemHealth.tsx';
import { MobileFieldView } from './features/field/MobileFieldView.tsx';
import { HelpAndSOPs } from './features/help/HelpAndSOPs.tsx';

// Settings & Global Modals
import { SettingsModal, AppTheme, AppLanguage } from './components/SettingsModal.tsx';
import { InteractiveProductWalkthrough } from './components/InteractiveProductWalkthrough.tsx';
import { JudgeDemoPitchDrawer } from './components/JudgeDemoPitchDrawer.tsx';
import { GLOBAL_CYCLONE_REGIONS } from './data/globalCycloneRegions.ts';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('situation-overview');
  const [currentRole, setCurrentRole] = useState<UserRole>('Incident Commander');
  const [degradedModeActive, setDegradedModeActive] = useState<boolean>(false);
  const [stagedPlanId, setStagedPlanId] = useState<string>('PLAN-ALPHA-01');
  const [dispatchedAdvisories, setDispatchedAdvisories] = useState<string[]>([]);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [cascadeTargetAssetId, setCascadeTargetAssetId] = useState<string>('SUB-OD-DH01');
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Settings & Theme (Dark Mode Default on Launch)
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('cyclonerve_theme') as AppTheme) || 'dark';
  });
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>('en');
  const [selectedRegionId, setSelectedRegionId] = useState<string>(() => {
    return localStorage.getItem('cyclonerve_region') || 'odisha-dhamra';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Tour & Pitch Desks
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);
  const [isPitchDeskOpen, setIsPitchDeskOpen] = useState<boolean>(false);

  // Synchronize HTML element dark class with state
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('cyclonerve_theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleRegionChange = (newRegionId: string) => {
    setSelectedRegionId(newRegionId);
    localStorage.setItem('cyclonerve_region', newRegionId);
    const region = GLOBAL_CYCLONE_REGIONS.find((r) => r.id === newRegionId);
    if (region) {
      showToast(`Global Theater updated to: ${region.regionName} (${region.activeCyclone.name})`);
    }
  };

  const showToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  const handle2FAAuthorizationSuccess = (officerKeyId: string) => {
    if (currentRoute === 'advisories-and-approval') {
      setDispatchedAdvisories((prev) => [...prev, 'ADV-2025-089-REV2']);
      showToast(
        `Dual-Key Broadcast Authorized by ${officerKeyId}. Dispatched to Cell Broadcast & Sirens.`
      );
    } else {
      showToast(`Dual-Key FIDO2 Signed by ${officerKeyId}. Statutory action certified.`);
    }
  };

  const handleInspectAssetInCascade = (assetId: string) => {
    setCascadeTargetAssetId(assetId);
    setCurrentRoute('cascade-simulation');
  };

  const handleStagePlan = (planId: string) => {
    setStagedPlanId(planId);
    showToast(`Anticipatory Action Staging Plan "${planId}" committed to EOC operational log.`);
  };

  const isDark = currentTheme === 'dark';

  return (
    <DomainProvider>
      <div className={`min-h-screen flex flex-col font-['Inter'] transition-colors ${
        isDark
          ? 'bg-[#060e20] text-[#dae2fd] selection:bg-[#3198dc] selection:text-white'
          : 'bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white'
      }`}>
        
        {/* Global Mission Control Header */}
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          currentTheme={currentTheme}
          onToggleTheme={toggleTheme}
          selectedRegionId={selectedRegionId}
          onRegionChange={handleRegionChange}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpen2FAModal={() => setIs2FAModalOpen(true)}
          degradedModeActive={degradedModeActive}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
          onOpenPitchDesk={() => setIsPitchDeskOpen(true)}
        />

        {/* Degraded Air-Gap Alert Banner (When terrestrial lines severed) */}
        {degradedModeActive && (
          <div className="pt-20 px-4">
            <DegradedModeBanner
              onOpenHealth={() => setCurrentRoute('system-health')}
            />
          </div>
        )}

        {/* Main Operational Container */}
        <div className={`flex-1 flex overflow-hidden ${degradedModeActive ? 'pt-2' : 'pt-20'} pb-7`}>
          
          {/* Tactical Sidebar Navigation */}
          <Sidebar
            currentRoute={currentRoute}
            onRouteChange={(route) => {
              setCurrentRoute(route);
              setIsMobileMenuOpen(false);
            }}
            degradedModeActive={degradedModeActive}
            satcomPingMs={degradedModeActive ? 420 : 18}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            currentTheme={currentTheme}
          />

          {/* Primary Mission Viewport */}
          <main
            role="main"
            aria-label="EOC Mission Viewport"
            className={`flex-1 md:ml-64 overflow-y-auto p-4 lg:p-6 transition-colors ${
              isDark ? 'bg-[#0b1326]' : 'bg-slate-50'
            }`}
          >
            {currentRoute === 'situation-overview' && (
              <SituationOverview
                onNavigate={(route) => setCurrentRoute(route)}
                degradedModeActive={degradedModeActive}
                onOpen2FAModal={() => setIs2FAModalOpen(true)}
                selectedRegionId={selectedRegionId}
                currentTheme={currentTheme}
              />
            )}

            {currentRoute === 'cyclone-intelligence' && (
              <CycloneIntelligence />
            )}

            {currentRoute === 'infrastructure-mesh' && (
              <InfrastructureMesh
                onSelectForCascade={handleInspectAssetInCascade}
              />
            )}

            {currentRoute === 'cascade-simulation' && (
              <CascadeSimulation
                initialRootAssetId={cascadeTargetAssetId}
                onNavigateToIntervention={() => setCurrentRoute('intervention-planner')}
              />
            )}

            {currentRoute === 'intervention-planner' && (
              <InterventionPlanner
                stagedPlanId={stagedPlanId}
                onSetStagedPlanId={handleStagePlan}
                onOpen2FAModal={() => setIs2FAModalOpen(true)}
              />
            )}

            {currentRoute === 'advisories-and-approval' && (
              <AdvisoriesApproval
                dispatchedAdvisories={dispatchedAdvisories}
                onOpen2FAModal={() => setIs2FAModalOpen(true)}
              />
            )}

            {currentRoute === 'evidence-and-audit' && (
              <EvidenceAndAudit />
            )}

            {currentRoute === 'system-health' && (
              <SystemHealth
                degradedModeActive={degradedModeActive}
                onToggleDegradedMode={() => setDegradedModeActive(!degradedModeActive)}
              />
            )}

            {currentRoute === 'mobile-field' && (
              <MobileFieldView />
            )}

            {currentRoute === 'help-and-sops' && (
              <HelpAndSOPs />
            )}
          </main>
        </div>

        {/* Statutory EOC Footer */}
        <Footer
          degradedModeActive={degradedModeActive}
          onToggleDegradedMode={() => setDegradedModeActive(!degradedModeActive)}
          currentTheme={currentTheme}
        />

        {/* Dual-Officer 2FA Signing Modal */}
        <DualAuthModal
          isOpen={is2FAModalOpen}
          onClose={() => setIs2FAModalOpen(false)}
          onSuccess={handle2FAAuthorizationSuccess}
          userRole={currentRole}
          advisoryCode="ADV-2025-089-REV2"
          targetFootprint={184200}
        />

        {/* Mission Control Settings Modal (Language, Theme, Basin Selection) */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          currentLanguage={currentLanguage}
          onLanguageChange={(lang) => {
            setCurrentLanguage(lang);
            showToast(`Operational Language updated to: ${lang.toUpperCase()}`);
          }}
          selectedRegionId={selectedRegionId}
          onRegionChange={handleRegionChange}
        />

        {/* 1-Click Interactive Operational Walkthrough */}
        <InteractiveProductWalkthrough
          isOpen={isWalkthroughOpen}
          onClose={() => setIsWalkthroughOpen(false)}
          onNavigate={(route) => setCurrentRoute(route)}
        />

        {/* Evaluator & Judge Pitch Desk (70/20/10 Rule) */}
        <JudgeDemoPitchDrawer
          isOpen={isPitchDeskOpen}
          onClose={() => setIsPitchDeskOpen(false)}
          onNavigate={(route) => setCurrentRoute(route)}
          onTriggerGuidedTour={() => {
            setIsPitchDeskOpen(false);
            setIsWalkthroughOpen(true);
          }}
        />

        {/* Toast Notification HUD */}
        {toastNotification && (
          <div className={`fixed bottom-10 right-6 z-50 px-4 py-3 rounded-lg border shadow-2xl flex items-center gap-3 animate-bounce transition-colors ${
            isDark
              ? 'bg-[#131b2e] text-[#dae2fd] border-[#3198dc]'
              : 'bg-white text-slate-900 border-blue-500 shadow-slate-300'
          }`}>
            <span className="material-symbols-outlined text-[#6bd8cb] text-[20px]">
              verified
            </span>
            <span className="font-mono text-xs">{toastNotification}</span>
            <button
              onClick={() => setToastNotification(null)}
              className="ml-2 text-[#89929b] hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

      </div>
    </DomainProvider>
  );
}
