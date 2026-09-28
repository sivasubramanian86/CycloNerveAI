import React, { useState } from 'react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge.tsx';
import { ACTIVE_SCENARIO_META } from '../../data/coastalScenarioData.ts';

export const CycloneIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'track' | 'surge' | 'radar'>('track');

  // Track waypoints data (Forecast & Past)
  const trackWaypoints = [
    {
      time: '03 Oct 12:00 UTC',
      lat: 18.2,
      lng: 88.4,
      pressure: 968,
      windKmh: 140,
      gustsKmh: 165,
      classification: 'Very Severe Cyclonic Storm',
      provenance: 'OBS' as const,
    },
    {
      time: '03 Oct 18:00 UTC',
      lat: 19.1,
      lng: 87.8,
      pressure: 952,
      windKmh: 170,
      gustsKmh: 200,
      classification: 'Extremely Severe Cyclonic Storm',
      provenance: 'OBS' as const,
    },
    {
      time: '04 Oct 03:00 UTC (Current)',
      lat: 20.1,
      lng: 87.2,
      pressure: 938,
      windKmh: 195,
      gustsKmh: 230,
      classification: 'Category 4 Super Cyclone',
      provenance: 'OBS' as const,
      isCurrent: true,
    },
    {
      time: '04 Oct 09:00 UTC (T-8h)',
      lat: 20.5,
      lng: 87.05,
      pressure: 935,
      windKmh: 205,
      gustsKmh: 240,
      classification: 'Category 4 Super Cyclone',
      provenance: 'FCST' as const,
    },
    {
      time: '04 Oct 17:00 UTC (Landfall)',
      lat: 20.798,
      lng: 86.963,
      pressure: 940,
      windKmh: 195,
      gustsKmh: 230,
      classification: 'Landfall (Dhamra Estuary)',
      provenance: 'FCST' as const,
    },
    {
      time: '05 Oct 00:00 UTC (T+7h)',
      lat: 21.3,
      lng: 86.5,
      pressure: 975,
      windKmh: 120,
      gustsKmh: 145,
      classification: 'Inland Weakening',
      provenance: 'FCST' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131b2e] border border-[#222a3d] p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold border border-blue-500/30">
              METEOROLOGICAL INGESTION AGENT
            </span>
            <ProvenanceBadge
              classification="observed"
              confidence={0.985}
              freshness="1m ago"
              source="IMD Paradip Doppler + INSAT-3DR Rapid Scan"
              size="sm"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Public_Sans'] text-[#dae2fd]">
            Cyclone SAMUDRA — Storm Dynamics &amp; Track Cone
          </h1>
          <p className="text-xs text-[#bfc7d2] font-['Inter'] mt-0.5">
            Real-time track assimilation, barometric minimum telemetry, and coastal inundation inversion.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 bg-[#060e20] p-1 rounded-xl border border-[#222a3d] text-xs font-mono">
          <button
            onClick={() => setActiveTab('track')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeTab === 'track'
                ? 'bg-[#3198dc] text-[#001d31]'
                : 'text-[#89929b] hover:text-[#dae2fd]'
            }`}
          >
            Track Trajectory
          </button>
          <button
            onClick={() => setActiveTab('surge')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeTab === 'surge'
                ? 'bg-[#3198dc] text-[#001d31]'
                : 'text-[#89929b] hover:text-[#dae2fd]'
            }`}
          >
            Storm Surge Profile
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              activeTab === 'radar'
                ? 'bg-[#3198dc] text-[#001d31]'
                : 'text-[#89929b] hover:text-[#dae2fd]'
            }`}
          >
            Radar &amp; SAR
          </button>
        </div>
      </div>

      {/* Main Meteorological Vital Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl">
          <span className="text-[11px] font-mono text-[#89929b] block uppercase">
            Central Pressure
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono text-[#6bd8cb]">938</span>
            <span className="text-xs text-[#89929b] font-mono">hPa (mbar)</span>
          </div>
          <span className="text-[10px] text-red-400 font-mono mt-1 block">
            ▼ Rapid intensification -14 hPa / 6h
          </span>
        </div>

        <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl">
          <span className="text-[11px] font-mono text-[#89929b] block uppercase">
            Sustained Wind Speed
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono text-amber-400">195</span>
            <span className="text-xs text-[#89929b] font-mono">km/h (105 kt)</span>
          </div>
          <span className="text-[10px] text-amber-300 font-mono mt-1 block">
            Cat 4 Super Cyclone threshold
          </span>
        </div>

        <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl">
          <span className="text-[11px] font-mono text-[#89929b] block uppercase">
            Peak Gusts
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono text-red-400">230</span>
            <span className="text-xs text-[#89929b] font-mono">km/h (124 kt)</span>
          </div>
          <span className="text-[10px] text-[#bfc7d2] font-mono mt-1 block">
            Sufficient to snap 132kV pylons
          </span>
        </div>

        <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl">
          <span className="text-[11px] font-mono text-[#89929b] block uppercase">
            Max Storm Surge Height
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono text-cyan-400">+3.6m</span>
            <span className="text-xs text-[#89929b] font-mono">above MSL</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono mt-1 block">
            Overtops Dhamra flood dykes (2.5m)
          </span>
        </div>
      </div>

      {/* Tab 1: Track Trajectory Waypoints & Cone Visualization */}
      {activeTab === 'track' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Waypoints Table */}
          <div className="lg:col-span-2 bg-[#131b2e] border border-[#222a3d] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#171f33] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#dae2fd]">
                Assimilated Track Waypoints (IBTrACS &amp; IMD Bulletins)
              </h3>
              <ProvenanceBadge classification="observed" confidence={0.99} size="sm" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#060e20] text-[#89929b] uppercase text-[10px] border-b border-[#171f33]">
                  <tr>
                    <th className="p-3">Time (UTC)</th>
                    <th className="p-3">Lat / Lng</th>
                    <th className="p-3">Pressure</th>
                    <th className="p-3">Winds / Gusts</th>
                    <th className="p-3">Intensity Band</th>
                    <th className="p-3">Data Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171f33]">
                  {trackWaypoints.map((pt, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-[#1c2438] transition-colors ${
                        pt.isCurrent ? 'bg-red-500/10 font-bold' : ''
                      }`}
                    >
                      <td className="p-3 text-[#dae2fd] whitespace-nowrap">
                        {pt.time}
                        {pt.isCurrent && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-red-500/30 text-red-300 text-[9px]">
                            NOW
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[#bfc7d2]">
                        {pt.lat.toFixed(2)}°N, {pt.lng.toFixed(2)}°E
                      </td>
                      <td className="p-3 text-[#6bd8cb]">{pt.pressure} hPa</td>
                      <td className="p-3 text-amber-300">
                        {pt.windKmh} / {pt.gustsKmh} km/h
                      </td>
                      <td className="p-3 text-[#dae2fd]">{pt.classification}</td>
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            pt.provenance === 'OBS'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          [{pt.provenance}]
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Forecast Uncertainty Envelope Card */}
          <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-xl space-y-4">
            <h3 className="font-bold text-sm text-[#dae2fd] border-b border-[#171f33] pb-2">
              Track Cone Uncertainty Metrics
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#89929b] block text-[11px]">Landfall Centerline Target</span>
                <span className="font-mono text-sm text-white font-bold">
                  Dhamra Port (20.798°N, 86.963°E)
                </span>
              </div>

              <div>
                <span className="text-[#89929b] block text-[11px]">Cross-Track Error Margin</span>
                <span className="font-mono text-sm text-[#6bd8cb] font-bold">
                  ± 18.4 km (High Confidence)
                </span>
              </div>

              <div>
                <span className="text-[#89929b] block text-[11px]">Forward Translation Speed</span>
                <span className="font-mono text-sm text-white font-bold">
                  16.5 km/h (North-Northwest)
                </span>
              </div>

              <div>
                <span className="text-[#89929b] block text-[11px]">Estimated Landfall Window</span>
                <span className="font-mono text-sm text-red-400 font-bold">
                  21:45 IST – 23:15 IST (04 Oct)
                </span>
              </div>

              <div className="pt-2 border-t border-[#171f33]">
                <span className="text-[11px] font-semibold text-[#89929b] block mb-1">
                  Ensemble Agreement:
                </span>
                <div className="w-full bg-[#060e20] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[94%]"></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#89929b] mt-1">
                  <span>ECMWF + GFS + IMD-GEFS</span>
                  <span className="text-emerald-300 font-bold">94% Coherence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Storm Surge & Flood Proxy */}
      {activeTab === 'surge' && (
        <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#171f33] pb-3">
            <div>
              <h3 className="font-bold text-base text-[#dae2fd]">
                Coastal Inundation &amp; Estuarine Backflow Modeling
              </h3>
              <p className="text-xs text-[#bfc7d2]">
                Coupled hydro-dynamic simulation showing surge height vs protective coastal dykes.
              </p>
            </div>
            <ProvenanceBadge classification="derived" confidence={0.94} size="sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#060e20] p-4 rounded-xl border border-red-500/30">
              <span className="text-red-400 font-bold block text-sm">
                Dhamra Estuary Dyke (Overtopped)
              </span>
              <div className="mt-2 space-y-1 text-[#dae2fd]">
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Embankment Height:</span>
                  <span>+2.7m MSL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Peak Water Level:</span>
                  <span className="text-red-400 font-bold">+3.6m MSL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Surge Freeboard:</span>
                  <span className="text-red-400 font-bold">-0.9m BREACH</span>
                </div>
              </div>
            </div>

            <div className="bg-[#060e20] p-4 rounded-xl border border-amber-500/30">
              <span className="text-amber-400 font-bold block text-sm">
                Basudevpur Creek Bund (Near Overtopping)
              </span>
              <div className="mt-2 space-y-1 text-[#dae2fd]">
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Embankment Height:</span>
                  <span>+3.2m MSL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Peak Water Level:</span>
                  <span className="text-amber-400 font-bold">+3.0m MSL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Surge Freeboard:</span>
                  <span className="text-amber-300 font-bold">+0.2m CRITICAL</span>
                </div>
              </div>
            </div>

            <div className="bg-[#060e20] p-4 rounded-xl border border-emerald-500/30">
              <span className="text-emerald-400 font-bold block text-sm">
                Inland Highway SH-09 (Dry Elevated Corridor)
              </span>
              <div className="mt-2 space-y-1 text-[#dae2fd]">
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Pavement Height:</span>
                  <span>+5.2m MSL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Peak Water Level:</span>
                  <span className="text-emerald-400">+1.8m MSL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#89929b]">Surge Freeboard:</span>
                  <span className="text-emerald-300 font-bold">+3.4m SAFE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Radar & SAR Processing */}
      {activeTab === 'radar' && (
        <div className="bg-[#131b2e] border border-[#222a3d] p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#171f33] pb-3">
            <div>
              <h3 className="font-bold text-base text-[#dae2fd]">
                Multi-Sensor Remote Sensing Ingestion
              </h3>
              <p className="text-xs text-[#bfc7d2]">
                Sentinel-1 SAR synthetic aperture radar combined with Paradip Doppler radar reflectivity.
              </p>
            </div>
            <ProvenanceBadge classification="observed" confidence={0.98} size="sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#060e20] p-4 rounded-lg border border-[#171f33] space-y-2">
              <span className="text-[#93ccff] font-bold block">
                Doppler Radar Paradip (C-Band)
              </span>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Max Reflectivity:</span>
                <span className="text-red-400 font-bold">54 dBZ (Intense Eyewall)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Radial Velocity:</span>
                <span className="text-white">61 m/s (Inbound)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Scan Elevation:</span>
                <span className="text-white">0.5° &amp; 1.5° (Dual-Pol)</span>
              </div>
            </div>

            <div className="bg-[#060e20] p-4 rounded-lg border border-[#171f33] space-y-2">
              <span className="text-[#6bd8cb] font-bold block">
                Copernicus Sentinel-1 (C-SAR GRD)
              </span>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Polarization:</span>
                <span className="text-white">VV + VH Co-polarized</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Coherence Threshold:</span>
                <span className="text-white">&lt; 0.28 (Standing Water)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89929b]">Inundation Extent:</span>
                <span className="text-cyan-400 font-bold">48.2 km² estuarine water</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
