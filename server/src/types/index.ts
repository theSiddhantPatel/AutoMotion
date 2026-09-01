import { z } from 'zod';
import { BookingStatus, PriorityLevel, MechanicStatus } from '@prisma/client';

export const CreateBookingSchema = z.object({
  customerId: z.string().uuid({ message: 'Valid customer ID is required' }),
  serviceId: z.string().uuid({ message: 'Valid service item ID is required' }),
  mechanicId: z.string().uuid().optional().nullable(),
  vehicleMake: z.string().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleYear: z.number().int().min(1990).max(2027),
  licensePlate: z.string().min(2, 'License plate is required'),
  customerAddress: z.string().min(5, 'Customer service address is required'),
  priority: z.nativeEnum(PriorityLevel).default(PriorityLevel.MEDIUM),
  notes: z.string().optional().nullable(),
  scheduledAt: z.string().datetime().optional(),
});

export const UpdateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus, {
    errorMap: () => ({ message: 'Invalid booking status. Must be PENDING, ASSIGNED, EN_ROUTE, IN_PROGRESS, COMPLETED, or CANCELLED' }),
  }),
  mechanicId: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
});

export const BookingQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  priority: z.nativeEnum(PriorityLevel).optional(),
  mechanicId: z.string().optional(),
  customerId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'scheduledAt', 'amount', 'status', 'bookingNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;
export type BookingQueryParams = z.infer<typeof BookingQuerySchema>;
