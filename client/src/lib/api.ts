import { ApiResponse, DashboardStats, AnalyticsData, Booking, Mechanic, Customer, ServiceItem } from '../types/index';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const cleanUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      cache: 'no-store', // Always fetch latest live operational data
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    return {
      success: false,
      data: null as any,
      error: { message: err.message || 'Network request failed' },
    };
  }
}

export const api = {
  // Dashboard Metrics
  getDashboardStats: () => fetcher<DashboardStats>('/dashboard/stats'),
  getDashboardAnalytics: (days = 30) => fetcher<AnalyticsData>(`/dashboard/analytics?days=${days}`),

  // Bookings
  getBookings: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    mechanicId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.priority) query.set('priority', params.priority);
    if (params.mechanicId) query.set('mechanicId', params.mechanicId);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    return fetcher<Booking[]>(`/bookings?${query.toString()}`);
  },

  getBookingById: (id: string) => fetcher<Booking>(`/bookings/${id}`),

  updateBookingStatus: (id: string, status: string, mechanicId?: string, notes?: string) =>
    fetcher<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, mechanicId, notes }),
    }),

  createBooking: (payload: {
    customerId: string;
    serviceId: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    licensePlate: string;
    customerAddress: string;
    priority?: string;
    notes?: string;
  }) =>
    fetcher<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Mechanics
  getMechanics: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return fetcher<Mechanic[]>(`/mechanics${query}`);
  },
  getMechanicById: (id: string) => fetcher<Mechanic>(`/mechanics/${id}`),

  // Customers
  getCustomers: (search?: string, page = 1, limit = 10) => {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) query.set('search', search);
    return fetcher<Customer[]>(`/customers?${query.toString()}`);
  },

  // Services Catalog
  getServices: () => fetcher<ServiceItem[]>('/services'),

  // Live Simulator Controls
  getSimulationStatus: () => fetcher<{ running: boolean; intervalMs: number }>('/simulation/status'),
  startSimulation: (intervalMs = 6000) =>
    fetcher<{ message: string; running: boolean }>('/simulation/start', {
      method: 'POST',
      body: JSON.stringify({ intervalMs }),
    }),
  stopSimulation: () =>
    fetcher<{ message: string; running: boolean }>('/simulation/stop', {
      method: 'POST',
    }),
};
