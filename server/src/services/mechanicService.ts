import { prisma } from './prisma.js';
import { BookingStatus, MechanicStatus } from '@prisma/client';
import { realtime } from '../sockets/socketManager.js';

export class MechanicService {
  /**
   * Get all mechanics with current status, active job, and statistics
   */
  static async getAllMechanics(statusFilter?: MechanicStatus) {
    const where = statusFilter ? { status: statusFilter } : {};

    const mechanics = await prisma.mechanic.findMany({
      where,
      orderBy: [{ status: 'asc' }, { rating: 'desc' }],
      include: {
        bookings: {
          where: {
            status: { in: [BookingStatus.ASSIGNED, BookingStatus.EN_ROUTE, BookingStatus.IN_PROGRESS] },
          },
          take: 1,
          orderBy: { scheduledAt: 'desc' },
          include: {
            service: { select: { name: true } },
            customer: { select: { name: true, phone: true } },
          },
        },
        _count: {
          select: {
            bookings: { where: { status: BookingStatus.COMPLETED } },
          },
        },
      },
    });

    return mechanics.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      avatar: m.avatar,
      specialization: m.specialization,
      status: m.status,
      rating: m.rating,
      completedJobs: m.completedJobs,
      location: m.currentLat && m.currentLng ? { lat: m.currentLat, lng: m.currentLng } : null,
      currentJob: m.bookings[0] || null,
      createdAt: m.createdAt,
    }));
  }

  /**
   * Get single mechanic detail with recent job history
   */
  static async getMechanicById(id: string) {
    const mechanic = await prisma.mechanic.findUnique({
      where: { id },
      include: {
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { name: true, phone: true } },
            service: { select: { name: true, category: true } },
          },
        },
      },
    });

    return mechanic;
  }

  /**
   * Update mechanic status or live location
   */
  static async updateMechanicStatus(id: string, status: MechanicStatus, lat?: number, lng?: number) {
    const updated = await prisma.mechanic.update({
      where: { id },
      data: {
        status,
        ...(lat !== undefined && { currentLat: lat }),
        ...(lng !== undefined && { currentLng: lng }),
      },
    });

    realtime.broadcastMechanicStatus(
      id,
      status,
      lat && lng ? { lat, lng } : undefined
    );

    return updated;
  }
}
