import React, { useState } from 'react';
import { DependencyEdge, InfrastructureAsset } from '../shared/types/index.ts';
import { ProvenanceBadge } from './ProvenanceBadge.tsx';

interface TacticalMapProps {
  assets: InfrastructureAsset[];
  edges: DependencyEdge[];
  highlightAssetId?: string | null;
  onSelectAsset?: (asset: InfrastructureAsset) => void;
  showSurgeInundation?: boolean;
  showWindRadii?: boolean;
  showTrackCone?: boolean;
  selectedSector?: string | null;
  heightClass?: string;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  assets,
  edges,
  highlightAssetId,
  onSelectAsset,
  showSurgeInundation = true,
  showWindRadii = true,
  showTrackCone = true,
  selectedSector,
  heightClass = 'h-[460px]',
}) => {
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    surge: showSurgeInundation,
    wind: showWindRadii,
    track: showTrackCone,
    edges: true,
    shelters: true,
  });

  // Coordinate projection from GPS lat/lng to SVG viewBox (0,0 to 1000, 600)
  // Region bounds:
  // Lat: 20.65 (south) to 21.25 (north) -> range = 0.60
  // Lng: 86.40 (west) to 87.25 (east) -> range = 0.85
  const project = (lat: number, lng: number) => {
    const minLat = 20.65;
    const maxLat = 21.25;
    const minLng = 86.4;
    const maxLng = 87.25;

    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 600; // Inverted Y for SVG
    return { x, y };
  };

  const handleNodeClick = (asset: InfrastructureAsset) => {
    setSelectedAsset(asset);
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Pre-calculate positions
  const assetPositions = new Map<string, { x: number; y: number }>();
  assets.forEach((a) => {
    assetPositions.set(a.assetId, project(a.coordinates.lat, a.coordinates.lng));
  });

  // Cyclone Eye position (Dhamra Estuary off-shore)
  const eyePos = project(20.798, 86.963);

  // Sector color mapping
  const getSectorColor = (sector: string, status: string) => {
    if (status === 'breached') return '#ef4444'; // Red
    if (status === 'threatened') return '#f59e0b'; // Amber
    if (status === 'offline') return '#64748b'; // Slate
    switch (sector) {
      case 'power':
        return '#38bdf8'; // Sky blue
      case 'health':
        return '#34d399'; // Emerald
      case 'telecom':
        return '#818cf8'; // Indigo
      case 'transport':
        return '#fbbf24'; // Yellow
      case 'water':
        return '#06b6d4'; // Cyan
      case 'shelter':
        return '#a78bfa'; // Purple
      default:
        return '#6bd8cb';
    }
  };

  return (
    <div className={`relative w-full ${heightClass} bg-[#060e20] rounded-xl overflow-hidden border border-[#222a3d] select-none shadow-inner`}>
      {/* Map Header Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-[#0b1326]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#222a3d] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping"></span>
          <span className="text-[#93ccff] font-semibold">RADAR LAYER: ODISHA COAST</span>
          <span className="text-white/30">•</span>
          <span className="text-[#89929b]">20.80°N, 86.96°E</span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#0b1326]/90 backdrop-blur-md px-2 py-1 rounded-lg border border-[#222a3d] text-[11px] font-mono">
          <button
            onClick={() => toggleLayer('surge')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeLayers.surge ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-[#89929b]'
            }`}
          >
            Surge (3.6m)
          </button>
          <button
            onClick={() => toggleLayer('wind')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeLayers.wind ? 'bg-red-950 text-red-300 border border-red-500/40' : 'text-[#89929b]'
            }`}
          >
            Wind Radii
          </button>
          <button
            onClick={() => toggleLayer('track')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeLayers.track ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'text-[#89929b]'
            }`}
          >
            Track Cone
          </button>
          <button
            onClick={() => toggleLayer('edges')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeLayers.edges ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40' : 'text-[#89929b]'
            }`}
          >
            Dependencies
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Tactical Grid Pattern */}
          <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#131b2e" strokeWidth="0.8" />
          </pattern>

          {/* Water Radial Gradient for Bay of Bengal */}
          <radialGradient id="bayGradient" cx="80%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#082f49" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#031a29" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020d18" stopOpacity="1" />
          </radialGradient>

          {/* Cyclone Gale Wind Gradient */}
          <radialGradient id="cycloneEyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#f97316" stopOpacity="0.35" />
            <stop offset="80%" stopColor="#eab308" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          {/* Surge Inundation Pattern */}
          <pattern id="inundationHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#06b6d4" strokeWidth="1.2" strokeOpacity="0.6" />
          </pattern>
        </defs>

        {/* Base Background Grid */}
        <rect width="1000" height="600" fill="#081024" />
        <rect width="1000" height="600" fill="url(#tactical-grid)" />

        {/* Bay of Bengal Ocean Polygon */}
        <path
          d="M 640 0 C 650 140, 610 260, 590 340 C 570 420, 600 500, 680 600 L 1000 600 L 1000 0 Z"
          fill="url(#bayGradient)"
        />

        {/* Coastal Estuary Inundation Zones (Dhamra River & Baitarani Estuary) */}
        {activeLayers.surge && (
          <g className="transition-opacity duration-300">
            {/* 3.6m Surge Flood Plain */}
            <path
              d="M 620 180 C 580 200, 540 240, 560 300 C 580 360, 510 400, 530 460 C 570 480, 630 430, 650 360 C 670 290, 650 200, 620 180 Z"
              fill="#0891b2"
              fillOpacity="0.25"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <path
              d="M 620 180 C 580 200, 540 240, 560 300 C 580 360, 510 400, 530 460 C 570 480, 630 430, 650 360 C 670 290, 650 200, 620 180 Z"
              fill="url(#inundationHatch)"
            />
            {/* Embankment Breach Marker */}
            <g transform="translate(615, 305)">
              <circle r="12" fill="#ef4444" fillOpacity="0.3" className="animate-ping" />
              <circle r="5" fill="#ef4444" />
              <text x="8" y="4" fill="#fca5a5" fontSize="10" fontFamily="monospace" fontWeight="bold">
                DYKE BREACH (+3.6m SURGE)
              </text>
            </g>
          </g>
        )}

        {/* Coastal Highway R-16 Path */}
        <path
          d="M 280 60 L 360 170 L 490 280 L 590 350 L 610 460"
          fill="none"
          stroke="#ef4444"
          strokeWidth="3.5"
          strokeDasharray="6 3"
          strokeOpacity="0.85"
        />
        <text x="470" y="270" fill="#fca5a5" fontSize="9" fontFamily="monospace" fontWeight="bold">
          ROUTE R-16 (IMPASSABLE BY T-10h)
        </text>

        {/* Inland Safe Highway SH-09 Path */}
        <path
          d="M 120 40 L 210 160 L 290 280 L 340 430 L 400 580"
          fill="none"
          stroke="#10b981"
          strokeWidth="4"
          strokeOpacity="0.9"
        />
        <text x="215" y="150" fill="#6ee7b7" fontSize="9" fontFamily="monospace" fontWeight="bold">
          HIGHWAY SH-09 (ELEVATED SAFE BYPASS)
        </text>

        {/* Cyclone Track Cone & Forecast Eye */}
        {activeLayers.track && (
          <g className="transition-opacity duration-300">
            {/* Forecast Cone of Uncertainty */}
            <path
              d="M 960 480 L 780 390 L 670 330 L 540 270 L 620 200 L 790 270 L 980 360 Z"
              fill="#ef4444"
              fillOpacity="0.1"
              stroke="#ef4444"
              strokeWidth="1.2"
              strokeDasharray="5 3"
            />
            {/* Track Centerline */}
            <path
              d="M 970 420 Q 820 360 670 320 T 520 280"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
          </g>
        )}

        {/* Cyclone Wind Radii Rings */}
        {activeLayers.wind && (
          <g transform={`translate(${eyePos.x}, ${eyePos.y})`}>
            {/* Hurricane Gale Wind 64kt (118 km/h) Radius */}
            <circle r="140" fill="url(#cycloneEyeGlow)" />
            <circle r="140" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle r="220" fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="6 4" strokeOpacity="0.5" />
            {/* Eye core */}
            <circle r="10" fill="#991b1b" stroke="#fca5a5" strokeWidth="2" />
            <circle r="2" fill="#ffffff" />
            <text x="14" y="4" fill="#fca5a5" fontSize="11" fontFamily="monospace" fontWeight="bold">
              SAMUDRA EYE (938 hPa)
            </text>
          </g>
        )}

        {/* Dependency Graph Edges */}
        {activeLayers.edges && (
          <g>
            {edges.map((edge) => {
              const src = assetPositions.get(edge.sourceAssetId);
              const tgt = assetPositions.get(edge.targetAssetId);
              if (!src || !tgt) return null;

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={edge.isSevered ? '#ef4444' : '#38bdf8'}
                    strokeWidth={edge.isSevered ? 2.5 : 1.5}
                    strokeDasharray={edge.isSevered ? '5 4' : 'none'}
                    strokeOpacity={edge.isSevered ? 0.9 : 0.6}
                  />
                  {edge.isSevered && (
                    <circle
                      cx={(src.x + tgt.x) / 2}
                      cy={(src.y + tgt.y) / 2}
                      r="4"
                      fill="#ef4444"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Infrastructure Asset Nodes */}
        <g>
          {assets
            .filter((a) => !selectedSector || a.sector === selectedSector)
            .map((asset) => {
              const pos = assetPositions.get(asset.assetId);
              if (!pos) return null;

              const isHighlighted = highlightAssetId === asset.assetId;
              const isSelected = selectedAsset?.assetId === asset.assetId;
              const nodeColor = getSectorColor(asset.sector, asset.status);

              return (
                <g
                  key={asset.assetId}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => handleNodeClick(asset)}
                  className="cursor-pointer group"
                >
                  {/* Outer pulse if breached or highlighted */}
                  {(asset.status === 'breached' || isHighlighted || isSelected) && (
                    <circle
                      r="16"
                      fill={nodeColor}
                      fillOpacity="0.25"
                      className="animate-ping"
                    />
                  )}

                  {/* Main Node Bubble */}
                  <circle
                    r={isSelected ? 11 : isHighlighted ? 10 : 8}
                    fill="#060e20"
                    stroke={nodeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200 group-hover:scale-125"
                  />

                  {/* Inner Dot */}
                  <circle r="3.5" fill={nodeColor} />

                  {/* Node Label Text */}
                  <text
                    x="12"
                    y="4"
                    fill={isSelected ? '#93ccff' : '#dae2fd'}
                    fontSize="10"
                    fontFamily="Inter, sans-serif"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="pointer-events-none drop-shadow-md select-none group-hover:fill-white"
                  >
                    {asset.name.split(' ')[0]} ({asset.assetId.split('-')[2]})
                  </text>
                </g>
              );
            })}
        </g>
      </svg>

      {/* Selected Asset Inspection Card Popover */}
      {selectedAsset && (
        <div className="absolute bottom-3 left-3 max-w-sm w-full z-30 bg-[#0b1326]/95 backdrop-blur-md p-3.5 rounded-xl border border-[#3198dc]/40 shadow-xl text-xs space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#6bd8cb] uppercase">
                {selectedAsset.sector} • {selectedAsset.subtype}
              </span>
              <h4 className="font-bold text-[#dae2fd] text-sm leading-tight">
                {selectedAsset.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedAsset(null)}
              className="text-[#89929b] hover:text-white p-0.5"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ProvenanceBadge
              classification={selectedAsset.classification}
              confidence={selectedAsset.confidence}
              freshness={selectedAsset.freshness}
              size="sm"
            />
            <span
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                selectedAsset.status === 'breached'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : selectedAsset.status === 'threatened'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {selectedAsset.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] border-t border-[#171f33]">
            <div>
              <span className="text-[#89929b] block text-[10px]">Elevation AMSL</span>
              <span className="font-bold text-[#dae2fd]">+{selectedAsset.elevationAmsl}m MSL</span>
            </div>
            <div>
              <span className="text-[#89929b] block text-[10px]">Population Served</span>
              <span className="font-bold text-[#dae2fd]">{selectedAsset.populationServed.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#89929b] block text-[10px]">Criticality</span>
              <span className="font-bold text-amber-300">{selectedAsset.criticality}/10</span>
            </div>
            <div>
              <span className="text-[#89929b] block text-[10px]">Wind / Surge Limit</span>
              <span className="font-bold text-red-300">
                {selectedAsset.failureThresholds.windGustKmh}km/h | +{selectedAsset.failureThresholds.inundationMeters}m
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend (Bottom Right) */}
      <div className="absolute bottom-3 right-3 hidden md:flex items-center gap-3 bg-[#0b1326]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#222a3d] text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-[#dae2fd]">Breached</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-[#dae2fd]">Threatened</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[#dae2fd]">Nominal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-red-500 border-b border-dashed border-red-400"></span>
          <span className="text-red-300">Severed Link</span>
        </div>
      </div>
    </div>
  );
};
