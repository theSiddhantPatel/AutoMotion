import { prisma } from './prisma.js';
import { BookingStatus, MechanicStatus } from '@prisma/client';
import { realtime } from '../sockets/socketManager.js';
import { DashboardService } from './dashboardService.js';

export class SimulationService {
  private static isRunning = false;
  private static timer: NodeJS.Timeout | null = null;
  private static intervalMs = 6000; // Tick every 6 seconds

  static getStatus() {
    return {
      running: this.isRunning,
      intervalMs: this.intervalMs,
    };
  }

  static start(intervalMs = 6000) {
    if (this.isRunning) {
      return { message: 'Simulation is already running', running: true };
    }

    this.intervalMs = intervalMs;
    this.isRunning = true;
    console.log(`⚡ Live Operations Simulation STARTED (interval: ${this.intervalMs}ms)`);

    this.timer = setInterval(async () => {
      try {
        await this.stepSimulation();
      } catch (err) {
        console.error('Simulation step error:', err);
      }
    }, this.intervalMs);

    return { message: 'Simulation started successfully', running: true };
  }

  static stop() {
    if (!this.isRunning) {
      return { message: 'Simulation is not currently running', running: false };
    }

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.isRunning = false;
    console.log('🛑 Live Operations Simulation STOPPED');
    return { message: 'Simulation stopped successfully', running: false };
  }

  /**
   * Execute one tick of simulated vehicle service lifecycle
   */
  private static async stepSimulation() {
    // 1. Check for Pending bookings to Assign
    const pendingBooking = await prisma.booking.findFirst({
      where: { status: BookingStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });

    if (pendingBooking) {
      const availableMechanic = await prisma.mechanic.findFirst({
        where: { status: MechanicStatus.AVAILABLE },
      });

      if (availableMechanic) {
        const updated = await prisma.booking.update({
          where: { id: pendingBooking.id },
          data: {
            status: BookingStatus.ASSIGNED,
            mechanicId: availableMechanic.id,
            logs: {
              create: {
                status: BookingStatus.ASSIGNED,
                message: `Auto-dispatched to mechanic ${availableMechanic.name}.`,
              },
            },
          },
          include: {
            customer: true,
            mechanic: true,
            service: true,
          },
        });

        await prisma.mechanic.update({
          where: { id: availableMechanic.id },
          data: { status: MechanicStatus.BUSY },
        });

        realtime.broadcastBookingUpdated(updated, BookingStatus.PENDING);
        const stats = await DashboardService.getOverviewStats();
        realtime.broadcastStatsUpdated(stats);
        return;
      }
    }

    // 2. Check for Assigned booking to move to EN_ROUTE
    const assignedBooking = await prisma.booking.findFirst({
      where: { status: BookingStatus.ASSIGNED },
      orderBy: { scheduledAt: 'asc' },
    });

    if (assignedBooking) {
      const updated = await prisma.booking.update({
        where: { id: assignedBooking.id },
        data: {
          status: BookingStatus.EN_ROUTE,
          logs: {
            create: {
              status: BookingStatus.EN_ROUTE,
              message: 'Mechanic is en route with mobile service unit.',
            },
          },
        },
        include: { customer: true, mechanic: true, service: true },
      });

      realtime.broadcastBookingUpdated(updated, BookingStatus.ASSIGNED);
      return;
    }

    // 3. Check for EN_ROUTE booking to move to IN_PROGRESS
    const enRouteBooking = await prisma.booking.findFirst({
      where: { status: BookingStatus.EN_ROUTE },
      orderBy: { scheduledAt: 'asc' },
    });

    if (enRouteBooking) {
      const updated = await prisma.booking.update({
        where: { id: enRouteBooking.id },
        data: {
          status: BookingStatus.IN_PROGRESS,
          logs: {
            create: {
              status: BookingStatus.IN_PROGRESS,
              message: 'Mechanic arrived on site. Vehicle service initiated.',
            },
          },
        },
        include: { customer: true, mechanic: true, service: true },
      });

      realtime.broadcastBookingUpdated(updated, BookingStatus.EN_ROUTE);
      return;
    }

    // 4. Check for IN_PROGRESS booking to Complete
    const inProgressBooking = await prisma.booking.findFirst({
      where: { status: BookingStatus.IN_PROGRESS },
      orderBy: { scheduledAt: 'asc' },
    });

    if (inProgressBooking) {
      const updated = await prisma.booking.update({
        where: { id: inProgressBooking.id },
        data: {
          status: BookingStatus.COMPLETED,
          completedAt: new Date(),
          logs: {
            create: {
              status: BookingStatus.COMPLETED,
              message: 'Vehicle service successfully completed. QA signoff recorded.',
            },
          },
        },
        include: { customer: true, mechanic: true, service: true },
      });

      if (updated.mechanicId) {
        await prisma.mechanic.update({
          where: { id: updated.mechanicId },
          data: {
            status: MechanicStatus.AVAILABLE,
            completedJobs: { increment: 1 },
          },
        });
      }

      realtime.broadcastBookingUpdated(updated, BookingStatus.IN_PROGRESS);
      const stats = await DashboardService.getOverviewStats();
      realtime.broadcastStatsUpdated(stats);
      return;
    }
  }
}
