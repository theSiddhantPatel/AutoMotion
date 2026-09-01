import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/bookingService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { BookingQueryParams, CreateBookingInput, UpdateBookingStatusInput } from '../types/index.js';

export class BookingController {
  static async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const queryParams = req.query as unknown as BookingQueryParams;
      const { bookings, meta } = await BookingService.getBookings(queryParams);
      return sendSuccess(res, bookings, 'Bookings retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  static async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const booking = await BookingService.getBookingById(id);
      if (!booking) {
        return sendError(res, 'Booking not found', 404);
      }
      return sendSuccess(res, booking, 'Booking details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as CreateBookingInput;
      const newBooking = await BookingService.createBooking(input);
      return sendSuccess(res, newBooking, 'Booking created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = req.body as UpdateBookingStatusInput;
      const updated = await BookingService.updateBookingStatus(id, input);
      if (!updated) {
        return sendError(res, 'Booking not found', 404);
      }
      return sendSuccess(res, updated, 'Booking status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
