'use client';

import React from 'react';
import { Mechanic, MechanicStatus } from '../types/index';
import { Wrench, Star, Phone, Mail, CheckCircle2, Clock, Car, MapPin } from 'lucide-react';

interface MechanicsGridProps {
  mechanics: Mechanic[];
  onUpdateStatus?: (id: string, status: MechanicStatus) => void;
}

const statusStyles: Record<MechanicStatus, { label: string; color: string; dot: string }> = {
  AVAILABLE: {
    label: 'Available',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  BUSY: {
    label: 'On Job',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400 live-dot',
  },
  OFF_DUTY: {
    label: 'Off Duty',
    color: 'bg-slate-800 text-slate-400 border-slate-700',
    dot: 'bg-slate-500',
  },
};

export const MechanicsGrid: React.FC<MechanicsGridProps> = ({ mechanics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mechanics.map((m) => {
        const statusConfig = statusStyles[m.status] || statusStyles.AVAILABLE;

        return (
          <div
            key={m.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all backdrop-blur-md flex flex-col justify-between"
          >
            {/* Top Bar */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                    <img
                      src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{m.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{m.specialization}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                  {statusConfig.label}
                </span>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white">{m.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500">Rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-white">{m.completedJobs}</span>
                  <span className="text-[10px] text-slate-500">Jobs Done</span>
                </div>
              </div>

              {/* Current Active Assignment */}
              <div className="mt-3">
                {m.currentJob ? (
                  <div className="p-2.5 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs space-y-1">
                    <p className="text-[10px] font-semibold text-blue-400 flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      Active Dispatch #{m.currentJob.bookingNumber}
                    </p>
                    <p className="text-slate-200 font-medium text-[11px] truncate">
                      {m.currentJob.vehicleMake} {m.currentJob.vehicleModel} • {m.currentJob.service.name}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic py-1">
                    No active job in queue. Ready for dispatch.
                  </p>
                )}
              </div>
            </div>

            {/* Contact Footer */}
            <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-slate-500" />
                {m.phone}
              </span>
              {m.location && (
                <span className="flex items-center gap-1 text-[10px] text-cyan-400">
                  <MapPin className="w-3 h-3" />
                  GPS Active
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
