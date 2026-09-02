'use client';

import React, { useState, useMemo } from 'react';
import { Customer, ServiceItem, Mechanic, PriorityLevel } from '../types/index';
import {
  X,
  Plus,
  Car,
  User,
  Wrench,
  MapPin,
  AlertCircle,
  Calendar,
  Search,
  UserPlus,
  Check,
} from 'lucide-react';

interface NewBookingModalProps {
  isOpen: boolean;
  customers: Customer[];
  services: ServiceItem[];
  mechanics: Mechanic[];
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  customers,
  services,
  mechanics,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  // Customer Mode: 'existing' or 'new'
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');

  // Existing customer search & selection
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');

  // New customer fields
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Booking details
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [mechanicId, setMechanicId] = useState('');
  const [vehicleMake, setVehicleMake] = useState('Toyota');
  const [vehicleModel, setVehicleModel] = useState('Camry');
  const [vehicleYear, setVehicleYear] = useState(2022);
  const [licensePlate, setLicensePlate] = useState('CA-9XYZ88');
  const [customerAddress, setCustomerAddress] = useState('742 Evergreen Terrace, San Francisco, CA');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Filter existing customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 15);
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const selectedService = services.find((s) => s.id === serviceId);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setValidationError('');

    if (customerMode === 'new') {
      if (!newCustomerName.trim() || !newCustomerEmail.trim() || !newCustomerPhone.trim()) {
        setValidationError('Please fill in Name, Email, and Phone for the new customer.');
        return;
      }
    } else {
      if (!selectedCustomerId) {
        setValidationError('Please select an existing customer profile.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        serviceId,
        mechanicId: mechanicId || undefined,
        vehicleMake,
        vehicleModel,
        vehicleYear: Number(vehicleYear),
        licensePlate: licensePlate.toUpperCase(),
        customerAddress,
        priority,
        notes: notes || undefined,
      };

      if (customerMode === 'new') {
        payload.newCustomer = {
          name: newCustomerName.trim(),
          email: newCustomerEmail.trim(),
          phone: newCustomerPhone.trim(),
        };
      } else {
        payload.customerId = selectedCustomerId;
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed creating service booking.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New Service Booking</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dispatch a new vehicle service request</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Customer Selection / Registration Mode Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                Customer Account
              </label>

              {/* Toggle Buttons */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCustomerMode('existing')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    customerMode === 'existing'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Existing ({customers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('new')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    customerMode === 'new'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  + New Customer
                </button>
              </div>
            </div>

            {/* Mode A: Searchable Combobox for Existing Customers */}
            {customerMode === 'existing' ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Type name, email, or phone to search..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Filtered Customer List */}
                <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-950">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-[11px]">
                      No existing customer found. Switch to "+ New Customer" above to register!
                    </div>
                  ) : (
                    filteredCustomers.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          if (c.address) setCustomerAddress(c.address);
                        }}
                        className={`w-full p-2.5 text-left flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-slate-900 transition-colors cursor-pointer ${
                          selectedCustomerId === c.id
                            ? 'bg-blue-50 dark:bg-blue-500/10 border-l-2 border-blue-500'
                            : ''
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {c.email} • {c.phone}
                          </p>
                        </div>
                        {selectedCustomerId === c.id && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Mode B: Register New Customer on the fly */
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200/80 dark:border-blue-500/20 space-y-2.5 animate-in fade-in">
                <p className="text-[11px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  First-Time Customer Registration
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Siddhant Patel"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      required={customerMode === 'new'}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. name@example.com"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      required={customerMode === 'new'}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      required={customerMode === 'new'}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Service Item & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-500" />
                Service Package
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (${s.basePrice.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                Assign Technician (Optional)
              </label>
              <select
                value={mechanicId}
                onChange={(e) => setMechanicId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Leave Unassigned (Pending Queue)</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.specialization} • {m.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-500" />
              Vehicle Specifications
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-semibold">Make</label>
                <input
                  type="text"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  required
                  placeholder="e.g. Tesla"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-semibold">Model</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  required
                  placeholder="e.g. Model 3"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-semibold">Year</label>
                <input
                  type="number"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(Number(e.target.value))}
                  required
                  min="1990"
                  max="2027"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-semibold">License Plate</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  required
                  placeholder="e.g. CA-8XYZ90"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Location & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Service Address
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                required
                placeholder="Where should the mechanic arrive?"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Urgency Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="LOW">Low (Routine check)</option>
                <option value="MEDIUM">Medium (Scheduled)</option>
                <option value="HIGH">High (Urgent issue)</option>
                <option value="EMERGENCY">Emergency (Stranded)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Dispatch Instructions / Vehicle Symptoms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Front left tire is flat, car is parked in visitor garage spot #4..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Service Estimate</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                ${selectedService ? selectedService.basePrice.toFixed(2) : '0.00'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Dispatch Service Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
