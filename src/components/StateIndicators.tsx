import React from 'react';

export const LoadingState: React.FC<{ message?: string; subMessage?: string }> = ({
  message = 'Calculating Neuro-Symbolic Cascade Engine...',
  subMessage = 'Traversing dependency graph & verifying policy constraints against CERC Grid Code',
}) => (
  <div
    role="status"
    aria-live="polite"
    className="w-full flex flex-col items-center justify-center p-12 bg-[#060e20]/60 border border-[#222a3d] rounded-xl text-center space-y-4"
  >
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full border-2 border-[#3198dc]/20 border-t-[#3198dc] animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#3198dc] text-[20px] animate-pulse">
          cyclone
        </span>
      </div>
    </div>
    <div>
      <h4 className="text-sm font-semibold text-[#dae2fd]">{message}</h4>
      <p className="text-xs text-[#89929b] mt-1 font-mono max-w-md">{subMessage}</p>
    </div>
    <span className="sr-only">Loading content, please wait...</span>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}> = ({
  title,
  description,
  icon = 'search_off',
  actionText,
  onAction,
}) => (
  <div className="w-full flex flex-col items-center justify-center p-12 bg-[#060e20]/40 border border-dashed border-[#222a3d] rounded-xl text-center space-y-3">
    <div className="w-12 h-12 rounded-full bg-[#131b2e] flex items-center justify-center text-[#89929b]">
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <div className="max-w-sm">
      <h4 className="text-sm font-semibold text-[#dae2fd]">{title}</h4>
      <p className="text-xs text-[#89929b] mt-1">{description}</p>
    </div>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="mt-2 px-3 py-1.5 rounded-lg bg-[#131b2e] hover:bg-[#222a3d] text-xs text-[#93ccff] font-medium border border-[#3198dc]/30 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const StaleDataBanner: React.FC<{
  lastUpdated: string;
  source: string;
  onRefresh?: () => void;
}> = ({ lastUpdated, source, onRefresh }) => (
  <div
    role="alert"
    className="w-full flex items-center justify-between px-3.5 py-2 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-200 text-xs"
  >
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-amber-400 text-sm">history_toggle_off</span>
      <span>
        <strong className="font-semibold">Stale Telemetry Notice:</strong> Data from{' '}
        <span className="font-mono text-amber-300">{source}</span> was last updated at{' '}
        <span className="font-mono font-semibold">{lastUpdated}</span> (&gt; 15 min ago).
      </span>
    </div>
    {onRefresh && (
      <button
        onClick={onRefresh}
        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-[11px] font-medium border border-amber-500/30"
      >
        Force Polling
      </button>
    )}
  </div>
);

export const PartialDataBanner: React.FC<{
  missingFeeds: string[];
  impactDescription: string;
}> = ({ missingFeeds, impactDescription }) => (
  <div
    role="alert"
    className="w-full flex items-start gap-2.5 px-3.5 py-2.5 bg-blue-950/40 border border-blue-500/40 rounded-lg text-blue-200 text-xs"
  >
    <span className="material-symbols-outlined text-blue-400 text-sm mt-0.5">info</span>
    <div className="flex-1">
      <div className="flex items-center gap-1.5 font-semibold text-blue-100">
        <span>Partial Data Synthesis Active</span>
        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 border border-blue-400/30">
          DEGRADED INGEST
        </span>
      </div>
      <p className="text-[11px] text-blue-200/80 mt-0.5">
        Offline feeds: <span className="font-mono text-blue-300">{missingFeeds.join(', ')}</span>. {impactDescription}
      </p>
    </div>
  </div>
);

export const DegradedModeBanner: React.FC<{ onOpenHealth: () => void }> = ({ onOpenHealth }) => (
  <div
    role="alert"
    className="w-full flex items-center justify-between px-3.5 py-2 bg-red-950/60 border border-red-500/50 rounded-lg text-red-200 text-xs"
  >
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-red-400 text-base animate-pulse">cloud_off</span>
      <span>
        <strong className="font-semibold">Degraded Air-Gap Mode Active:</strong> Terrestrial backhaul severed. Running on deterministic local model and GSAT-7A SATCOM transponder cache.
      </span>
    </div>
    <button
      onClick={onOpenHealth}
      className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 font-mono text-[11px] font-bold border border-red-500/40"
    >
      View SRE Mesh
    </button>
  </div>
);

export const ErrorState: React.FC<{
  title: string;
  errorMessage: string;
  onRetry?: () => void;
}> = ({ title, errorMessage, onRetry }) => (
  <div
    role="alert"
    className="w-full flex flex-col items-center justify-center p-8 bg-red-950/30 border border-red-500/30 rounded-xl text-center space-y-3"
  >
    <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center text-red-400">
      <span className="material-symbols-outlined text-xl">error_outline</span>
    </div>
    <div>
      <h4 className="text-sm font-semibold text-red-200">{title}</h4>
      <p className="text-xs text-red-300/80 mt-1 font-mono max-w-md">{errorMessage}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-3 py-1 rounded bg-red-900/50 hover:bg-red-900/80 text-red-200 font-mono text-xs border border-red-500/40 transition-colors"
      >
        Retry Operation
      </button>
    )}
  </div>
);
