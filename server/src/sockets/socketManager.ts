import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config/index.js';

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow connections from frontend and test environments
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected to WebSocket [id=${socket.id}]`);

    socket.on('join:room', (room: string) => {
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Client disconnected [id=${socket.id}] reason: ${reason}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocketServer first.');
  }
  return io;
}

// Helper broadcast functions
export const realtime = {
  broadcastBookingCreated: (booking: any) => {
    if (io) {
      io.emit('booking:created', booking);
      console.log(`📡 Broadcasted event [booking:created] #${booking.bookingNumber}`);
    }
  },

  broadcastBookingUpdated: (booking: any, previousStatus?: string) => {
    if (io) {
      io.emit('booking:updated', { booking, previousStatus });
      console.log(`📡 Broadcasted event [booking:updated] #${booking.bookingNumber} -> ${booking.status}`);
    }
  },

  broadcastMechanicStatus: (mechanicId: string, status: string, location?: { lat: number; lng: number }) => {
    if (io) {
      io.emit('mechanic:status_updated', { mechanicId, status, location });
    }
  },

  broadcastStatsUpdated: (stats: any) => {
    if (io) {
      io.emit('dashboard:stats_updated', stats);
    }
  },
};
