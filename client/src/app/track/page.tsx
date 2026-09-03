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
  ExternalLink,
  ChevronRight,
  Bot,
  AlertTriangle,
  Zap,
  Activity,
  Award,
} from 'lucide-react';
import { NewBookingModal } from '../../components/NewBookingModal';
import { ThemeToggle } from '../../components/ThemeToggle';

// 5-step customer progress timeline
const LIFECYCLE_STEPS: { status: BookingStatus; label: string; desc: string; icon: any }[] = [
  { status: 'PENDING', label: 'Order Received', desc: 'Dispatched to queue', icon: Clock },
  { status: 'ASSIGNED', label: 'Tech Assigned', desc: 'Certified mechanic matched', icon: Wrench },
  { status: 'EN_ROUTE', label: 'Van En Route', desc: 'Mobile unit driving to you', icon: Navigation },
  { status: 'IN_PROGRESS', label: 'Under Repair', desc: 'Work in progress on site', icon: Car },
  { status: 'COMPLETED', label: 'Inspected & Ready', desc: 'Passed multi-point inspection', icon: CheckCircle2 },
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
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSymptom, setAiSymptom] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Load sample active bookings
  useEffect(() => {
    setIsLoading(true);
    api.getBookings({ limit: 12, sortBy: 'createdAt', sortOrder: 'desc' }).then((res) => {
      setIsLoading(false);
      if (res.success && res.data && res.data.length > 0) {
        setActiveBookings(res.data);
        // Prioritize showing an active in-flight job so live updates are immediately visible
        const activeItem =
          res.data.find((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') ||
          res.data[0];
        setBooking(activeItem);
        setSearchQuery(activeItem.bookingNumber);
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

  // Real-Time WebSocket Listener
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setWsConnected(true);
    const handleDisconnect = () => setWsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    setWsConnected(socket.connected);

    socket.on('booking:created', (newBooking: any) => {
      setBooking(newBooking);
      setSearchQuery(newBooking.bookingNumber);
      setActiveBookings((prev) => [newBooking, ...prev.slice(0, 11)]);
    });

    socket.on('booking:updated', ({ booking: updatedBooking }: any) => {
      setBooking((curr) => {
        if (!curr || curr.id === updatedBooking.id || curr.bookingNumber === updatedBooking.bookingNumber) {
          return { ...(curr || {}), ...updatedBooking };
        }
        return curr;
      });

      setActiveBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b))
      );
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('booking:created');
      socket.off('booking:updated');
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.getBookings({ search: query, limit: 1 });
      if (res.success && res.data && res.data.length > 0) {
        setBooking(res.data[0]);
      } else {
        setErrorMsg(`No booking found matching "${query}". Please check your 6-digit booking code.`);
      }
    } catch (err) {
      setErrorMsg('Failed looking up booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiDiagnosis = () => {
    if (!aiSymptom) return;
    const s = aiSymptom.toLowerCase();
    if (s.includes('brake') || s.includes('squeak') || s.includes('stopping')) {
      setAiRecommendation('Recommended: Front & Rear Ceramic Brake Pad Service ($249.50) — Ceramic pad replacement, rotor inspection, and fluid calibration.');
    } else if (s.includes('oil') || s.includes('engine') || s.includes('smoke')) {
      setAiRecommendation('Recommended: Full Synthetic Performance Oil Flush ($89.99) — OEM filter replacement, synthetic oil flush, and 20-point digital health inspection.');
    } else if (s.includes('battery') || s.includes('start') || s.includes('dead')) {
      setAiRecommendation('Recommended: 12V Battery Diagnostic & Rapid Replacement ($179.00) — Cold-cranking amp load test & OEM battery install.');
    } else if (s.includes('ac') || s.includes('cool') || s.includes('hot') || s.includes('air')) {
      setAiRecommendation('Recommended: Dual-Zone AC Recharge & UV Leak Check ($195.00) — Vacuum test, UV dye inspection, and refrigerant recharge.');
    } else {
      setAiRecommendation('Recommended: Full Electronic OBD-II Diagnostics ($110.00) — Computerized ECU and sensor diagnostics performed by a field technician.');
    }
  };

  const currentStepIndex = booking ? STATUS_INDEX_MAP[booking.status] : 0;
  const isCancelled = booking?.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Header Bar with Theme Toggle */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              AutoMotion
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                Direct
              </span>
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">On-Demand Vehicle Service</p>
          </div>
        </div>

        {/* Center Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <a href="#tracker" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Live Telemetry Tracker
          </a>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            AI Diagnostics
          </button>
          <a href="#services" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Service Catalog
          </a>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <a
            href="tel:+919369220823"
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 font-mono"
          >
            <Phone className="w-3.5 h-3.5 text-blue-500" />
            +919369220823
          </a>
        </nav>

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* Switch to Operations Hub */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all"
            title="Switch to Internal Operations Hub"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Operations Hub</span>
          </Link>

          {/* Book Service Button */}
          <button
            onClick={() => setIsNewBookingOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Service</span>
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="px-4 sm:px-8 py-10 sm:py-16 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Headline */}
        <div className="lg:col-span-7 space-y-5 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-500 live-dot"></span>
            Mobile Service Units Active Across Metro Area
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
            Precision Mobile Mechanics,{' '}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Dispatched to Your Location.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            Experience dealer-grade vehicle maintenance at your home or office. Transparent upfront quotes,
            certified technician dispatch, and live real-time service telemetry.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#tracker"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Track Live Vehicle Service</span>
            </a>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-xs transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-cyan-500" />
              <span>AI Symptom Checker</span>
            </button>
          </div>
        </div>

        {/* Right Feature Card */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Guaranteed Service Standard
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot"></span>
                21 Mechanics Online
              </span>
            </div>

            <div className="space-y-3 pt-1 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">12-Month / 12,000-Mile Warranty</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">All parts and labor covered by our nationwide warranty.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Zero Shop Markup</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Save up to 35% compared to traditional dealerships.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3">
                <Activity className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Real-Time Mobile Van Dispatch</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Track your mobile technician arriving in real-time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Telemetry Tracker Section */}
      <section id="tracker" className="px-4 sm:px-8 py-10 max-w-5xl mx-auto w-full space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            Live Telemetry Tracker
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Real-Time Service Pipeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Input your Booking ID or pick a live demo booking to watch stages update live via WebSockets.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-3 max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter 6-digit Booking ID (e.g. 100025)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all cursor-pointer shrink-0 shadow-sm"
            >
              {isLoading ? 'Locating...' : 'Track'}
            </button>
          </form>

          {errorMsg && <p className="text-xs text-rose-600 dark:text-rose-400 pt-1 font-semibold">{errorMsg}</p>}

          {/* Quick Demo Pickers */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
            <span>Quick Samples:</span>
            {activeBookings.slice(0, 4).map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setBooking(b);
                  setSearchQuery(b.bookingNumber);
                  setErrorMsg('');
                }}
                className={`px-2.5 py-0.5 rounded-lg border font-mono text-[11px] transition-all cursor-pointer ${booking?.id === b.id
                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                  }`}
              >
                {b.bookingNumber} ({b.status})
              </button>
            ))}
          </div>
        </div>

        {/* Live Stepper Card */}
        {booking && (
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-7 backdrop-blur-md">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">{booking.bookingNumber}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                      {booking.licensePlate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel}
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-[11px] text-slate-400">Service Package</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{booking.service.name}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-0.5">
                  Invoice Amount: ${booking.amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* 5-Step Progress Stepper */}
            {!isCancelled ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Service Pipeline Status
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-3 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-blue-500 live-dot"></span>
                    Current Stage: {booking.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="relative pt-2 pb-2">
                  {/* Connecting Line */}
                  <div className="absolute top-7 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 hidden sm:block">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-700"
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
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 ${isCurrent
                              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                              : isPast
                                ? 'bg-emerald-500 border-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                              }`}
                          >
                            <StepIcon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold leading-tight ${isCurrent
                                ? 'text-blue-600 dark:text-blue-400'
                                : isPast
                                  ? 'text-slate-800 dark:text-slate-200'
                                  : 'text-slate-400 dark:text-slate-500'
                                }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug sm:line-clamp-2">
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
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <p className="font-bold">This booking has been cancelled.</p>
                  <p className="text-rose-600 dark:text-rose-400/80">Please call dispatch support at +919369220823 to reschedule.</p>
                </div>
              </div>
            )}

            {/* Technician & Destination Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-500" />
                    Assigned Master Technician
                  </span>
                  {booking.mechanic && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                      Verified Field Pro
                    </span>
                  )}
                </div>

                {booking.mechanic ? (
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-xs">
                      <img
                        src={booking.mechanic.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.mechanic.name}`}
                        alt={booking.mechanic.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{booking.mechanic.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{booking.mechanic.specialization}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="font-bold text-amber-500 flex items-center gap-1">
                          ⭐ {booking.mechanic.rating.toFixed(1)}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <a
                          href={`tel:${booking.mechanic.phone}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-bold font-mono flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {booking.mechanic.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 text-center text-slate-400 text-xs italic">
                    Matching you with the nearest certified field technician...
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Service Location
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{booking.customerAddress}</p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Estimated Duration</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">~{booking.service.estimatedDuration} mins</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Scheduled Time</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Service Catalog */}
      <section id="services" className="px-4 sm:px-8 py-12 max-w-6xl mx-auto w-full space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Upfront & Transparent
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Popular Mobile Services</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">All prices include parts, labor, and on-site dispatch.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.slice(0, 4).map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all space-y-3 flex flex-col justify-between shadow-xs"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                  {s.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{s.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
                  {s.description || 'Complete mobile vehicle repair service performed by certified master technicians.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Upfront Price</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">${s.basePrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setIsNewBookingOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. AI Diagnostics Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Diagnostics Assistant</h3>
                  <p className="text-xs text-slate-500">Describe what your vehicle is experiencing</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAiModalOpen(false);
                  setAiRecommendation(null);
                  setAiSymptom('');
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                What symptom are you noticing?
              </label>
              <textarea
                value={aiSymptom}
                onChange={(e) => setAiSymptom(e.target.value)}
                placeholder="e.g. Squeaking noise when pressing brakes, battery won't turn over, check engine light..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-400">Quick test:</span>
                {['Brake noise', 'Engine smoke', 'Battery dead', 'AC blowing warm'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setAiSymptom(tag)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {aiRecommendation && (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-slate-800 dark:text-slate-200 space-y-1 animate-in fade-in">
                <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  AutoMotion AI Analysis:
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-snug">{aiRecommendation}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={handleAiDiagnosis}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
              >
                Analyze Symptoms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. New Booking Modal */}
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

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 AutoMotion Technologies. All rights reserved.</p>
        <p className="text-[11px] text-slate-400 mt-1">Built with Next.js, WebSockets, and Prisma ORM.</p>
      </footer>
    </div>
  );
}
