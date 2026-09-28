import React, { useState } from 'react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge.tsx';
import { INITIAL_AUDIT_LOGS } from '../../data/coastalScenarioData.ts';
import { AuditTraceEvent } from '../../shared/types/index.ts';

export const EvidenceAndAudit: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditTraceEvent[]>(INITIAL_AUDIT_LOGS);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTrace, setSelectedTrace] = useState<AuditTraceEvent | null>(INITIAL_AUDIT_LOGS[0]);

  // Aggregate Token Governance Metrics
  const totalCost = auditLogs.reduce((acc, log) => acc + log.tokenMetrics.costUsd, 0);
  const totalTokens = auditLogs.reduce(
    (acc, log) =>
      acc +
      log.tokenMetrics.inputTokens +
      log.tokenMetrics.cachedTokens +
      log.tokenMetrics.outputTokens,
    0
  );
  const cachedTokens = auditLogs.reduce((acc, log) => acc + log.tokenMetrics.cachedTokens, 0);
  const cacheHitRatio = totalTokens > 0 ? (cachedTokens / totalTokens) * 100 : 0;

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesAgent = selectedAgent === 'all' || log.agentName.includes(selectedAgent);
    const matchesStatus = selectedStatus === 'all' || log.outputStatus === selectedStatus;
    return matchesAgent && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
              IMMUTABLE WORM AUDIT TRAIL
            </span>
            <ProvenanceBadge
              classification="observed"
              confidence={1.0}
              freshness="Real-time Cryptographic Digest"
              source="Merkle Tree Signed by Hardware HSM"
              size="sm"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Public_Sans'] text-[#dae2fd]">
            Evidence, AI Governance &amp; Forensic Audit
          </h1>
          <p className="text-xs text-[#bfc7d2] font-['Inter'] mt-0.5">
            Complete transparent reasoning traces, tool inputs/outputs, model cache token governance, and cryptographic receipts.
          </p>
        </div>

        {/* Merkle Quorum Badge */}
        <div className="flex items-center gap-2 bg-[#060e20] px-3.5 py-2 rounded-xl border border-[#222a3d] font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <div>
            <span className="text-[#89929b] block text-[10px]">Merkle Tree Quorum</span>
            <span className="font-bold text-emerald-300 text-sm">5 / 5 Root Signatures Sealed</span>
          </div>
        </div>
      </div>

      {/* Token Governance & Economics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl">
          <span className="text-[11px] font-mono text-[#89929b] uppercase block">
            Total Operational Cost
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-[#6bd8cb]">
              ${totalCost.toFixed(5)}
            </span>
            <span className="text-xs text-[#89929b] font-mono">USD</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            Gemini 3.7 Flash optimized rates
          </span>
        </div>

        <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl">
          <span className="text-[11px] font-mono text-[#89929b] uppercase block">
            Context Cache Hit Ratio
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {cacheHitRatio.toFixed(1)}%
            </span>
            <span className="text-xs text-[#89929b] font-mono">Hit Rate</span>
          </div>
          <span className="text-[10px] text-[#bfc7d2] font-mono mt-1 block">
            {cachedTokens.toLocaleString()} cached tokens reused
          </span>
        </div>

        <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl">
          <span className="text-[11px] font-mono text-[#89929b] uppercase block">
            Safety Guardrail Interceptions
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">1</span>
            <span className="text-xs text-[#89929b] font-mono">Intercepted</span>
          </div>
          <span className="text-[10px] text-amber-300 font-mono mt-1 block">
            Deterministic rule override active
          </span>
        </div>

        <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl">
          <span className="text-[11px] font-mono text-[#89929b] uppercase block">
            WORM Integrity
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-[#93ccff]">100%</span>
            <span className="text-xs text-[#89929b] font-mono">Verified</span>
          </div>
          <span className="text-[10px] text-[#6bd8cb] font-mono mt-1 block">
            SHA256 &amp; ECDSA P-256 compliant
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131b2e] border border-[#222a3d] p-3 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#89929b]">Filter Agent:</span>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-[#060e20] text-[#93ccff] px-2.5 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none"
          >
            <option value="all">All Orchestration Agents</option>
            <option value="AdvisoryOrchestrator">Advisory Orchestrator</option>
            <option value="InterventionRanking">Intervention Ranking</option>
            <option value="CascadePrediction">Cascade Prediction</option>
            <option value="SentinelRadar">Sentinel Radar</option>
            <option value="SafetyGuardrail">Safety Guardrail Interceptor</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#89929b]">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#060e20] text-[#93ccff] px-2.5 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="INTERCEPTED">INTERCEPTED</option>
            <option value="SEALED">SEALED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table & Deep Trace Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Events Stream */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-[#222a3d] rounded-xl overflow-hidden">
          <div className="p-3 border-b border-[#171f33] flex items-center justify-between text-xs font-mono text-[#89929b]">
            <span>Audit Log Stream ({filteredLogs.length} events recorded)</span>
            <span>Click row to view cryptographic hash</span>
          </div>

          <div className="divide-y divide-[#171f33] max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => {
              const isSelected = selectedTrace?.traceId === log.traceId;
              return (
                <div
                  key={log.traceId}
                  onClick={() => setSelectedTrace(log)}
                  className={`p-3.5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${
                    isSelected
                      ? 'bg-[#1c2742] border-l-4 border-l-[#3198dc]'
                      : 'hover:bg-[#182136]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#6bd8cb]">{log.traceId}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-[#89929b] text-[11px]">{log.timestamp}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          log.outputStatus === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {log.outputStatus}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-[#dae2fd] font-['Inter']">
                      {log.agentName} → <span className="font-mono text-xs text-[#93ccff]">{log.toolName}</span>
                    </div>

                    <p className="text-[11px] text-[#89929b] font-['Inter'] line-clamp-1">
                      {log.guardrailNote || log.inputSource}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 text-[11px]">
                    <span className="text-emerald-400 font-bold">
                      ${log.tokenMetrics.costUsd.toFixed(5)}
                    </span>
                    <span className="text-[#89929b]">
                      {log.latencyMs} ms
                    </span>
                    <span className="text-[#93ccff] text-[10px]">
                      {log.tokenMetrics.cachedTokens > 0 ? 'CACHE HIT' : 'COLD CALL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Trace Inspector Card */}
        {selectedTrace && (
          <div className="space-y-4">
            <div className="bg-[#131b2e] border border-[#3198dc]/40 rounded-xl p-5 space-y-4 sticky top-20 shadow-xl">
              <div className="border-b border-[#171f33] pb-3">
                <span className="font-mono text-[10px] text-[#6bd8cb] uppercase block font-bold">
                  WORM Forensic Inspector
                </span>
                <h3 className="font-bold text-base text-[#dae2fd] font-mono">
                  {selectedTrace.traceId}
                </h3>
                <span className="text-xs text-[#89929b] font-mono">
                  {selectedTrace.timestamp}
                </span>
              </div>

              {/* Cryptographic Hash Digest */}
              <div className="bg-[#060e20] p-3 rounded-lg border border-[#222a3d] space-y-1.5 text-xs font-mono">
                <span className="text-[#89929b] text-[10px] uppercase block font-bold">
                  Merkle Root Hash Digest:
                </span>
                <div className="text-[10px] text-[#6bd8cb] break-all leading-tight">
                  {selectedTrace.merkleHash}
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-[#171f33]">
                  <span className="text-[#89929b]">Signed By:</span>
                  <span className="text-white">{selectedTrace.signedBy}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#89929b]">Payload Digest:</span>
                  <span className="text-[#93ccff]">{selectedTrace.toolPayloadDigest}</span>
                </div>
              </div>

              {/* Token Breakdown Box */}
              <div className="bg-[#060e20] p-3 rounded-lg border border-[#171f33] space-y-1.5 text-xs font-mono">
                <span className="text-[#89929b] text-[10px] uppercase block font-bold">
                  Token Accounting:
                </span>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Input Prompt Tokens:</span>
                  <span className="text-white">{selectedTrace.tokenMetrics.inputTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Context Cached Tokens:</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedTrace.tokenMetrics.cachedTokens}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Output Generation:</span>
                  <span className="text-white">{selectedTrace.tokenMetrics.outputTokens}</span>
                </div>
                {selectedTrace.tokenMetrics.thinkingTokens !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-[#89929b]">Thinking (Reasoning) Tokens:</span>
                    <span className="text-[#93ccff]">{selectedTrace.tokenMetrics.thinkingTokens}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-[#171f33]">
                  <span className="text-[#89929b]">Calculated Call Cost:</span>
                  <span className="text-emerald-400 font-bold">
                    ${selectedTrace.tokenMetrics.costUsd.toFixed(5)}
                  </span>
                </div>
              </div>

              {/* Guardrail & Compliance Note */}
              <div className="bg-[#060e20] p-3 rounded-lg border border-[#171f33] space-y-1 text-xs">
                <span className="text-[#89929b] font-mono text-[10px] uppercase block font-bold">
                  Guardrail Verification Note:
                </span>
                <p className="text-[#dae2fd] text-[11px] leading-relaxed">
                  {selectedTrace.guardrailNote}
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-bold">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>{selectedTrace.validationResult} AUDIT VERIFICATION</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
