import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', DashboardController.getOverviewStats);
router.get('/analytics', DashboardController.getAnalytics);

export default router;
