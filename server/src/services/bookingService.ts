import { prisma } from './prisma.js';
import { BookingStatus, MechanicStatus, Prisma } from '@prisma/client';
import { BookingQueryParams, CreateBookingInput, UpdateBookingStatusInput } from '../types/index.js';
import { realtime } from '../sockets/socketManager.js';

export class BookingService {
  /**
   * Search, filter, sort, and paginate bookings
   */
  static async getBookings(params: BookingQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      mechanicId,
      customerId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = params;

    const skip = (page - 1) * limit;

    // Construct Prisma where query conditions
    const where: Prisma.BookingWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (mechanicId) {
      where.mechanicId = mechanicId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { vehicleMake: { contains: search, mode: 'insensitive' } },
        { vehicleModel: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
        { mechanic: { name: { contains: search, mode: 'insensitive' } } },
        { service: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
          mechanic: {
            select: { id: true, name: true, phone: true, rating: true, status: true, avatar: true },
          },
          service: {
            select: { id: true, name: true, category: true, basePrice: true, estimatedDuration: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      bookings,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get single booking by ID with full relations and audit history logs
   */
  static async getBookingById(id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        mechanic: true,
        service: true,
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return booking;
  }

  /**
   * Create a new booking
   */
  static async createBooking(input: CreateBookingInput) {
    // 1. Fetch service to calculate amount
    const service = await prisma.serviceItem.findUnique({
      where: { id: input.serviceId },
    });

    if (!service) {
      throw new Error('Selected service not found.');
    }

    // 2. Generate unique booking number
    // const count = await prisma.booking.count();
    // const bookingNumber = `${10000 + count + 1}`;
    //to make booking collision proof: 
    // Generates a clean 6-digit timestamp like "839201"
    const bookingNumber = `${Date.now().toString().slice(-6)}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: input.customerId,
        serviceId: input.serviceId,
        mechanicId: input.mechanicId || null,
        vehicleMake: input.vehicleMake,
        vehicleModel: input.vehicleModel,
        vehicleYear: input.vehicleYear,
        licensePlate: input.licensePlate.toUpperCase(),
        customerAddress: input.customerAddress,
        priority: input.priority,
        amount: service.basePrice,
        notes: input.notes,
        status: input.mechanicId ? BookingStatus.ASSIGNED : BookingStatus.PENDING,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : new Date(),
        logs: {
          create: {
            status: input.mechanicId ? BookingStatus.ASSIGNED : BookingStatus.PENDING,
            message: `Booking created (${service.name})`,
          },
        },
      },
      include: {
        customer: true,
        mechanic: true,
        service: true,
      },
    });

    // Broadcast real-time event
    realtime.broadcastBookingCreated(booking);

    return booking;
  }

  /**
   * Update booking status & dispatch state
   */
  static async updateBookingStatus(id: string, input: UpdateBookingStatusInput) {
    const existing = await prisma.booking.findUnique({
      where: { id },
      include: { mechanic: true, service: true },
    });

    if (!existing) {
      return null;
    }

    const previousStatus = existing.status;
    const isCompleted = input.status === BookingStatus.COMPLETED;
    const mechanicId = input.mechanicId !== undefined ? input.mechanicId : existing.mechanicId;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: input.status,
        mechanicId,
        completedAt: isCompleted ? new Date() : existing.completedAt,
        notes: input.notes !== undefined ? input.notes : existing.notes,
        logs: {
          create: {
            status: input.status,
            message: `Status updated from ${previousStatus} to ${input.status}. ${input.notes || ''}`,
          },
        },
      },
      include: {
        customer: true,
        mechanic: true,
        service: true,
        logs: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Update mechanic status if assigned or completed
    if (mechanicId) {
      if (input.status === BookingStatus.IN_PROGRESS || input.status === BookingStatus.EN_ROUTE) {
        await prisma.mechanic.update({
          where: { id: mechanicId },
          data: { status: MechanicStatus.BUSY },
        });
      } else if (input.status === BookingStatus.COMPLETED) {
        await prisma.mechanic.update({
          where: { id: mechanicId },
          data: {
            status: MechanicStatus.AVAILABLE,
            completedJobs: { increment: 1 },
          },
        });
      }
    }

    // Broadcast real-time update
    realtime.broadcastBookingUpdated(updatedBooking, previousStatus);

    return updatedBooking;
  }
}
