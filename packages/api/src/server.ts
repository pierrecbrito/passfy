import http from 'http';
import { app } from './app';
import { SocketService } from './core/websocket/socketServer';

const PORT = process.env.PORT || 3333;

const server = http.createServer(app);

// Initialize WebSocket Service with Socket.IO
SocketService.initialize(server);

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Passfy API server is running on port ${PORT}`);
  console.log(`⚡ WebSocket is active and listening for real-time seat synchronization`);
});
