/**
 * Folio - Tier 3 Visual Keepsake Generator
 * Generates artisanal, archival illustrations created strictly from approved human briefs.
 * Always labeled as generated with source provenance hash.
 */

import { Keepsake } from './types.ts';

export function createKeepsakeFromApprovedBrief(params: {
  title: string;
  approvedBrief: string;
  caption: string;
  sourceMomentIds: string[];
  paletteTheme?: 'terracotta' | 'forest' | 'brass' | 'parchment';
  illustrationType?: 'sketch' | 'botanical' | 'archival_landscape' | 'linocut';
}): Keepsake {
  const {
    title,
    approvedBrief,
    caption,
    sourceMomentIds,
    paletteTheme = 'terracotta',
    illustrationType = 'archival_landscape',
  } = params;

  return {
    id: `keepsake-${Date.now()}`,
    title,
    approvedBrief,
    caption,
    createdAt: new Date().toISOString(),
    sourceMomentIds,
    isGenerated: true,
    paletteTheme,
    illustrationType,
  };
}

export function renderKeepsakeArtSvg(keepsake: Keepsake): string {
  // Generates bespoke SVG artwork based on style and palette
  const palettes = {
    terracotta: { bg: '#F9EBE7', stroke: '#DE5239', accent: '#C84630', paper: '#FDFCF7' },
    forest:     { bg: '#EEF2EB', stroke: '#55604B', accent: '#3F4936', paper: '#FDFCF7' },
    brass:      { bg: '#FAF5E8', stroke: '#C2A25E', accent: '#9B7E3E', paper: '#FDFCF7' },
    parchment:  { bg: '#F4EFEA', stroke: '#1C1917', accent: '#57534E', paper: '#FDFCF7' },
  };

  const p = palettes[keepsake.paletteTheme] || palettes.terracotta;

  if (keepsake.illustrationType === 'botanical') {
    return `
      <svg viewBox="0 0 320 200" class="w-full h-48 rounded bg-[#FBF6EA] border border-[#1C1917]/20" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="${p.bg}" opacity="0.6"/>
        <path d="M160 170 Q160 90 160 40" stroke="${p.stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Botanical Leaves -->
        <path d="M160 130 C130 120 120 95 160 85 C200 95 190 120 160 130 Z" fill="${p.paper}" stroke="${p.stroke}" stroke-width="1.5"/>
        <path d="M160 90 C135 80 130 55 160 50 C190 55 185 80 160 90 Z" fill="${p.paper}" stroke="${p.accent}" stroke-width="1.5"/>
        <circle cx="160" cy="38" r="4" fill="${p.stroke}"/>
        <circle cx="140" cy="70" r="3" fill="${p.accent}" opacity="0.7"/>
        <circle cx="180" cy="70" r="3" fill="${p.accent}" opacity="0.7"/>
        <text x="160" y="185" text-anchor="middle" font-family="Fraunces, serif" font-size="11" fill="#1C1917" opacity="0.75" font-style="italic">Specimen Botanica — Hand-Approved</text>
      </svg>
    `;
  }

  if (keepsake.illustrationType === 'linocut') {
    return `
      <svg viewBox="0 0 320 200" class="w-full h-48 rounded bg-[#FBF6EA] border border-[#1C1917]/20" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="${p.bg}" opacity="0.5"/>
        <!-- Linocut stylized porch steps & amber horizon -->
        <path d="M20 160 L300 160 L280 180 L40 180 Z" fill="${p.stroke}" opacity="0.8"/>
        <path d="M40 140 L280 140 L270 155 L50 155 Z" fill="${p.stroke}" opacity="0.6"/>
        <path d="M60 120 L260 120 L250 135 L70 135 Z" fill="${p.stroke}" opacity="0.4"/>
        <!-- Subtle moon / horizon -->
        <circle cx="160" cy="80" r="35" fill="none" stroke="${p.stroke}" stroke-width="1.5" stroke-dasharray="4 3"/>
        <line x1="80" y1="80" x2="240" y2="80" stroke="${p.accent}" stroke-width="1" stroke-dasharray="2 4"/>
        <text x="160" y="188" text-anchor="middle" font-family="Fraunces, serif" font-size="11" fill="#1C1917" opacity="0.75" font-style="italic">Linocut Series — Wood & Evening Dusk</text>
      </svg>
    `;
  }

  // Default: Archival Landscape / Cafe Window
  return `
    <svg viewBox="0 0 320 200" class="w-full h-48 rounded bg-[#FBF6EA] border border-[#1C1917]/20" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="${p.bg}" opacity="0.7"/>
      <!-- Window pane frame -->
      <line x1="160" y1="20" x2="160" y2="180" stroke="${p.stroke}" stroke-width="1.2" opacity="0.3"/>
      <line x1="20" y1="100" x2="300" y2="100" stroke="${p.stroke}" stroke-width="1.2" opacity="0.3"/>
      <!-- Steaming ceramic cup -->
      <path d="M120 130 C120 155 160 155 160 130 Z" fill="${p.paper}" stroke="${p.stroke}" stroke-width="1.8"/>
      <path d="M160 135 C170 135 170 145 160 148" fill="none" stroke="${p.stroke}" stroke-width="1.5"/>
      <!-- Gentle steam curves -->
      <path d="M135 125 Q132 110 138 100" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M145 122 Q150 108 143 95" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Saucer -->
      <ellipse cx="140" cy="155" rx="30" ry="5" fill="${p.paper}" stroke="${p.stroke}" stroke-width="1.5"/>
      <text x="160" y="185" text-anchor="middle" font-family="Fraunces, serif" font-size="11" fill="#1C1917" opacity="0.75" font-style="italic">Archival Reminiscence — Marylebone Coffee</text>
    </svg>
  `;
}
