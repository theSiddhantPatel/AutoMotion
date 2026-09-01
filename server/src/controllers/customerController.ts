import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customerService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const { customers, meta } = await CustomerService.getCustomers(search, page, limit);
      return sendSuccess(res, customers, 'Customers retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);
      if (!customer) {
        return sendError(res, 'Customer not found', 404);
      }
      return sendSuccess(res, customer, 'Customer details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
