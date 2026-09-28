/**
 * CycloNerveAI - System Controls: Global Kill Switch & Degraded Mode Controller
 * Provides statutory runtime circuit breakers for Generative AI and degraded operations.
 */

import type { UserRole } from '../../shared/types/index.ts';
import { auditLogService } from './auditLogService.ts';
import { serverConfig } from '../config/serverConfig.ts';

export interface SystemControlsState {
  globalKillSwitchActive: boolean;
  degradedModeActive: boolean;
  lastToggledBy?: string;
  lastToggledAt?: string;
  toggleReason?: string;
}

class SystemControls {
  private killSwitchActive: boolean;
  private degradedModeActive: boolean;
  private lastToggledBy?: string;
  private lastToggledAt?: string;
  private toggleReason?: string;

  constructor() {
    this.killSwitchActive = serverConfig.gemini.killSwitchActive;
    this.degradedModeActive = false;
  }

  isGlobalKillSwitchActive(): boolean {
    return this.killSwitchActive;
  }

  isDegradedModeActive(): boolean {
    return this.degradedModeActive;
  }

  getState(): SystemControlsState {
    return {
      globalKillSwitchActive: this.killSwitchActive,
      degradedModeActive: this.degradedModeActive,
      lastToggledBy: this.lastToggledBy,
      lastToggledAt: this.lastToggledAt,
      toggleReason: this.toggleReason,
    };
  }

  setGlobalKillSwitch(
    active: boolean,
    userRole: UserRole,
    officerName: string,
    reason: string
  ): { success: boolean; error?: string } {
    if (userRole !== 'Incident Commander' && userRole !== 'Administrator') {
      auditLogService.recordEvent({
        action: 'KILL_SWITCH_UNAUTHORIZED_ATTEMPT',
        actor: { role: userRole, userId: officerName },
        resource: '/system/kill-switch',
        status: 'DENIED_UNAUTHORIZED',
        details: { attemptedState: active, reason },
        isSimulated: true,
      });

      return {
        success: false,
        error: `Unauthorized: Role '${userRole}' cannot operate the Global AI Kill Switch. Requires Incident Commander or Administrator.`,
      };
    }

    this.killSwitchActive = active;
    this.lastToggledBy = `${officerName} (${userRole})`;
    this.lastToggledAt = new Date().toISOString();
    this.toggleReason = reason;

    auditLogService.recordEvent({
      action: active ? 'GLOBAL_AI_KILL_SWITCH_ENGAGED' : 'GLOBAL_AI_KILL_SWITCH_DISENGAGED',
      actor: { role: userRole, userId: officerName },
      resource: '/system/kill-switch',
      status: 'SUCCESS',
      details: { active, reason },
      isSimulated: true,
    });

    return { success: true };
  }

  setDegradedMode(
    active: boolean,
    userRole: UserRole,
    officerName: string,
    reason: string
  ): { success: boolean; error?: string } {
    if (userRole !== 'Incident Commander' && userRole !== 'Administrator') {
      auditLogService.recordEvent({
        action: 'DEGRADED_MODE_UNAUTHORIZED_ATTEMPT',
        actor: { role: userRole, userId: officerName },
        resource: '/system/degraded-mode',
        status: 'DENIED_UNAUTHORIZED',
        details: { attemptedState: active, reason },
        isSimulated: true,
      });

      return {
        success: false,
        error: `Unauthorized: Role '${userRole}' cannot toggle Degraded Mode. Requires Incident Commander or Administrator.`,
      };
    }

    this.degradedModeActive = active;
    this.lastToggledBy = `${officerName} (${userRole})`;
    this.lastToggledAt = new Date().toISOString();
    this.toggleReason = reason;

    auditLogService.recordEvent({
      action: active ? 'DEGRADED_MODE_ACTIVATED' : 'DEGRADED_MODE_DEACTIVATED',
      actor: { role: userRole, userId: officerName },
      resource: '/system/degraded-mode',
      status: 'SUCCESS',
      details: { active, reason },
      isSimulated: true,
    });

    return { success: true };
  }
}

export const systemControls = new SystemControls();
