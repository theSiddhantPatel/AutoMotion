'use client';

import React, { useState } from 'react';
import { Booking, Mechanic, BookingStatus } from '../types/index';
import { statusBadges, priorityBadges } from './BookingTable';
import {
  X,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  DollarSign,
  History,
  AlertCircle,
} from 'lucide-react';

interface BookingDetailModalProps {
  booking: Booking | null;
  mechanics: Mechanic[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: BookingStatus, mechanicId?: string, notes?: string) => Promise<void>;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  mechanics,
  onClose,
  onUpdateStatus,
}) => {
  if (!booking) return null;

  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(booking.status);
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>(booking.mechanicId || '');
  const [notes, setNotes] = useState<string>(booking.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusInfo = statusBadges[booking.status] || statusBadges.PENDING;
  const priorityInfo = priorityBadges[booking.priority] || priorityBadges.MEDIUM;

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(
        booking.id,
        selectedStatus,
        selectedMechanicId || undefined,
        notes
      );
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">{booking.bookingNumber}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                  {statusInfo.label}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${priorityInfo.color}`}>
                  {priorityInfo.label} Priority
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Created on {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[10px]">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Customer Information</span>
              </div>
              <p className="text-sm font-bold text-slate-100">{booking.customer.name}</p>
              <div className="space-y-1 text-slate-400">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{booking.customer.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{booking.customer.email}</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{booking.customerAddress || booking.customer.address}</span>
                </p>
              </div>
            </div>

            {/* Vehicle & Service Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[10px]">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vehicle & Service</span>
              </div>
              <p className="text-sm font-bold text-slate-100">
                {booking.vehicleMake} {booking.vehicleModel} ({booking.vehicleYear})
              </p>
              <div className="space-y-1 text-slate-400">
                <p className="flex items-center gap-2 font-mono">
                  <span className="text-slate-500">Plate:</span>
                  <span className="text-slate-200 font-semibold bg-slate-800 px-1.5 py-0.5 rounded">
                    {booking.licensePlate}
                  </span>
                </p>
                <p className="text-slate-300 font-medium">{booking.service.name}</p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500">Est. Duration: {booking.service.estimatedDuration} mins</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">${booking.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch Management Controls */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-3">
            <h3 className="font-bold text-xs text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Live Operations Dispatch Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Change Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Update Service Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as BookingStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="EN_ROUTE">En Route (Mechanic on the way)</option>
                  <option value="IN_PROGRESS">In Progress (Service ongoing)</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Assign Mechanic */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Assign Mechanic
                </label>
                <select
                  value={selectedMechanicId}
                  onChange={(e) => setSelectedMechanicId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- No Mechanic Assigned --</option>
                  {mechanics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.status}) - ⭐ {m.rating}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Technician / Dispatch Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add technician inspection notes or customer requests..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Audit History Timeline */}
          {booking.logs && booking.logs.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-xs text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Audit Trail & Lifecycle History</span>
              </h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {booking.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-[11px]"
                  >
                    <span className="text-slate-300 font-medium">{log.message}</span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isUpdating ? 'Updating...' : 'Save & Broadcast Live Update'}
          </button>
        </div>
      </div>
    </div>
  );
};
