export type BookingStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type MechanicStatus = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string | null;
  totalBookings?: number;
  totalSpent?: number;
  createdAt: string;
}

export interface Mechanic {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  specialization: string;
  status: MechanicStatus;
  rating: number;
  completedJobs: number;
  location?: { lat: number; lng: number } | null;
  currentJob?: {
    id: string;
    bookingNumber: string;
    vehicleMake: string;
    vehicleModel: string;
    customer: { name: string; phone: string };
    service: { name: string };
  } | null;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  basePrice: number;
  estimatedDuration: number;
}

export interface BookingLog {
  id: string;
  bookingId: string;
  status: BookingStatus;
  message: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  mechanicId?: string | null;
  serviceId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  licensePlate: string;
  status: BookingStatus;
  priority: PriorityLevel;
  amount: number;
  notes?: string | null;
  customerAddress: string;
  scheduledAt: string;
  completedAt?: string | null;
  createdAt: string;
  customer: Customer;
  mechanic?: Mechanic | null;
  service: ServiceItem;
  logs?: BookingLog[];
}

export interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  yesterdayBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  inProgressBookings: number;
  enRouteBookings: number;
  totalRevenue: number;
  activeMechanics: number;
  totalMechanics: number;
  totalCustomers: number;
  completionRate: number;
}

export interface AnalyticsData {
  timeSeries: Array<{
    date: string;
    bookings: number;
    revenue: number;
    completed: number;
  }>;
  statusBreakdown: Array<{
    status: BookingStatus;
    count: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  recentLogs: Array<{
    id: string;
    status: BookingStatus;
    message: string;
    createdAt: string;
    booking: {
      bookingNumber: string;
      vehicleMake: string;
      vehicleModel: string;
      customer: { name: string };
      mechanic?: { name: string } | null;
    };
  }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  error?: { message: string; details?: any };
}
