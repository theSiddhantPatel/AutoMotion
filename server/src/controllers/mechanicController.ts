import { Request, Response, NextFunction } from 'express';
import { MechanicService } from '../services/mechanicService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { MechanicStatus } from '@prisma/client';

export class MechanicController {
  static async getAllMechanics(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as MechanicStatus | undefined;
      const mechanics = await MechanicService.getAllMechanics(status);
      return sendSuccess(res, mechanics, 'Mechanics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMechanicById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mechanic = await MechanicService.getMechanicById(id);
      if (!mechanic) {
        return sendError(res, 'Mechanic not found', 404);
      }
      return sendSuccess(res, mechanic, 'Mechanic details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateMechanicStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, lat, lng } = req.body;
      const updated = await MechanicService.updateMechanicStatus(id, status, lat, lng);
      return sendSuccess(res, updated, 'Mechanic updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
