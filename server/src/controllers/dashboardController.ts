import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService.js';
import { sendSuccess } from '../utils/response.js';

export class DashboardController {
  static async getOverviewStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getOverviewStats();
      return sendSuccess(res, stats, 'Dashboard KPI metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const analytics = await DashboardService.getAnalyticsData(days);
      return sendSuccess(res, analytics, 'Dashboard analytics data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
