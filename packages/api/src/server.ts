import http from 'http';
import { app } from './app';
import { SocketService } from './core/websocket/socketServer';

const PORT = process.env.PORT || 3333;

const server = http.createServer(app);

// Initialize WebSocket Service with Socket.IO
SocketService.initialize(server);

server.listen(PORT, () => {
  console.log(`🚀 Passfy API server is running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket is active and listening for real-time seat synchronization`);
});
