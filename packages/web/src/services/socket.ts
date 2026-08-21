import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const serverUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3333');

    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Passfy WebSocket] Conectado com sucesso:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ [Passfy WebSocket] Desconectado:', reason);
    });
  }

  return socket;
};
