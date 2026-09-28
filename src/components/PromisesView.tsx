/**
 * Folio - Promises & Intentions View
 * Separates active commitments (promises to people) from aspirational wishlists.
 */

import React, { useState } from 'react';
import { HeartHandshake, Compass, CheckCircle2, Clock, Plus, Check } from 'lucide-react';
import { PromiseIntent } from '../features/personal/types.ts';

interface PromisesViewProps {
  promises: PromiseIntent[];
  onTogglePromiseStatus: (promiseId: string) => void;
  onAddPromise: (promise: Omit<PromiseIntent, 'id' | 'createdAt' | 'sourceMomentId'>) => void;
}

export const PromisesView: React.FC<PromisesViewProps> = ({
  promises,
  onTogglePromiseStatus,
  onAddPromise,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'commitments' | 'wishlists'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'commitment' | 'wishlist'>('commitment');
  const [newPerson, setNewPerson] = useState('');
  const [newContext, setNewContext] = useState('');

  const commitments = promises.filter((p) => p.type === 'commitment');
  const wishlists = promises.filter((p) => p.type === 'wishlist');

  const displayed =
    activeTab === 'commitments'
      ? commitments
      : activeTab === 'wishlists'
      ? wishlists
      : promises;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddPromise({
      title: newTitle.trim(),
      type: newType,
      personName: newPerson.trim() || undefined,
      context: newContext.trim() || 'Recorded from personal intention desk',
      status: 'open',
    });

    setNewTitle('');
    setNewPerson('');
    setNewContext('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1C1917]/15">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#1C1917]">
            Promises & Intentions
          </h2>
          <p className="text-xs text-[#78716C] font-mono mt-0.5">
            Active commitments to people you cherish vs quiet aspirational wishlists
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="paper-button px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 cursor-pointer text-[#1C1917]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Close Form' : 'New Intention'}</span>
        </button>
      </div>

      {/* Add Intention Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="paper-card p-4 bg-[#FAF5E8] border border-[#1C1917] space-y-3">
          <div className="text-xs font-mono font-bold uppercase text-[#1C1917]">
            Add a Promise or Aspiration
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What did you promise or intend to do?"
              className="px-3 py-2 bg-[#FDFCF7] border border-[#1C1917]/20 text-xs rounded-xs focus:outline-none"
              required
            />
            <div className="flex gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'commitment' | 'wishlist')}
                className="px-3 py-2 bg-[#FDFCF7] border border-[#1C1917]/20 text-xs rounded-xs focus:outline-none"
              >
                <option value="commitment">Commitment (To someone)</option>
                <option value="wishlist">Wishlist (Personal aspiration)</option>
              </select>

              {newType === 'commitment' && (
                <input
                  type="text"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  placeholder="Person's name"
                  className="px-3 py-2 bg-[#FDFCF7] border border-[#1C1917]/20 text-xs rounded-xs focus:outline-none flex-1"
                />
              )}
            </div>
          </div>

          <input
            type="text"
            value={newContext}
            onChange={(e) => setNewContext(e.target.value)}
            placeholder="Context or quiet reason..."
            className="w-full px-3 py-1.5 bg-[#FDFCF7] border border-[#1C1917]/20 text-xs rounded-xs focus:outline-none"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="paper-button px-3 py-1 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="paper-button-forest px-4 py-1 text-xs font-mono"
            >
              Save Intention
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#1C1917]/10 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 text-xs font-mono rounded-xs cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#1C1917] text-white'
              : 'bg-[#FAF7F0] text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          All Intentions ({promises.length})
        </button>
        <button
          onClick={() => setActiveTab('commitments')}
          className={`px-3 py-1 text-xs font-mono rounded-xs flex items-center gap-1 cursor-pointer ${
            activeTab === 'commitments'
              ? 'bg-[#DE5239] text-white'
              : 'bg-[#FAF7F0] text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Promises to Others ({commitments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlists')}
          className={`px-3 py-1 text-xs font-mono rounded-xs flex items-center gap-1 cursor-pointer ${
            activeTab === 'wishlists'
              ? 'bg-[#55604B] text-white'
              : 'bg-[#FAF7F0] text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Aspirational Wishlists ({wishlists.length})</span>
        </button>
      </div>

      {/* Promises List */}
      <div className="space-y-3">
        {displayed.map((promise) => {
          const isFulfilled = promise.status === 'fulfilled';

          return (
            <div
              key={promise.id}
              className={`paper-card p-4 transition-all ${
                isFulfilled ? 'bg-[#FAF7F0] opacity-75' : 'bg-[#FDFCF7]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onTogglePromiseStatus(promise.id)}
                    title={isFulfilled ? 'Mark as Open' : 'Mark as Reconciled'}
                    className={`mt-0.5 w-5 h-5 rounded-xs border border-[#1C1917] flex items-center justify-center cursor-pointer transition-colors ${
                      isFulfilled ? 'bg-[#55604B] text-white' : 'bg-[#FDFCF7] hover:bg-[#FAF5E8]'
                    }`}
                  >
                    {isFulfilled && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isFulfilled ? 'line-through text-[#78716C]' : 'text-[#1C1917]'
                        }`}
                      >
                        {promise.title}
                      </span>

                      {promise.type === 'commitment' ? (
                        <span className="text-[10px] font-mono px-2 py-0.2 bg-[#F9EBE7] text-[#DE5239] border border-[#DE5239]/20 rounded-xs">
                          Promise to {promise.personName || 'Someone'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.2 bg-[#EEF2EB] text-[#55604B] border border-[#55604B]/20 rounded-xs">
                          Quiet Wishlist
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#57534E] italic font-body">
                      "{promise.context}"
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#78716C] shrink-0">
                  {new Date(promise.createdAt).toLocaleDateString(undefined, {
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
