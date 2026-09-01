'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { MechanicsGrid } from '../../components/MechanicsGrid';
import { MechanicsMapView } from '../../components/MechanicsMapView';
import { NewBookingModal } from '../../components/NewBookingModal';
import { api } from '../../lib/api';
import { Mechanic, Customer, ServiceItem } from '../../types/index';
import { Wrench, MapPin, Grid, ListFilter, Users } from 'lucide-react';

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [statusFilter, setStatusFilter] = useState('');
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    api.getMechanics(statusFilter || undefined).then((res) => {
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
  }, [statusFilter]);

  const handleToggleSimulation = async () => {
    if (isSimulating) {
      await api.stopSimulation();
      setIsSimulating(false);
    } else {
      await api.startSimulation();
      setIsSimulating(true);
    }
  };

  const activeCount = mechanics.filter((m) => m.status === 'AVAILABLE' || m.status === 'BUSY').length;
  const busyCount = mechanics.filter((m) => m.status === 'BUSY').length;

  return (
    <div className="flex min-h-screen bg-[#090d16]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          simulating={isSimulating}
          onToggleSimulation={handleToggleSimulation}
          onOpenNewBooking={() => setIsNewBookingOpen(true)}
        />

        <main className="p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-blue-400" />
                Mechanics & Technician Fleet
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time technician availability, live telemetry, and dispatch monitoring
              </p>
            </div>

            {/* View Mode & Filter Controls */}
            <div className="flex items-center gap-2.5">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Fleet ({mechanics.length})</option>
                <option value="AVAILABLE">Available Only</option>
                <option value="BUSY">On Active Job Only</option>
                <option value="OFF_DUTY">Off Duty</option>
              </select>

              {/* View Toggle */}
              <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Roster</span>
                </button>

                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Live GPS Radar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Technicians</p>
                <p className="text-2xl font-bold text-white font-mono mt-1">{mechanics.length}</p>
              </div>
              <Users className="w-5 h-5 text-blue-400" />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-400 font-semibold uppercase">Available for Dispatch</p>
                <p className="text-2xl font-bold text-white font-mono mt-1">{mechanics.filter(m => m.status === 'AVAILABLE').length}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-400 live-dot"></div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-400 font-semibold uppercase">Currently On Service</p>
                <p className="text-2xl font-bold text-white font-mono mt-1">{busyCount}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-amber-400 live-dot"></div>
            </div>
          </div>

          {/* Main View Area */}
          {viewMode === 'grid' ? (
            <MechanicsGrid mechanics={mechanics} />
          ) : (
            <MechanicsMapView mechanics={mechanics} />
          )}
        </main>
      </div>

      <NewBookingModal
        isOpen={isNewBookingOpen}
        customers={customers}
        services={services}
        mechanics={mechanics}
        onClose={() => setIsNewBookingOpen(false)}
        onSubmit={async (payload) => {
          await api.createBooking(payload);
        }}
      />
    </div>
  );
}
