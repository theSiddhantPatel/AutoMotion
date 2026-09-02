'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { Booking, BookingStatus, Customer, ServiceItem, Mechanic } from '../../types/index';
import {
  Car,
  Wrench,
  Clock,
  CheckCircle2,
  Navigation,
  Phone,
  Mail,
  MapPin,
  Search,
  ArrowLeft,
  Calendar,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Plus,
  Radio,
} from 'lucide-react';
import { NewBookingModal } from '../../components/NewBookingModal';

// 5-step customer progress timeline
const LIFECYCLE_STEPS: { status: BookingStatus; label: string; desc: string; icon: any }[] = [
  { status: 'PENDING', label: 'Booking Confirmed', desc: 'Order received in dispatch queue', icon: Clock },
  { status: 'ASSIGNED', label: 'Technician Assigned', desc: 'Certified mechanic matched to job', icon: Wrench },
  { status: 'EN_ROUTE', label: 'Mechanic En Route', desc: 'Mobile service unit is heading to your vehicle', icon: Navigation },
  { status: 'IN_PROGRESS', label: 'Service In Progress', desc: 'Technician is actively working on site', icon: Car },
  { status: 'COMPLETED', label: 'Ready & Inspected', desc: 'Work finished, multi-point inspection signed off', icon: CheckCircle2 },
];

const STATUS_INDEX_MAP: Record<BookingStatus, number> = {
  PENDING: 0,
  ASSIGNED: 1,
  EN_ROUTE: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
  CANCELLED: -1,
};

export default function CustomerTrackPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Load sample active bookings for easy demo picking
  useEffect(() => {
    setIsLoading(true);
    api.getBookings({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' }).then((res) => {
      setIsLoading(false);
      if (res.success && res.data && res.data.length > 0) {
        setActiveBookings(res.data);
        // Default to the first active or recent booking
        setBooking(res.data[0]);
        setSearchQuery(res.data[0].bookingNumber);
      }
    });

    api.getCustomers(undefined, 1, 50).then((res) => {
      if (res.success) setCustomers(res.data);
    });
    api.getServices().then((res) => {
      if (res.success) setServices(res.data);
    });
    api.getMechanics().then((res) => {
      if (res.success) setMechanics(res.data);
    });
  }, []);

  // Listen for real-time WebSocket updates for this specific booking
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setWsConnected(true);
    const handleDisconnect = () => setWsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    setWsConnected(socket.connected);

    socket.on('booking:updated', ({ booking: updatedBooking }) => {
      // If the currently viewed booking was updated by dispatch, update it live!
      setBooking((curr) => {
        if (curr && curr.id === updatedBooking.id) {
          return { ...curr, ...updatedBooking };
        }
        return curr;
      });

      // Also update sample list
      setActiveBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b))
      );
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('booking:updated');
    };
  }, []);

  // Search booking by ID
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.getBookings({ search: searchQuery.trim(), limit: 1 });
      if (res.success && res.data && res.data.length > 0) {
        setBooking(res.data[0]);
      } else {
        setErrorMsg(`No booking found with ID "${searchQuery}". Please check your booking code.`);
      }
    } catch (err) {
      setErrorMsg('Failed looking up booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = booking ? STATUS_INDEX_MAP[booking.status] : 0;
  const isCancelled = booking?.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col">
      {/* Top Customer Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Operations Hub</span>
            <span className="sm:hidden">Ops Hub</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-wide">AutoMotion Portal</h1>
              <p className="text-[10px] text-slate-400">Live Vehicle Service Tracking</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* WebSocket indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 live-dot' : 'bg-rose-500'}`}></span>
            <span className="hidden sm:inline">{wsConnected ? 'Live Updates Active' : 'Offline'}</span>
          </div>

          <button
            onClick={() => setIsNewBookingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Service</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {/* Hero Search Section */}
        <div className="text-center space-y-2 pt-2">
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            Real-Time Vehicle Telemetry
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Track Your Vehicle Service
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            View live technician dispatch, estimated arrival, and real-time repair progress.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-3 max-w-lg mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Booking ID (e.g. BK-10025)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
            >
              {isLoading ? 'Locating...' : 'Track'}
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-rose-400 pt-1 font-medium">{errorMsg}</p>
          )}

          {/* Demo Quick Pickers */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <span className="text-slate-500">Quick Test Samples:</span>
            {activeBookings.slice(0, 4).map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setBooking(b);
                  setSearchQuery(b.bookingNumber);
                  setErrorMsg('');
                }}
                className={`px-2 py-0.5 rounded-lg border font-mono transition-all cursor-pointer ${
                  booking?.id === b.id
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {b.bookingNumber} ({b.status})
              </button>
            ))}
          </div>
        </div>

        {/* Live Status Card */}
        {booking && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-mono">{booking.bookingNumber}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      {booking.licensePlate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel}
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-[11px] text-slate-400">Scheduled Service</p>
                <p className="text-sm font-bold text-slate-100">{booking.service.name}</p>
                <p className="text-xs text-emerald-400 font-mono font-semibold mt-0.5">
                  Invoice Amount: ${booking.amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            {!isCancelled ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Service Pipeline Status
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 live-dot"></span>
                    Live Stage: {booking.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress Visual Tracker */}
                <div className="relative pt-2 pb-4">
                  {/* Connecting Line */}
                  <div className="absolute top-7 left-6 right-6 h-1 bg-slate-800 -translate-y-1/2 z-0 hidden sm:block">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 transition-all duration-700"
                      style={{ width: `${(currentStepIndex / (LIFECYCLE_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Step Nodes */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                    {LIFECYCLE_STEPS.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isPast = idx < currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div key={step.status} className="flex sm:flex-col items-center gap-3 sm:text-center">
                          {/* Circle Icon */}
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 ${
                              isCurrent
                                ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/30 scale-110'
                                : isPast
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                : 'bg-slate-950 border-slate-800 text-slate-600'
                            }`}
                          >
                            <StepIcon className="w-4 h-4" />
                          </div>

                          {/* Labels */}
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold leading-tight ${
                                isCurrent ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug sm:line-clamp-2">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold">This service booking has been cancelled.</p>
                  <p className="text-[11px] text-rose-400/80">
                    Please contact our support dispatcher at (800) 555-AUTO for immediate rescheduling.
                  </p>
                </div>
              </div>
            )}

            {/* Assigned Technician & Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Technician Info */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-400" />
                    Assigned Technician
                  </span>
                  {booking.mechanic && (
                    <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      Certified Master Tech
                    </span>
                  )}
                </div>

                {booking.mechanic ? (
                  <div className="flex items-center gap-3.5 pt-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                      <img
                        src={booking.mechanic.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.mechanic.name}`}
                        alt={booking.mechanic.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white">{booking.mechanic.name}</h4>
                      <p className="text-xs text-slate-400 truncate">{booking.mechanic.specialization}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          ⭐ {booking.mechanic.rating.toFixed(1)}
                        </span>
                        <span className="text-slate-500">•</span>
                        <a
                          href={`tel:${booking.mechanic.phone}`}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          {booking.mechanic.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-slate-500 text-xs italic">
                    Matching you with the nearest certified technician...
                  </div>
                )}
              </div>

              {/* Service Location & Specs */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Service Destination
                </span>

                <div className="space-y-2 pt-1 text-xs">
                  <div>
                    <p className="text-slate-300 font-medium">{booking.customerAddress}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Mobile Van Direct Service Location</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Est. Duration</span>
                      <span className="font-semibold text-slate-200">
                        ~{booking.service.estimatedDuration} minutes
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Scheduled Time</span>
                      <span className="font-semibold text-slate-200">
                        {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Audit Log Stream for Customer */}
            {booking.logs && booking.logs.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Live Dispatch Log
                </span>
                <div className="space-y-1.5">
                  {booking.logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-300 text-[11px]">{log.message}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Creation Modal */}
      <NewBookingModal
        isOpen={isNewBookingOpen}
        customers={customers}
        services={services}
        mechanics={mechanics}
        onClose={() => setIsNewBookingOpen(false)}
        onSubmit={async (payload) => {
          const res = await api.createBooking(payload);
          if (res.success && res.data) {
            setBooking(res.data);
            setSearchQuery(res.data.bookingNumber);
          }
        }}
      />
    </div>
  );
}
