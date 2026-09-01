import { prisma } from './prisma.js';
import { BookingStatus, MechanicStatus } from '@prisma/client';

export class DashboardService {
  /**
   * Get high-level KPI overview metrics
   */
  static async getOverviewStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

    // Run parallel counts for maximum performance
    const [
      totalBookings,
      todayBookings,
      yesterdayBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      inProgressBookings,
      enRouteBookings,
      totalRevenueResult,
      activeMechanics,
      totalMechanics,
      totalCustomers,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startOfYesterday,
            lt: startOfToday,
          },
        },
      }),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
      prisma.booking.count({ where: { status: BookingStatus.IN_PROGRESS } }),
      prisma.booking.count({ where: { status: BookingStatus.EN_ROUTE } }),
      prisma.booking.aggregate({
        where: { status: BookingStatus.COMPLETED },
        _sum: { amount: true },
      }),
      prisma.mechanic.count({
        where: { status: { in: [MechanicStatus.AVAILABLE, MechanicStatus.BUSY] } },
      }),
      prisma.mechanic.count(),
      prisma.customer.count(),
    ]);

    const totalRevenue = totalRevenueResult._sum.amount || 0;

    // Calculate completion rate percentage
    const completionRate =
      totalBookings > 0
        ? Number(((completedBookings / (totalBookings - cancelledBookings || 1)) * 100).toFixed(1))
        : 0;

    return {
      totalBookings,
      todayBookings,
      yesterdayBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      inProgressBookings,
      enRouteBookings,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      activeMechanics,
      totalMechanics,
      totalCustomers,
      completionRate,
    };
  }

  /**
   * Get formatted analytics data for dashboard charts
   */
  static async getAnalyticsData(days = 30) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // 1. Fetch completed and all bookings within range
    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: sinceDate } },
      select: {
        id: true,
        createdAt: true,
        amount: true,
        status: true,
        service: {
          select: {
            category: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 2. Aggregate Bookings & Revenue over time (grouped by date YYYY-MM-DD)
    const timeMap: Record<string, { date: string; bookings: number; revenue: number; completed: number }> = {};

    // Initialize date buckets for continuous time series
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      timeMap[key] = { date: key, bookings: 0, revenue: 0, completed: 0 };
    }

    bookings.forEach((b) => {
      const dateKey = b.createdAt.toISOString().split('T')[0];
      if (!timeMap[dateKey]) {
        timeMap[dateKey] = { date: dateKey, bookings: 0, revenue: 0, completed: 0 };
      }
      timeMap[dateKey].bookings += 1;
      if (b.status === BookingStatus.COMPLETED) {
        timeMap[dateKey].revenue += b.amount;
        timeMap[dateKey].completed += 1;
      }
    });

    const timeSeries = Object.values(timeMap).map((item) => ({
      ...item,
      revenue: Number(item.revenue.toFixed(2)),
    }));

    // 3. Booking Status Breakdown
    const statusCounts = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const statusBreakdown = statusCounts.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    // 4. Service Category Breakdown
    const services = await prisma.serviceItem.findMany({
      include: {
        _count: { select: { bookings: true } },
        bookings: {
          where: { status: BookingStatus.COMPLETED },
          select: { amount: true },
        },
      },
    });

    const categoryMap: Record<string, { category: string; count: number; revenue: number }> = {};
    services.forEach((s) => {
      if (!categoryMap[s.category]) {
        categoryMap[s.category] = { category: s.category, count: 0, revenue: 0 };
      }
      categoryMap[s.category].count += s._count.bookings;
      categoryMap[s.category].revenue += s.bookings.reduce((acc, b) => acc + b.amount, 0);
    });

    const categoryBreakdown = Object.values(categoryMap).map((cat) => ({
      ...cat,
      revenue: Number(cat.revenue.toFixed(2)),
    }));

    // 5. Recent Activity Logs (Live stream)
    const recentLogs = await prisma.bookingLog.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            bookingNumber: true,
            vehicleMake: true,
            vehicleModel: true,
            customer: { select: { name: true } },
            mechanic: { select: { name: true } },
          },
        },
      },
    });

    return {
      timeSeries,
      statusBreakdown,
      categoryBreakdown,
      recentLogs,
    };
  }
}
