import React, { useState } from 'react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge.tsx';

interface ShelterItem {
  id: string;
  name: string;
  distanceKm: number;
  capacity: number;
  occupancy: number;
  status: 'Open & Safe' | 'At Capacity' | 'Marooned Risk';
  route: string;
}

export const MobileFieldView: React.FC = () => {
  const [sosSent, setSosSent] = useState<boolean>(false);
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);
  const [triageType, setTriageType] = useState<string>('road_blockage');
  const [triageNote, setTriageNote] = useState<string>('');

  const shelters: ShelterItem[] = [
    {
      id: 'SH-01',
      name: 'Dhamra Port Town Community Cyclone Shelter',
      distanceKm: 2.1,
      capacity: 3000,
      occupancy: 2850,
      status: 'At Capacity',
      route: 'Route R-16 submerged; use inner levee track',
    },
    {
      id: 'SH-04',
      name: 'Bhadrak North Ward Cyclone Shelter',
      distanceKm: 6.4,
      capacity: 2800,
      occupancy: 2400,
      status: 'Open & Safe',
      route: 'Inland SH-09 100% clear',
    },
    {
      id: 'SH-08',
      name: 'Basudevpur Creek Estuary Shelter',
      distanceKm: 8.9,
      capacity: 2000,
      occupancy: 1840,
      status: 'Marooned Risk',
      route: 'Bridge B-12 overtopped (+0.4m)',
    },
    {
      id: 'SH-12',
      name: 'Inland High-Ground Super Shelter Complex',
      distanceKm: 14.2,
      capacity: 4500,
      occupancy: 1200,
      status: 'Open & Safe',
      route: 'Highway SH-09 Bypass (Priority Destination)',
    },
  ];

  const handleSos = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 5000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setTriageNote('');
    }, 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Mobile Top Header Banner */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006398] to-[#93ccff] flex items-center justify-center text-[#001d31]">
            <span className="material-symbols-outlined text-2xl font-bold">smartphone</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-[#dae2fd] leading-tight">
              Field Responder Terminal
            </h1>
            <span className="text-[11px] font-mono text-[#6bd8cb] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              OFFLINE SYNC CACHE READY
            </span>
          </div>
        </div>

        <ProvenanceBadge classification="observed" freshness="Instant" size="sm" />
      </div>

      {/* Emergency Distress Beacon Button */}
      <div className="bg-[#131b2e] border border-red-500/40 p-4 rounded-2xl space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-red-400 font-bold uppercase flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">crisis_alert</span>
            Tactical Emergency Distress
          </span>
          <span className="text-[#89929b]">GPS: 20.801°N, 86.958°E</span>
        </div>

        <button
          onClick={handleSos}
          className={`w-full py-4 rounded-xl text-base font-bold font-mono transition-all flex items-center justify-center gap-3 shadow-lg active:scale-98 ${
            sosSent
              ? 'bg-emerald-600 text-white animate-pulse'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {sosSent ? 'check_circle' : 'emergency_share'}
          </span>
          {sosSent ? 'SOS BEACON TRANSMITTED TO EOC' : 'TRANSMIT RESCUE SOS / REPORT INJURY'}
        </button>
        <span className="text-[10px] text-[#89929b] text-center block font-mono">
          Broadcasts immediately via APRS packet radio and SATCOM link.
        </span>
      </div>

      {/* Quick Field Triage Report Form */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-4 sm:p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#171f33] pb-2">
          <h3 className="font-bold text-sm text-[#dae2fd] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#3198dc] text-base">edit_note</span>
            Submit Ground Triage Update
          </h3>
          <span className="text-[10px] font-mono text-[#89929b]">Direct to Incident Commander</span>
        </div>

        {reportSubmitted ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center space-y-1">
            <span className="material-symbols-outlined text-emerald-400 text-2xl">check_circle</span>
            <h4 className="font-bold text-sm text-emerald-200">Triage Report Ingested</h4>
            <p className="text-xs text-emerald-300/80 font-mono">
              Appended to WORM Audit Ledger with GPS stamp.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-[#89929b] block font-mono text-[11px] mb-1">
                Incident Category:
              </label>
              <select
                value={triageType}
                onChange={(e) => setTriageType(e.target.value)}
                className="w-full bg-[#060e20] text-[#93ccff] font-mono p-2.5 rounded-lg border border-[#222a3d] focus:outline-none"
              >
                <option value="road_blockage">Road Blockage / Culvert Submersion</option>
                <option value="power_pylon">Downed High-Voltage Power Line</option>
                <option value="shelter_capacity">Cyclone Shelter Exceeded Capacity</option>
                <option value="hospital_fuel">Hospital Fuel / Oxygen Shortage</option>
              </select>
            </div>

            <div>
              <label className="text-[#89929b] block font-mono text-[11px] mb-1">
                Field Observation Details:
              </label>
              <textarea
                rows={2}
                required
                value={triageNote}
                onChange={(e) => setTriageNote(e.target.value)}
                placeholder="E.g. Route R-16 mile marker 14 overtopped with 40cm saltwater. Evacuee bus stranded."
                className="w-full bg-[#060e20] text-[#dae2fd] p-2.5 rounded-lg border border-[#222a3d] focus:outline-none font-['Inter']"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#3198dc] hover:bg-[#93ccff] text-[#001d31] font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">send</span>
              Submit Ground Report
            </button>
          </form>
        )}
      </div>

      {/* Offline Shelter Directory */}
      <div className="bg-[#131b2e] border border-[#222a3d] p-4 sm:p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#171f33] pb-2">
          <h3 className="font-bold text-sm text-[#dae2fd] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-purple-400 text-base">night_shelter</span>
            Local Cyclone Shelters Roster
          </h3>
          <span className="text-[10px] font-mono text-emerald-400">Offline Cached</span>
        </div>

        <div className="space-y-2.5">
          {shelters.map((sh) => (
            <div
              key={sh.id}
              className="bg-[#060e20] border border-[#222a3d] p-3 rounded-xl space-y-1.5 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#93ccff]">
                      {sh.id}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-[#89929b] text-[11px] font-mono">
                      {sh.distanceKm} km away
                    </span>
                  </div>
                  <h4 className="font-bold text-[#dae2fd] text-xs mt-0.5">
                    {sh.name}
                  </h4>
                </div>

                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                    sh.status === 'Open & Safe'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : sh.status === 'At Capacity'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-red-950 text-red-300 border border-red-500/40'
                  }`}
                >
                  {sh.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#171f33] font-mono text-[11px]">
                <span className="text-[#89929b]">
                  Occupancy: <strong className="text-white">{sh.occupancy}</strong> / {sh.capacity}
                </span>
                <span className="text-[#bfc7d2] text-[10px] truncate max-w-[200px]">
                  {sh.route}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Helpline Toll-Free Dial Button */}
      <div className="bg-[#060e20] border border-[#222a3d] p-4 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-[#89929b] block">District EOC Hotline</span>
          <span className="text-xl font-bold font-mono text-[#6bd8cb]">1077 (Toll Free)</span>
        </div>
        <a
          href="tel:1077"
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">call</span>
          Direct Call
        </a>
      </div>
    </div>
  );
};
