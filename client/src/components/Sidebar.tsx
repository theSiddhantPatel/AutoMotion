'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck2,
  Wrench,
  BarChart3,
  Users,
  Radio,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  wsConnected?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ wsConnected = true }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Live Operations', href: '/', icon: LayoutDashboard, badge: 'Live' },
    { label: 'Bookings Hub', href: '/bookings', icon: CalendarCheck2 },
    { label: 'Mechanics Fleet', href: '/mechanics', icon: Wrench },
    { label: 'Customers', href: '/customers', icon: Users },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Wrench className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              AutoMotion
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400">Live Service Dispatch</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot"></span>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Real-Time WebSocket Status */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className={`w-4 h-4 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
            <div>
              <p className="text-xs font-semibold text-white">
                {wsConnected ? 'WebSocket Live' : 'Disconnected'}
              </p>
              <p className="text-[10px] text-slate-400">Port 5000 telemetry</p>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 live-dot' : 'bg-rose-400'}`}></span>
        </div>

        <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Instant Dispatch v1.0</span>
        </div>
      </div>
    </aside>
  );
};
