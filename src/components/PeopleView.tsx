/**
 * Folio - People You Cherish View
 * Relationship cards displaying shared memories, pending promises, and unhurried connections.
 */

import React from 'react';
import { Heart, MapPin, CheckCircle2, MessageSquare, ArrowUpRight } from 'lucide-react';
import { PersonEntity } from '../features/personal/types.ts';

interface PeopleViewProps {
  people: PersonEntity[];
  onSelectPersonFilter: (personName: string) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  onSelectPersonFilter,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-2 border-b border-[#1C1917]/15">
        <h2 className="font-editorial text-2xl font-bold text-[#1C1917]">
          People You Cherish
        </h2>
        <p className="text-xs text-[#78716C] font-mono mt-0.5">
          Those who shape your days, shared conversations, and unspoken intentions
        </p>
      </div>

      {/* Grid of People */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {people.map((person) => (
          <div
            key={person.id}
            className="paper-card p-5 bg-[#FDFCF7] flex flex-col justify-between"
          >
            <div>
              {/* Person Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xs border-2 border-[#1C1917] flex items-center justify-center text-white font-editorial font-bold text-lg shadow-[1px_2px_0px_#1C1917]"
                    style={{ backgroundColor: person.avatarColor }}
                  >
                    {person.name[0]}
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                      {person.name}
                    </h3>
                    <p className="text-xs text-[#78716C] font-mono">
                      {person.relationship}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#78716C] bg-[#FAF7F0] px-2 py-0.5 border border-[#1C1917]/15 rounded-xs">
                  {person.lastConnectedAt}
                </span>
              </div>

              {/* Anecdote */}
              <p className="text-xs text-[#57534E] font-editorial italic bg-[#FAF7F0] p-2.5 border-l-2 border-[#C2A25E] rounded-r-xs mb-3">
                "{person.anecdoteSnippet}"
              </p>

              {/* Pending Promises */}
              {person.promisesPending.length > 0 && (
                <div className="mb-3 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#DE5239]">
                    Open Intention
                  </span>
                  {person.promisesPending.map((promise, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-[#F9EBE7] border border-[#DE5239]/20 rounded-xs text-xs text-[#1C1917] flex items-start gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#DE5239] shrink-0 mt-0.5" />
                      <span>{promise}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Shared Places */}
              <div className="space-y-1 mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#55604B]">
                  Shared Places
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {person.sharedPlaces.map((place, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-[#EEF2EB] text-[#55604B] border border-[#55604B]/20 rounded-xs"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{place}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Action */}
            <div className="pt-3 border-t border-[#1C1917]/10 flex items-center justify-between">
              <button
                onClick={() => onSelectPersonFilter(person.name)}
                className="paper-button px-3 py-1 text-xs font-mono text-[#1C1917] flex items-center gap-1.5 cursor-pointer hover:bg-[#FAF7F0]"
              >
                <span>View Memories with {person.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#DE5239]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
