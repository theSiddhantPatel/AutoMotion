'use client';

import React from 'react';
import {
  Play,
  Pause,
  Plus,
  BookOpen,
  Search,
  Menu,
  Radio,
} from 'lucide-react';

interface NavbarProps {
  simulating: boolean;
  onToggleSimulation: () => void;
  onOpenNewBooking: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  simulating,
  onToggleSimulation,
  onOpenNewBooking,
  searchTerm = '',
  onSearchChange,
  onOpenMobileMenu,
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 gap-2 sm:gap-4">
      {/* Left: Mobile Hamburger & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Responsive Search Input */}
        <div className="relative w-full max-w-[170px] sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60 transition-all"
          />
        </div>
      </div>

      {/* Right: Responsive Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Live Simulator Toggle */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold border transition-all ${
            simulating
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
          title="Auto-progresses vehicle booking status every 6s"
        >
          {simulating ? (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Simulation Active</span>
              <span className="sm:hidden text-[11px]">Active</span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 live-dot"></span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Start Live Simulator</span>
              <span className="sm:hidden text-[11px]">Simulate</span>
            </>
          )}
        </button>

        {/* Customer Portal Shortcut */}
        <a
          href="/track"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-all"
          title="Open live customer tracking portal"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>Customer View</span>
        </a>

        {/* Swagger API Docs Button */}
        <a
          href="http://localhost:5000/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-all"
          title="Open interactive Swagger API Documentation"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>API Docs</span>
        </a>

        {/* Create Booking Button */}
        <button
          onClick={onOpenNewBooking}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">New Booking</span>
          <span className="sm:hidden text-[11px]">New</span>
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-800 mx-1"></div>

        {/* Operator Profile Icon */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-slate-700 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-sm shrink-0">
            SP
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">Siddhant Patel</p>
            <p className="text-[10px] text-slate-400">Operations Lead</p>
          </div>
        </div>
      </div>
    </header>
  );
};
