/**
 * Folio - Connected Moments View
 * Primary timeline displaying user-authored records, reflections, and 3-tier provenance badges.
 */

import React, { useState } from 'react';
import { Volume2, MapPin, Users, Calendar, Trash2, ShieldCheck, Clock, Tag } from 'lucide-react';
import { MemoryMoment } from '../features/personal/types.ts';

interface MomentsViewProps {
  moments: MemoryMoment[];
  onRequestDelete: (moment: MemoryMoment) => void;
  onFilterPerson?: string | null;
}

export const MomentsView: React.FC<MomentsViewProps> = ({
  moments,
  onRequestDelete,
  onFilterPerson,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredMoments = moments.filter((m) => {
    if (onFilterPerson && !m.peopleMentioned.includes(onFilterPerson)) {
      return false;
    }
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      return (
        m.content.toLowerCase().includes(q) ||
        m.peopleMentioned.some((p) => p.toLowerCase().includes(q)) ||
        (m.placeMentioned && m.placeMentioned.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Sub-header & Filter Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1C1917]/15">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#1C1917]">
            Connected Moments
          </h2>
          <p className="text-xs text-[#78716C] font-mono mt-0.5">
            Preserved memories, voice notes, and quiet reflections ({filteredMoments.length} entries)
          </p>
        </div>

        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter by name, place, or word..."
          className="px-3 py-1.5 bg-[#FDFCF7] border border-[#1C1917]/20 rounded-xs text-xs font-mono text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#DE5239] w-56"
        />
      </div>

      {/* Moments List */}
      <div className="space-y-3.5">
        {filteredMoments.map((moment) => {
          const isPending = moment.tier === 'TIER_2_AI_DRAFT' && moment.status === 'uncommitted';

          return (
            <div
              key={moment.id}
              className={`paper-card p-4 transition-all ${
                isPending ? 'bg-[#FAF5E8] border-dashed border-[#C2A25E]' : 'bg-[#FDFCF7]'
              }`}
            >
              {/* Card Meta Row */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1C1917]/10">
                <div className="flex items-center gap-2">
                  {/* Provenance Badge */}
                  {moment.tier === 'TIER_1_USER_AUTHORED' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#EEF2EB] text-[#55604B] border border-[#55604B]/30 rounded-xs flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>You Authored (Tier 1)</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FAF5E8] text-[#C2A25E] border border-[#C2A25E] rounded-xs flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3" />
                      <span>AI Draft: Pending Your Approval (Tier 2)</span>
                    </span>
                  )}

                  {moment.audioUrl && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F9EBE7] text-[#DE5239] border border-[#DE5239]/20 rounded-xs flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>Voice Recording</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#78716C]">
                    {new Date(moment.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => onRequestDelete(moment)}
                    title="Stale-Safe Deletion"
                    className="p-1 text-[#78716C] hover:text-[#DE5239] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <p className="text-sm font-body text-[#1C1917] leading-relaxed mb-3">
                {moment.content}
              </p>

              {/* Quiet Mirror Observation */}
              {moment.reflectiveObservation && (
                <div className="p-2.5 bg-[#FAF7F0] border-l-2 border-[#DE5239] text-xs text-[#57534E] mb-2.5 font-editorial italic">
                  "{moment.reflectiveObservation}"
                </div>
              )}

              {/* Metadata chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1C1917]/10 text-xs">
                {moment.peopleMentioned.map((person) => (
                  <span
                    key={person}
                    className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-[#FAF7F0] border border-[#1C1917]/20 rounded-xs text-[#1C1917]"
                  >
                    <Users className="w-3 h-3 text-[#DE5239]" />
                    <span>{person}</span>
                  </span>
                ))}

                {moment.placeMentioned && (
                  <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-[#FAF7F0] border border-[#1C1917]/20 rounded-xs text-[#1C1917]">
                    <MapPin className="w-3 h-3 text-[#55604B]" />
                    <span>{moment.placeMentioned}</span>
                  </span>
                )}

                <span className="ml-auto text-[10px] font-mono text-[#78716C]">
                  Fingerprint: {moment.hashFingerprint}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
