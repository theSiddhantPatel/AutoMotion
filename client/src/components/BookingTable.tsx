'use client';

import React from 'react';
import {
  Booking,
  BookingStatus,
  PriorityLevel,
} from '../types/index';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Car,
  User,
  Wrench,
  Clock,
  CheckCircle2,
  Navigation,
  Activity,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface BookingTableProps {
  bookings: Booking[];
  totalBookings: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onSelectBooking: (booking: Booking) => void;
  isLoading?: boolean;
}

export const statusBadges: Record<
  BookingStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: Clock,
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: Wrench,
  },
  EN_ROUTE: {
    label: 'En Route',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: Navigation,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    icon: Activity,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    icon: AlertCircle,
  },
};

export const priorityBadges: Record<
  PriorityLevel,
  { label: string; color: string }
> = {
  LOW: { label: 'Low', color: 'text-slate-400 bg-slate-800' },
  MEDIUM: { label: 'Medium', color: 'text-blue-400 bg-blue-500/10' },
  HIGH: { label: 'High', color: 'text-amber-400 bg-amber-500/10' },
  EMERGENCY: { label: 'Emergency', color: 'text-rose-400 bg-rose-500/20 font-bold' },
};

export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  totalBookings,
  currentPage,
  totalPages,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  search,
  onSearchChange,
  onSelectBooking,
  isLoading = false,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xs transition-colors">
      {/* Header & Filter Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Operations Bookings Roster
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
              {totalBookings} Total
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live vehicle dispatch queue and telemetry</p>
        </div>

        {/* Filter & Search controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Table Search Input */}
          <div className="relative flex-1 sm:w-60 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, plate, customer..."
              value={search || ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            {search && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer p-0.5"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="md:hidden px-4 py-1.5 bg-slate-950/60 border-b border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
        <span>← Swipe horizontally to view full booking details →</span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800/80">
            <tr>
              <th className="py-3.5 px-4">Booking ID</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Vehicle</th>
              <th className="py-3.5 px-4">Service</th>
              <th className="py-3.5 px-4">Mechanic</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4">Scheduled</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                    Loading live bookings...
                  </div>
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-400">
                  No bookings found matching your search or filters.
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const statusInfo = statusBadges[b.status] || statusBadges.PENDING;
                const StatusIcon = statusInfo.icon;
                const priorityInfo = priorityBadges[b.priority] || priorityBadges.MEDIUM;

                return (
                  <tr
                    key={b.id}
                    onClick={() => onSelectBooking(b)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    {/* Booking ID & Priority */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span>{b.bookingNumber}</span>
                        {b.priority === 'EMERGENCY' && (
                          <span className="px-1 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                            EMERGENCY
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                          {b.customer.avatar ? (
                            <img src={b.customer.avatar} alt={b.customer.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 m-1.5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{b.customer.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{b.customer.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                          {b.vehicleYear} {b.vehicleMake} {b.vehicleModel}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{b.licensePlate}</p>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{b.service.name}</p>
                        <span className="text-[10px] text-slate-500">
                          {b.service.category} • ~{b.service.estimatedDuration}m
                        </span>
                      </div>
                    </td>

                    {/* Mechanic */}
                    <td className="py-3 px-4">
                      {b.mechanic ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                            <img
                              src={b.mechanic.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.mechanic.name}`}
                              alt={b.mechanic.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{b.mechanic.name}</p>
                            <p className="text-[10px] text-amber-500 font-bold">★ {b.mechanic.rating.toFixed(1)}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      ${b.amount.toFixed(2)}
                    </td>

                    {/* Scheduled Date */}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(b.scheduledAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Action View */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBooking(b);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-all cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing page <span className="font-bold text-white">{currentPage}</span> of{' '}
          <span className="font-bold text-white">{totalPages || 1}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-700 hover:text-white transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="px-2 font-mono text-slate-300 font-semibold">{currentPage}</span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-700 hover:text-white transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
