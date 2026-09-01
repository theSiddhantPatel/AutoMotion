import { Router } from 'express';
import dashboardRoutes from './dashboardRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import mechanicRoutes from './mechanicRoutes.js';
import customerRoutes from './customerRoutes.js';
import simulationRoutes from './simulationRoutes.js';
import { prisma } from '../services/prisma.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  return sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  }, 'AutoMotion API is operating normally');
});

// Services Catalog endpoint
router.get('/services', async (req, res, next) => {
  try {
    const services = await prisma.serviceItem.findMany({
      orderBy: { category: 'asc' },
    });
    return sendSuccess(res, services, 'Service items retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// Mount domain routes
router.use('/dashboard', dashboardRoutes);
router.use('/bookings', bookingRoutes);
router.use('/mechanics', mechanicRoutes);
router.use('/customers', customerRoutes);
router.use('/simulation', simulationRoutes);

export default router;
