'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { api } from '../../lib/api';
import { Customer } from '../../types/index';
import { Users, Search, Phone, Mail, MapPin, DollarSign, Calendar } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    api.getCustomers(search || undefined, page, 15).then((res) => {
      if (res.success && res.data) {
        setCustomers(res.data);
        if (res.meta) setTotal(res.meta.total);
      }
    });
    api.getSimulationStatus().then((res) => {
      if (res.success) setIsSimulating(res.data.running);
    });
  }, [search, page]);

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
                <Users className="w-5 h-5 text-blue-400" />
                Customer Directory
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage registered vehicle owners, service history, and lifetime value
              </p>
            </div>

            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                    <img
                      src={c.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.name}`}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">{c.name}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Bookings</span>
                    <span className="font-bold text-white font-mono">{c.totalBookings || 0} Jobs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Lifetime Spend</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      ${(c.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-slate-400 text-[11px]">
                  <p className="flex items-center gap-2 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.phone}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="truncate">{c.address}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
