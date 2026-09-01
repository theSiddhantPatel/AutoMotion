'use client';

import React, { useEffect, useState } from 'react';
import { Mechanic } from '../types/index';
import { MapPin, Navigation, Star, Phone, Wrench } from 'lucide-react';

interface MechanicsMapViewProps {
  mechanics: Mechanic[];
}

export const MechanicsMapView: React.FC<MechanicsMapViewProps> = ({ mechanics }) => {
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);

  // Mechanics with valid coordinates
  const mappedMechanics = mechanics.filter((m) => m.location?.lat && m.location?.lng);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md relative flex flex-col h-[520px]">
      {/* Map Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 live-dot"></div>
          <h3 className="font-bold text-sm text-white">Metro Operations Live GPS Radar</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Available
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> On Job
          </span>
          <span className="font-mono text-slate-400">
            {mappedMechanics.length} Units Stationed
          </span>
        </div>
      </div>

      {/* Visual Simulation Radar Grid */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center">
        {/* Radar concentric rings background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[500px] h-[500px] rounded-full border border-cyan-500/30 animate-pulse"></div>
          <div className="w-[350px] h-[350px] rounded-full border border-cyan-500/40 absolute"></div>
          <div className="w-[200px] h-[200px] rounded-full border border-cyan-500/50 absolute"></div>
          <div className="w-[80px] h-[80px] rounded-full border border-cyan-500/60 absolute"></div>
          {/* Crosshairs */}
          <div className="w-full h-px bg-cyan-500/20 absolute"></div>
          <div className="h-full w-px bg-cyan-500/20 absolute"></div>
        </div>

        {/* Metro Grid Background Representation */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

        {/* Central Operations Hub Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-blue-500/30 border border-blue-400 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
          </div>
          <span className="text-[10px] font-mono text-blue-400 bg-slate-900/90 px-1.5 py-0.5 rounded mt-1 border border-blue-500/30">
            AutoMotion Central HQ
          </span>
        </div>

        {/* Render Mechanic Geolocation Pins */}
        {mappedMechanics.map((m, idx) => {
          // Normalize lat/lng around center for visualization
          const latDiff = (m.location!.lat - 37.7749) * 1200;
          const lngDiff = (m.location!.lng - (-122.4194)) * 1200;
          const topPercent = Math.min(Math.max(50 - latDiff, 10), 90);
          const leftPercent = Math.min(Math.max(50 + lngDiff, 10), 90);

          const isBusy = m.status === 'BUSY';
          const isSelected = selectedMechanic?.id === m.id;

          return (
            <div
              key={m.id}
              onClick={() => setSelectedMechanic(m)}
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform hover:scale-125 z-20"
            >
              <div
                className={`p-1.5 rounded-full border shadow-lg flex items-center justify-center transition-all ${
                  isBusy
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/20'
                    : 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-500/20'
                } ${isSelected ? 'ring-2 ring-white scale-125' : ''}`}
              >
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded bg-slate-900 text-[10px] text-white whitespace-nowrap border border-slate-700 shadow-md pointer-events-none">
                {m.name} ({m.status})
              </span>
            </div>
          );
        })}

        {/* Selected Mechanic Detail Card Popup */}
        {selectedMechanic && (
          <div className="absolute bottom-4 right-4 max-w-xs bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md z-30 animate-in fade-in slide-in-from-bottom-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-white text-sm">{selectedMechanic.name}</h4>
                <p className="text-[11px] text-slate-400">{selectedMechanic.specialization}</p>
              </div>
              <button
                onClick={() => setSelectedMechanic(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                    selectedMechanic.status === 'BUSY'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {selectedMechanic.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Rating:</span>
                <span className="font-bold text-amber-400">⭐ {selectedMechanic.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Completed Jobs:</span>
                <span className="font-bold text-white">{selectedMechanic.completedJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-300">{selectedMechanic.phone}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
