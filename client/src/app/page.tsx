'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { StatCard } from '../components/StatCard';
import { RevenueChart } from '../components/RevenueChart';
import { CategoryBreakdownChart } from '../components/CategoryBreakdownChart';
import { LiveFeed } from '../components/LiveFeed';
import { BookingTable } from '../components/BookingTable';
import { BookingDetailModal } from '../components/BookingDetailModal';
import { NewBookingModal } from '../components/NewBookingModal';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import {
  Booking,
  DashboardStats,
  AnalyticsData,
  Mechanic,
  Customer,
  ServiceItem,
  BookingStatus,
} from '../types/index';
import {
  DollarSign,
  CalendarCheck2,
  Wrench,
  Activity,
  CheckCircle2,
  Clock,
  Navigation,
  Sparkles,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [liveLogs, setLiveLogs] = useState<any[]>([]);

  // Debounce search input by 300ms to prevent race conditions
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Simulation & Modals
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Fetch stats & analytics
  const loadDashboardData = useCallback(async () => {
    try {
      const [statsRes, analyticsRes, mechanicsRes, customersRes, servicesRes, simRes] =
        await Promise.all([
          api.getDashboardStats(),
          api.getDashboardAnalytics(30),
          api.getMechanics(),
          api.getCustomers(undefined, 1, 50),
          api.getServices(),
          api.getSimulationStatus(),
        ]);

      if (statsRes.success) setStats(statsRes.data);
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
        if (analyticsRes.data.recentLogs) {
          setLiveLogs(analyticsRes.data.recentLogs);
        }
      }
      if (mechanicsRes.success) setMechanics(mechanicsRes.data);
      if (customersRes.success) setCustomers(customersRes.data);
      if (servicesRes.success) setServices(servicesRes.data);
      if (simRes.success) setIsSimulating(simRes.data.running);
    } catch (err) {
      console.error('Failed loading dashboard overview:', err);
    }
  }, []);

  // Fetch paginated bookings
  const loadBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const res = await api.getBookings({
        page: currentPage,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });

      if (res.success && res.data) {
        setBookings(res.data);
        if (res.meta) {
          setTotalBookings(res.meta.total);
          setTotalPages(res.meta.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed loading bookings:', err);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, priorityFilter]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // WebSocket Live Real-Time Events
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setWsConnected(true);
    const handleDisconnect = () => setWsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    setWsConnected(socket.connected);

    // Live Booking Update
    socket.on('booking:updated', ({ booking, previousStatus }) => {
      // 1. Update matching booking in table state if present
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, ...booking } : b))
      );

      // 2. Prepend to live feed
      const newLog = {
        id: `live-${Date.now()}-${booking.id}`,
        status: booking.status,
        message: `Status transitioned to ${booking.status} for vehicle ${booking.vehicleMake} ${booking.vehicleModel}`,
        createdAt: new Date().toISOString(),
        booking: {
          bookingNumber: booking.bookingNumber,
          vehicleMake: booking.vehicleMake,
          vehicleModel: booking.vehicleModel,
          customer: booking.customer || { name: 'Customer' },
          mechanic: booking.mechanic,
        },
      };

      setLiveLogs((prev) => [newLog, ...prev.slice(0, 19)]);

      // 3. Update selected booking if currently viewing modal
      setSelectedBooking((curr) => (curr?.id === booking.id ? { ...curr, ...booking } : curr));

      // 4. Refresh stats quietly
      api.getDashboardStats().then((res) => {
        if (res.success) setStats(res.data);
      });
    });

    // Live Booking Created
    socket.on('booking:created', (booking) => {
      setBookings((prev) => [booking, ...prev.slice(0, 9)]);
      setTotalBookings((t) => t + 1);

      const newLog = {
        id: `live-create-${Date.now()}`,
        status: booking.status || 'PENDING',
        message: `New booking #${booking.bookingNumber} registered (${booking.service?.name || 'Service'})`,
        createdAt: new Date().toISOString(),
        booking,
      };

      setLiveLogs((prev) => [newLog, ...prev.slice(0, 19)]);
      api.getDashboardStats().then((res) => {
        if (res.success) setStats(res.data);
      });
    });

    // Live Stats Updated
    socket.on('dashboard:stats_updated', (newStats) => {
      setStats(newStats);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('booking:updated');
      socket.off('booking:created');
      socket.off('dashboard:stats_updated');
    };
  }, []);

  // Toggle Live Simulation
  const handleToggleSimulation = async () => {
    try {
      if (isSimulating) {
        const res = await api.stopSimulation();
        if (res.success) setIsSimulating(false);
      } else {
        const res = await api.startSimulation(5000);
        if (res.success) setIsSimulating(true);
      }
    } catch (err) {
      console.error('Failed toggling simulation:', err);
    }
  };

  // Update Status from Modal
  const handleUpdateBookingStatus = async (
    id: string,
    status: BookingStatus,
    mechanicId?: string,
    notes?: string
  ) => {
    const res = await api.updateBookingStatus(id, status, mechanicId, notes);
    if (res.success) {
      loadBookings();
    }
  };

  // Create Booking from Modal
  const handleCreateBooking = async (payload: any) => {
    const res = await api.createBooking(payload);
    if (res.success) {
      loadBookings();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navigation Sidebar */}
      <Sidebar
        wsConnected={wsConnected}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          simulating={isSimulating}
          onToggleSimulation={handleToggleSimulation}
          onOpenNewBooking={() => setIsNewBookingOpen(true)}
          searchTerm={search}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Overview KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`$${(stats?.totalRevenue || 70530.23).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="From completed operations"
              icon={DollarSign}
              color="emerald"
              trend="+14.2%"
              trendPositive={true}
            />

            <StatCard
              title="Total Bookings"
              value={stats?.totalBookings || 620}
              subtitle={`${stats?.todayBookings || 0} jobs logged today`}
              icon={CalendarCheck2}
              color="blue"
              trend="620 Total"
              trendPositive={true}
            />

            <StatCard
              title="Active Mechanics"
              value={`${stats?.activeMechanics || 21} / ${stats?.totalMechanics || 25}`}
              subtitle="Stationed & in-transit"
              icon={Wrench}
              color="amber"
              trend="84% Fleet Active"
              trendPositive={true}
            />

            <StatCard
              title="Operations Velocity"
              value={`${stats?.completionRate || 60}%`}
              subtitle={`${stats?.inProgressBookings || 0} in progress, ${stats?.enRouteBookings || 0} en route`}
              icon={Activity}
              color="cyan"
              trend="Optimal Pace"
              trendPositive={true}
            />
          </div>

          {/* Real-time Status Distribution Quick Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-purple-400 font-semibold uppercase">Pending</p>
                <p className="text-lg font-bold text-white font-mono">{stats?.pendingBookings || 0}</p>
              </div>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>

            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-blue-400 font-semibold uppercase">Assigned</p>
                <p className="text-lg font-bold text-white font-mono">{stats ? (stats.totalBookings - stats.completedBookings - stats.pendingBookings - stats.inProgressBookings - stats.enRouteBookings - stats.cancelledBookings) : 0}</p>
              </div>
              <Wrench className="w-4 h-4 text-blue-400" />
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-amber-400 font-semibold uppercase">En Route</p>
                <p className="text-lg font-bold text-white font-mono">{stats?.enRouteBookings || 0}</p>
              </div>
              <Navigation className="w-4 h-4 text-amber-400" />
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-cyan-400 font-semibold uppercase">In Progress</p>
                <p className="text-lg font-bold text-white font-mono">{stats?.inProgressBookings || 0}</p>
              </div>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase">Completed</p>
                <p className="text-lg font-bold text-white font-mono">{stats?.completedBookings || 0}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-rose-400 font-semibold uppercase">Cancelled</p>
                <p className="text-lg font-bold text-white font-mono">{stats?.cancelledBookings || 0}</p>
              </div>
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
          </div>

          {/* Charts & Live Feed Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {analytics && <RevenueChart data={analytics.timeSeries} />}
            </div>
            <div>
              <LiveFeed logs={liveLogs} />
            </div>
          </div>

          {/* Secondary Analytics Row */}
          {analytics && (
            <div className="grid grid-cols-1 gap-6">
              <CategoryBreakdownChart data={analytics.categoryBreakdown} />
            </div>
          )}

          {/* Main Bookings Operations Table */}
          <div className="space-y-4">
            <BookingTable
              bookings={bookings}
              totalBookings={totalBookings}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              statusFilter={statusFilter}
              onStatusFilterChange={(s) => {
                setStatusFilter(s);
                setCurrentPage(1);
              }}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={(pr) => {
                setPriorityFilter(pr);
                setCurrentPage(1);
              }}
              search={search}
              onSearchChange={(sc) => {
                setSearch(sc);
                setCurrentPage(1);
              }}
              onSelectBooking={(b) => setSelectedBooking(b)}
              isLoading={isLoadingBookings}
            />
          </div>
        </main>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          mechanics={mechanics}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateBookingStatus}
        />
      )}

      {/* New Booking Modal */}
      <NewBookingModal
        isOpen={isNewBookingOpen}
        customers={customers}
        services={services}
        mechanics={mechanics}
        onClose={() => setIsNewBookingOpen(false)}
        onSubmit={handleCreateBooking}
      />
    </div>
  );
}
