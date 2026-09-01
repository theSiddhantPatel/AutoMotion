import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('🟢 Connected to AutoMotion Real-Time WebSocket Server [id=' + socket?.id + ']');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Disconnected from WebSocket Server:', reason);
    });
  }

  return socket;
}
