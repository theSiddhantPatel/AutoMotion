'use client';

import React from 'react';
import { Activity, Clock, CheckCircle2, Navigation, AlertCircle, Wrench } from 'lucide-react';
import { BookingStatus } from '../types/index';

interface LogItem {
  id: string;
  status: BookingStatus;
  message: string;
  createdAt: string;
  booking?: {
    bookingNumber: string;
    vehicleMake: string;
    vehicleModel: string;
    customer: { name: string };
    mechanic?: { name: string } | null;
  } | null;
}

interface LiveFeedProps {
  logs: LogItem[];
}

const statusConfig: Record<BookingStatus, { color: string; bg: string; icon: any }> = {
  PENDING: { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: Clock },
  ASSIGNED: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: Wrench },
  EN_ROUTE: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: Navigation },
  IN_PROGRESS: { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', icon: Activity },
  COMPLETED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
  CANCELLED: { color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', icon: AlertCircle },
};

export const LiveFeed: React.FC<LiveFeedProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col h-[400px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 live-dot"></div>
          <h3 className="font-bold text-sm text-white">Live Operations Feed</h3>
        </div>
        <span className="text-[11px] text-slate-400">WebSocket Broadcast</span>
      </div>

      <div className="overflow-y-auto space-y-3 pt-3 pr-1 flex-1">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Awaiting real-time dispatch events...
          </div>
        ) : (
          logs.map((log) => {
            const config = statusConfig[log.status] || statusConfig.PENDING;
            const Icon = config.icon;
            const timeAgo = new Date(log.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-3 text-xs"
              >
                <div className={`p-1.5 rounded-lg ${config.bg} border shrink-0 mt-0.5`}>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200 truncate">
                      {log.booking?.bookingNumber || 'Service Event'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{timeAgo}</span>
                  </div>

                  <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">{log.message}</p>

                  {log.booking && (
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {log.booking.vehicleMake} {log.booking.vehicleModel}
                      </span>
                      <span>•</span>
                      <span className="truncate">{log.booking.customer.name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
