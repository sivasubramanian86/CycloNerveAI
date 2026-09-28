/**
 * Folio - Keepsakes View
 * Tier 3 visual illustrations and archival storyboards generated strictly from approved briefs.
 */

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Plus, Palette, Download, ExternalLink } from 'lucide-react';
import { Keepsake, MemoryMoment } from '../features/personal/types.ts';
import { createKeepsakeFromApprovedBrief, renderKeepsakeArtSvg } from '../features/personal/keepsakeGenerator.ts';

interface KeepsakesViewProps {
  keepsakes: Keepsake[];
  approvedMoments: MemoryMoment[];
  onAddKeepsake: (keepsake: Keepsake) => void;
}

export const KeepsakesView: React.FC<KeepsakesViewProps> = ({
  keepsakes,
  approvedMoments,
  onAddKeepsake,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMomentId, setSelectedMomentId] = useState<string>(approvedMoments[0]?.id || '');
  const [briefTitle, setBriefTitle] = useState('');
  const [paletteTheme, setPaletteTheme] = useState<'terracotta' | 'forest' | 'brass' | 'parchment'>('terracotta');
  const [illustrationType, setIllustrationType] = useState<'sketch' | 'botanical' | 'archival_landscape' | 'linocut'>('archival_landscape');

  const handleGenerateKeepsake = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceMoment = approvedMoments.find((m) => m.id === selectedMomentId);
    if (!sourceMoment) return;

    const newKeepsake = createKeepsakeFromApprovedBrief({
      title: briefTitle.trim() || `Remembrance: ${sourceMoment.placeMentioned || 'Autumn Moment'}`,
      approvedBrief: sourceMoment.content,
      caption: `Drawn from your verified memory of ${sourceMoment.placeMentioned || 'a quiet afternoon'}.`,
      sourceMomentIds: [sourceMoment.id],
      paletteTheme,
      illustrationType,
    });

    onAddKeepsake(newKeepsake);
    setIsGenerating(false);
    setBriefTitle('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1C1917]/15">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#1C1917]">
            Visual Keepsakes
          </h2>
          <p className="text-xs text-[#78716C] font-mono mt-0.5">
            Artisanal storyboards & linocut impressions generated strictly from your approved briefs
          </p>
        </div>

        <button
          onClick={() => setIsGenerating(!isGenerating)}
          className="paper-button px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 cursor-pointer text-[#1C1917]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#DE5239]" />
          <span>{isGenerating ? 'Close Generator' : 'Generate from Brief'}</span>
        </button>
      </div>

      {/* Keepsake Brief Generator Form */}
      {isGenerating && (
        <form onSubmit={handleGenerateKeepsake} className="paper-card p-4 bg-[#FAF5E8] border border-[#1C1917] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-[#1C1917]">
              Tier 3 Keepsake Synthesis Desk
            </span>
            <span className="text-[10px] font-mono text-[#55604B] bg-[#EEF2EB] px-2 py-0.5 border border-[#55604B]/20 rounded-xs">
              Symmetric Consent: Human Brief Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#78716C] block mb-1">
                Select Approved Source Memory:
              </label>
              <select
                value={selectedMomentId}
                onChange={(e) => setSelectedMomentId(e.target.value)}
                className="w-full px-3 py-2 bg-[#FDFCF7] border border-[#1C1917]/20 text-xs rounded-xs focus:outline-none"
              >
                {approvedMoments.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.placeMentioned ? `${m.placeMentioned} — ` : ''}
                    {m.content.slice(0, 48)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#78716C] block mb-1">
                Keepsake Title:
              </label>
              <input
                type="text"
                value={briefTitle}
                onChange={(e) => setBriefTitle(e.target.value)}
                placeholder="e.g., Morning Coffee in Marylebone"
                className="w-full px-3 py-2 bg-[#FDFCF7] border border-[#1C1917]/20 text-xs rounded-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#78716C] block mb-1">
                Color Palette:
              </label>
              <select
                value={paletteTheme}
                onChange={(e) => setPaletteTheme(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FDFCF7] border border-[#1C1917]/20 text-xs rounded-xs focus:outline-none"
              >
                <option value="terracotta">Terracotta Earth (Warm Red)</option>
                <option value="forest">Muted Forest Moss (Green)</option>
                <option value="brass">Burnished Brass (Gold)</option>
                <option value="parchment">Antique Parchment (Monochrome Ink)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#78716C] block mb-1">
                Art Style:
              </label>
              <select
                value={illustrationType}
                onChange={(e) => setIllustrationType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FDFCF7] border border-[#1C1917]/20 text-xs rounded-xs focus:outline-none"
              >
                <option value="archival_landscape">Archival Landscape & Interior</option>
                <option value="botanical">Botanical & Still Life Specimen</option>
                <option value="linocut">Traditional Woodblock Linocut</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1C1917]/10">
            <button
              type="button"
              onClick={() => setIsGenerating(false)}
              className="paper-button px-3 py-1 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="paper-button-terracotta px-4 py-1 text-xs font-mono flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Approved Keepsake</span>
            </button>
          </div>
        </form>
      )}

      {/* Keepsakes Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {keepsakes.map((keepsake) => {
          const svgContent = renderKeepsakeArtSvg(keepsake);

          return (
            <div
              key={keepsake.id}
              className="paper-card p-4 bg-[#FDFCF7] flex flex-col justify-between"
            >
              <div>
                {/* SVG Artwork Container */}
                <div
                  className="mb-3 rounded-xs overflow-hidden border border-[#1C1917]/20"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />

                {/* Keepsake Details */}
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-editorial text-base font-bold text-[#1C1917]">
                    {keepsake.title}
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#FAF5E8] text-[#C2A25E] border border-[#C2A25E]/30 rounded-xs font-medium">
                    Tier 3 Keepsake
                  </span>
                </div>

                <p className="text-xs text-[#57534E] leading-relaxed mb-2 font-body italic">
                  "{keepsake.caption}"
                </p>

                <div className="p-2 bg-[#FAF7F0] border border-[#1C1917]/10 rounded-xs text-[11px] text-[#78716C] space-y-0.5 mb-3 font-mono">
                  <div className="text-[10px] uppercase font-bold text-[#1C1917]">Approved Human Brief:</div>
                  <p className="line-clamp-2 text-[#57534E]">
                    "{keepsake.approvedBrief}"
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-[#1C1917]/10 flex items-center justify-between text-[11px] font-mono text-[#78716C]">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#55604B]" />
                  <span>Labeled AI Generated</span>
                </div>
                <span>
                  {new Date(keepsake.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
