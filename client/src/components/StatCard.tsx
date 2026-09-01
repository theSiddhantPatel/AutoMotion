'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'rose';
  trend?: string;
  trendPositive?: boolean;
}

const colorMap = {
  blue: {
    bg: 'from-blue-600/20 to-blue-900/10',
    border: 'border-blue-500/30',
    iconBg: 'bg-blue-500/15 text-blue-400',
    glow: 'rgba(59, 130, 246, 0.15)',
  },
  emerald: {
    bg: 'from-emerald-600/20 to-emerald-900/10',
    border: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  amber: {
    bg: 'from-amber-600/20 to-amber-900/10',
    border: 'border-amber-500/30',
    iconBg: 'bg-amber-500/15 text-amber-400',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  purple: {
    bg: 'from-purple-600/20 to-purple-900/10',
    border: 'border-purple-500/30',
    iconBg: 'bg-purple-500/15 text-purple-400',
    glow: 'rgba(168, 85, 247, 0.15)',
  },
  cyan: {
    bg: 'from-cyan-600/20 to-cyan-900/10',
    border: 'border-cyan-500/30',
    iconBg: 'bg-cyan-500/15 text-cyan-400',
    glow: 'rgba(6, 182, 212, 0.15)',
  },
  rose: {
    bg: 'from-rose-600/20 to-rose-900/10',
    border: 'border-rose-500/30',
    iconBg: 'bg-rose-500/15 text-rose-400',
    glow: 'rgba(244, 63, 94, 0.15)',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  trendPositive = true,
}) => {
  const styles = colorMap[color];

  return (
    <div
      className={`p-5 rounded-2xl bg-gradient-to-br ${styles.bg} border ${styles.border} backdrop-blur-sm relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg`}
    >
      {/* Background soft glow accent */}
      <div
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: styles.glow }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${styles.iconBg} border border-white/5`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                trendPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
