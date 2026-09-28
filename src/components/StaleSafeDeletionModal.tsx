/**
 * Folio - Stale-Safe Deletion Modal
 * Previews downstream derivative artifacts and SHA-256 hash fingerprints before confirmation.
 */

import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, FileText, Sparkles, Hash } from 'lucide-react';
import { MemoryMoment } from '../features/personal/types.ts';

interface StaleSafeDeletionModalProps {
  isOpen: boolean;
  moment: MemoryMoment | null;
  onClose: () => void;
  onConfirmDelete: (momentId: string) => void;
}

export const StaleSafeDeletionModal: React.FC<StaleSafeDeletionModalProps> = ({
  isOpen,
  moment,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !moment) return null;

  // Mock calculation of downstream derivatives based on moment
  const downstreamDerivatives = [
    {
      id: `deriv-weekly-${moment.id}`,
      type: 'Weekly Reflection Synthesis Draft',
      hash: `sha256:7f92${moment.hashFingerprint}a1c4`,
      status: 'Will be pruned',
    },
    {
      id: `deriv-keepsake-${moment.id}`,
      type: 'Connected Entity Relation (People & Places)',
      hash: `sha256:b8d1${moment.hashFingerprint}f503`,
      status: 'Will be unlinked',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/50 backdrop-blur-xs p-4">
      <div className="paper-card max-w-lg w-full p-6 bg-[#FDFCF7] border-2 border-[#1C1917] shadow-[4px_6px_0px_#1C1917] relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1C1917]/15">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#F9EBE7] border border-[#DE5239] text-[#DE5239] rounded-xs">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                Stale-Safe Deletion Preview
              </h3>
              <p className="text-xs font-mono text-[#78716C]">
                Symmetric Human Consent & Derivative Integrity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="my-4 space-y-3">
          <div className="p-3 bg-[#FAF7F0] border border-[#1C1917]/20 rounded-xs">
            <div className="text-xs font-mono uppercase text-[#78716C] flex items-center justify-between">
              <span>Source Record (Tier 1 User-Authored)</span>
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Hash className="w-3 h-3" />
                {moment.hashFingerprint}
              </span>
            </div>
            <p className="text-sm text-[#1C1917] mt-1.5 line-clamp-3 italic">
              "{moment.content}"
            </p>
          </div>

          <div>
            <span className="text-xs font-mono font-semibold text-[#DE5239] uppercase tracking-wider block mb-1.5">
              Affected Downstream Derivatives ({downstreamDerivatives.length})
            </span>
            <div className="space-y-1.5">
              {downstreamDerivatives.map((deriv) => (
                <div
                  key={deriv.id}
                  className="p-2 bg-[#FBF6EA] border border-[#1C1917]/15 rounded-xs flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-[#1C1917]">{deriv.type}</div>
                    <div className="font-mono text-[10px] text-[#78716C]">{deriv.hash}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-[#F9EBE7] text-[#DE5239] font-mono text-[10px] border border-[#DE5239]/30 rounded-xs">
                    {deriv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#78716C] leading-relaxed">
            Deleting this memory will safely invalidate all associated drafts and entity links. Nothing remains without your explicit consent.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C1917]/15">
          <button
            onClick={onClose}
            className="paper-button px-3.5 py-1.5 text-xs font-mono text-[#57534E] cursor-pointer"
          >
            Cancel & Keep Record
          </button>
          <button
            onClick={() => onConfirmDelete(moment.id)}
            className="paper-button-terracotta px-3.5 py-1.5 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Stale-Safe Deletion</span>
          </button>
        </div>

      </div>
    </div>
  );
};
