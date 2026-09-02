'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { BookingTable } from '../../components/BookingTable';
import { BookingDetailModal } from '../../components/BookingDetailModal';
import { NewBookingModal } from '../../components/NewBookingModal';
import { api } from '../../lib/api';
import { Booking, Mechanic, Customer, ServiceItem, BookingStatus } from '../../types/index';
import { CalendarCheck2, Plus } from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getBookings({
        page: currentPage,
        limit: 12,
        search: search || undefined,
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
      setIsLoading(false);
    }
  }, [currentPage, search, statusFilter, priorityFilter]);

  useEffect(() => {
    loadBookings();
    api.getMechanics().then((res) => {
      if (res.success) setMechanics(res.data);
    });
    api.getCustomers(undefined, 1, 50).then((res) => {
      if (res.success) setCustomers(res.data);
    });
    api.getServices().then((res) => {
      if (res.success) setServices(res.data);
    });
    api.getSimulationStatus().then((res) => {
      if (res.success) setIsSimulating(res.data.running);
    });
  }, [loadBookings]);

  const handleToggleSimulation = async () => {
    if (isSimulating) {
      await api.stopSimulation();
      setIsSimulating(false);
    } else {
      await api.startSimulation();
      setIsSimulating(true);
    }
  };

  const handleUpdateStatus = async (id: string, status: BookingStatus, mechanicId?: string, notes?: string) => {
    const res = await api.updateBookingStatus(id, status, mechanicId, notes);
    if (res.success) {
      loadBookings();
    }
  };

  const handleCreateBooking = async (payload: any) => {
    const res = await api.createBooking(payload);
    if (res.success) {
      loadBookings();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
                <CalendarCheck2 className="w-5 h-5 text-blue-400" />
                Bookings Management Hub
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Filter, search, review, and manually dispatch vehicle service bookings
              </p>
            </div>

            <button
              onClick={() => setIsNewBookingOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Booking</span>
            </button>
          </div>

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
            isLoading={isLoading}
          />
        </main>
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          mechanics={mechanics}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

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
