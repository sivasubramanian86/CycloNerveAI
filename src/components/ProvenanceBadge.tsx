import React from 'react';
import { DataClassification } from '../shared/types/index.ts';

interface ProvenanceBadgeProps {
  classification: DataClassification;
  confidence?: number; // 0 to 1
  freshness?: string; // e.g. "2m ago"
  source?: string;
  isSimulated?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  classification,
  confidence,
  freshness,
  source,
  isSimulated,
  className = '',
  size = 'md',
}) => {
  // Classification badge color styling
  const configMap: Record<
    DataClassification,
    { label: string; tag: string; bg: string; text: string; border: string; desc: string }
  > = {
    observed: {
      label: 'Observed',
      tag: 'OBS',
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-600/40',
      desc: 'Direct physical telemetry (SCADA / Doppler Radar)',
    },
    forecast: {
      label: 'Forecast',
      tag: 'FCST',
      bg: 'bg-blue-950/60',
      text: 'text-blue-300',
      border: 'border-blue-500/40',
      desc: 'Numerical Weather Prediction (IMD / ECMWF)',
    },
    derived: {
      label: 'Derived',
      tag: 'DERV',
      bg: 'bg-purple-950/60',
      text: 'text-purple-300',
      border: 'border-purple-500/40',
      desc: 'Algorithmically computed (GEE Sentinel-1 SAR & Inundation)',
    },
    simulated: {
      label: 'Simulated',
      tag: 'SIM',
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      desc: 'Synthetic drill / cascade scenario model',
    },
  };

  const badgeConfig = configMap[classification] || configMap.simulated;
  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono ${badgeConfig.bg} ${badgeConfig.border} border px-2 py-0.5 rounded ${
        isSmall ? 'text-[10px]' : 'text-[11px]'
      } ${className}`}
      title={`${badgeConfig.desc}${source ? ` • Source: ${source}` : ''}`}
    >
      <span className={`font-bold ${badgeConfig.text} tracking-wider`}>
        [{badgeConfig.tag}]
      </span>
      {confidence !== undefined && (
        <span className="text-[#dae2fd]/80">
          {(confidence * 100).toFixed(0)}%
        </span>
      )}
      {freshness && (
        <>
          <span className="text-white/30">•</span>
          <span className="text-[#89929b] text-[10px]">{freshness}</span>
        </>
      )}
      {isSimulated && classification !== 'simulated' && (
        <span className="px-1 bg-amber-500/20 text-amber-400 text-[9px] rounded font-bold">
          SIM
        </span>
      )}
    </div>
  );
};
