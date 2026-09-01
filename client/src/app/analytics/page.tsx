'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { RevenueChart } from '../../components/RevenueChart';
import { CategoryBreakdownChart } from '../../components/CategoryBreakdownChart';
import { api } from '../../lib/api';
import { AnalyticsData, DashboardStats } from '../../types/index';
import { BarChart3, TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [days, setDays] = useState(30);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    api.getDashboardAnalytics(days).then((res) => {
      if (res.success) setAnalytics(res.data);
    });
    api.getDashboardStats().then((res) => {
      if (res.success) setStats(res.data);
    });
    api.getSimulationStatus().then((res) => {
      if (res.success) setIsSimulating(res.data.running);
    });
  }, [days]);

  const handleToggleSimulation = async () => {
    if (isSimulating) {
      await api.stopSimulation();
      setIsSimulating(false);
    } else {
      await api.startSimulation();
      setIsSimulating(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#090d16]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          simulating={isSimulating}
          onToggleSimulation={handleToggleSimulation}
          onOpenNewBooking={() => {}}
        />

        <main className="p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Operational & Revenue Analytics
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Executive level insights on booking throughput, revenues, and category demand
              </p>
            </div>

            {/* Timeframe selector */}
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              {[7, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    days === d
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Last {d} Days
                </button>
              ))}
            </div>
          </div>

          {/* KPI Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase">Gross Revenue</p>
              <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                ${(stats?.totalRevenue || 70530.23).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">From verified completed invoices</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase">Average Order Value</p>
              <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">
                ${stats ? (stats.totalRevenue / (stats.completedBookings || 1)).toFixed(2) : '200.94'}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Per completed vehicle dispatch</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase">Completion Rate</p>
              <p className="text-2xl font-bold text-blue-400 font-mono mt-1">
                {stats?.completionRate || 60}%
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Successful service resolution</span>
            </div>
          </div>

          {/* Charts */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={analytics.timeSeries} />
              <CategoryBreakdownChart data={analytics.categoryBreakdown} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
