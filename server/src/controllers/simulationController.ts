import { Request, Response, NextFunction } from 'express';
import { SimulationService } from '../services/simulationService.js';
import { sendSuccess } from '../utils/response.js';

export class SimulationController {
  static getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = SimulationService.getStatus();
      return sendSuccess(res, status, 'Simulation status retrieved');
    } catch (error) {
      next(error);
    }
  }

  static start(req: Request, res: Response, next: NextFunction) {
    try {
      const intervalMs = req.body.intervalMs ? parseInt(req.body.intervalMs, 10) : 6000;
      const result = SimulationService.start(intervalMs);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static stop(req: Request, res: Response, next: NextFunction) {
    try {
      const result = SimulationService.stop();
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}
