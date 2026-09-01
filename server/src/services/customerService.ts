import { prisma } from './prisma.js';
import { BookingStatus } from '@prisma/client';

export class CustomerService {
  /**
   * Get all customers with their booking stats & lifetime value
   */
  static async getCustomers(search?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          bookings: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
      }),
    ]);

    const formatted = customers.map((c) => {
      const totalSpent = c.bookings
        .filter((b) => b.status === BookingStatus.COMPLETED)
        .reduce((sum, b) => sum + b.amount, 0);

      const lastBooking = c.bookings.length > 0 ? c.bookings[0].createdAt : null;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        avatar: c.avatar,
        totalBookings: c._count.bookings,
        totalSpent: Number(totalSpent.toFixed(2)),
        lastBookingDate: lastBooking,
        createdAt: c.createdAt,
      };
    });

    return {
      customers: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single customer with full booking history
   */
  static async getCustomerById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            service: true,
            mechanic: { select: { name: true, phone: true } },
          },
        },
      },
    });
  }
}
