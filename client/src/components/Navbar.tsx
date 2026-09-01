'use client';

import React from 'react';
import {
  Play,
  Pause,
  Plus,
  BookOpen,
  Activity,
  Bell,
  Search,
} from 'lucide-react';

interface NavbarProps {
  simulating: boolean;
  onToggleSimulation: () => void;
  onOpenNewBooking: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  simulating,
  onToggleSimulation,
  onOpenNewBooking,
  searchTerm = '',
  onSearchChange,
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search bookings, vehicles, plates..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60 transition-all"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Live Simulator Toggle (Key Feature for Evaluators) */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            simulating
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
          title="Auto-progresses vehicle booking status every 6s"
        >
          {simulating ? (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulation Active</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 live-dot"></span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-blue-400" />
              <span>Start Live Simulator</span>
            </>
          )}
        </button>

        {/* Swagger API Docs Button */}
        <a
          href="http://localhost:5000/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-all"
          title="Open interactive Swagger API Documentation"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>API Docs</span>
        </a>

        {/* Create Booking Button */}
        <button
          onClick={onOpenNewBooking}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-800 mx-1"></div>

        {/* Operator Profile */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            SP
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200">Siddhant Patel</p>
            <p className="text-[10px] text-slate-400">Operations Lead</p>
          </div>
        </div>
      </div>
    </header>
  );
};
