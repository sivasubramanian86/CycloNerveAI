/**
 * Folio - Memory Capture Desk (The Quiet Mirror)
 * Multi-modal intake (Text, Voice Audio, Photo Notes) with 70/30 Anti-Interrogation enforcement
 * and Tier 2 uncommitted proposal review.
 */

import React, { useState } from 'react';
import { Mic, Send, Image, Sparkles, Check, X, Shield, Volume2, ArrowRight } from 'lucide-react';
import { MemoryMoment, ReflectiveTurnResult } from '../features/personal/types.ts';
import { personalIntelligenceEngine } from '../features/personal/agentChoreography.ts';

interface CaptureDeskProps {
  onCommitApprovedMoment: (moment: MemoryMoment) => void;
}

export const MemoryCaptureDesk: React.FC<CaptureDeskProps> = ({ onCommitApprovedMoment }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeProposal, setActiveProposal] = useState<ReflectiveTurnResult | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCaptureSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    // Simulate low-latency multi-agent pass
    setTimeout(() => {
      const result = personalIntelligenceEngine.processReflectiveTurn({
        userInput: inputText,
      });
      setActiveProposal(result);
      setEditingContent(result.tier2DraftProposal.content);
      setInputText('');
      setIsProcessing(false);
    }, 400);
  };

  const handleSimulateVoiceNote = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setInputText(
        'Voice Note (0:36): "Walking through the rain past the flower market. Ran into Kabir and we stopped under the awning. Reminded me to bring that cardamom preserve recipe next time."'
      );
    }, 1200);
  };

  const handleApproveProposal = () => {
    if (!activeProposal) return;
    const finalMoment: MemoryMoment = {
      ...activeProposal.tier2DraftProposal,
      content: isEditing ? editingContent : activeProposal.tier2DraftProposal.content,
      status: 'approved',
      tier: 'TIER_1_USER_AUTHORED', // Once approved by human, officially committed as user history
      approvedAt: new Date().toISOString(),
    };
    onCommitApprovedMoment(finalMoment);
    setActiveProposal(null);
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setActiveProposal(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Input Desk */}
      <div className="paper-card p-4 bg-[#FDFCF7]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#55604B]" />
            <span className="text-xs font-mono text-[#78716C] uppercase tracking-wider">
              The Quiet Mirror • Anti-Interrogation Policy (70/30)
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#55604B] bg-[#EEF2EB] px-2 py-0.5 border border-[#55604B]/20 rounded-xs">
            Reflections: 80% • Questions: 20%
          </span>
        </div>

        <form onSubmit={handleCaptureSubmit} className="space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Write a quiet thought, mention a friend, or capture an afternoon conversation..."
            className="w-full h-24 p-3 bg-[#FAF7F0] border border-[#1C1917]/20 rounded-xs text-sm text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#DE5239] transition-all resize-none font-body"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateVoiceNote}
                disabled={isRecording}
                className={`paper-button px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 cursor-pointer ${
                  isRecording ? 'bg-[#DE5239] text-white animate-pulse' : 'text-[#57534E]'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecording ? 'Listening...' : 'Voice Note'}</span>
              </button>

              <button
                type="button"
                onClick={() => setInputText('Photo Note: Freshly turned terracotta vase drying by the studio radiator in Portland with Elena.')}
                className="paper-button px-3 py-1.5 text-xs font-mono text-[#57534E] flex items-center gap-1.5 cursor-pointer"
              >
                <Image className="w-3.5 h-3.5" />
                <span>Photo Memory</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="paper-button-terracotta px-4 py-1.5 text-xs font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isProcessing ? 'Reflecting...' : 'Reflect & Mirror'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Tier 2 Uncommitted Proposal Card (Symmetric Consent) */}
      {activeProposal && (
        <div className="paper-card p-5 bg-[#FAF5E8] border-2 border-[#1C1917] shadow-[3px_4px_0px_#1C1917] animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1C1917]/15">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-[#DE5239] text-white rounded-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-mono font-bold text-[#1C1917] uppercase tracking-wider">
                Tier 2: AI Proposal (Held Uncommitted Pending Your Approval)
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#DE5239] bg-[#F9EBE7] px-2 py-0.5 border border-[#DE5239]/20 rounded-xs">
              Zero Silent Commits
            </span>
          </div>

          {/* Quiet Reflection Observation */}
          <div className="p-3 bg-[#FDFCF7] border border-[#1C1917]/20 rounded-xs mb-3">
            <div className="text-[11px] font-mono uppercase text-[#78716C] mb-1">
              Quiet Mirror Observation
            </div>
            <p className="text-sm font-editorial text-[#1C1917] leading-relaxed italic">
              "{activeProposal.reflectionText}"
            </p>

            {activeProposal.hasQuestion && activeProposal.optionalQuestion && (
              <div className="mt-2.5 pt-2 border-t border-[#1C1917]/10 flex items-start gap-2 text-xs text-[#DE5239]">
                <span className="font-mono font-bold text-[10px] uppercase bg-[#F9EBE7] px-1.5 py-0.5 rounded-xs">
                  Gentle Thought
                </span>
                <span>{activeProposal.optionalQuestion}</span>
              </div>
            )}
          </div>

          {/* Reconciliation Findings */}
          {activeProposal.reconciliationInsights.length > 0 && (
            <div className="mb-3 p-2.5 bg-[#EEF2EB] border border-[#55604B]/30 rounded-xs text-xs text-[#55604B] space-y-1">
              <div className="font-mono font-bold uppercase text-[10px]">
                Connected Moments Discovered:
              </div>
              {activeProposal.reconciliationInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span>•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}

          {/* Editable Draft Body */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#78716C] mb-1">
              <span>Memory Content to Commit:</span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-[#DE5239] underline cursor-pointer"
              >
                {isEditing ? 'Done Editing' : 'Edit Text'}
              </button>
            </div>
            {isEditing ? (
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full h-20 p-2 bg-[#FDFCF7] border border-[#1C1917] text-xs font-body rounded-xs focus:outline-none"
              />
            ) : (
              <div className="p-2.5 bg-[#FDFCF7] border border-[#1C1917]/20 rounded-xs text-xs text-[#1C1917]">
                {editingContent}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1C1917]/15">
            <span className="text-[11px] font-mono text-[#78716C]">
              Hash: {activeProposal.tier2DraftProposal.hashFingerprint}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="paper-button px-3 py-1.5 text-xs font-mono text-[#78716C] flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>

              <button
                type="button"
                onClick={handleApproveProposal}
                className="paper-button-forest px-4 py-1.5 text-xs font-mono flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Adopt & Commit to My Story</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
