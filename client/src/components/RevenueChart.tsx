'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface RevenueChartProps {
  data: Array<{
    date: string;
    bookings: number;
    revenue: number;
    completed: number;
  }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [metric, setMetric] = useState<'revenue' | 'bookings'>('revenue');

  // Format dates to short month/day e.g. "Aug 14"
  const formattedData = data.map((item) => {
    const d = new Date(item.date);
    return {
      ...item,
      displayDate: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
    };
  });

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-white">Operations Performance Velocity</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Past 30 Days
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {metric === 'revenue' ? (
              <span>Total Period Revenue: <strong className="text-emerald-400 font-mono">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            ) : (
              <span>Total Period Bookings: <strong className="text-blue-400 font-mono">{totalBookings} Completed Jobs</strong></span>
            )}
          </p>
        </div>

        {/* Metric Switcher Button */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              metric === 'revenue'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Revenue ($)
          </button>
          <button
            onClick={() => setMetric('bookings')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              metric === 'bookings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Volume (Bookings)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => (metric === 'revenue' ? `$${val}` : val)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090d16',
                borderColor: '#1e293b',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              formatter={(val: any) => [
                metric === 'revenue' ? `$${Number(val).toFixed(2)}` : `${val} bookings`,
                metric === 'revenue' ? 'Revenue' : 'Bookings',
              ]}
              labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
            />
            {metric === 'revenue' ? (
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            ) : (
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#bookingsGrad)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
