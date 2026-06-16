import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import url from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';

import bookingRoutes from './routes/booking.routes';
import portalRoutes from './routes/portal.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import paymentRoutes from './routes/payment.routes';
import notificationRoutes from './routes/notification.routes';

import { errorHandler } from './middleware/error.middleware';
import { securityHeaders, rateLimiter } from './middleware/security.middleware';
import { NotificationService } from './services/notification.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(securityHeaders);
app.use(rateLimiter);

// Routes
app.use('/api', bookingRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', paymentRoutes);
app.use('/api', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

// Create HTTP server and bind WebSockets
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const JWT_SECRET = process.env.JWT_SECRET || 'golden_celebrations_secret_key_123_abc_xyz';

server.on('upgrade', (request, socket, head) => {
  const parsedUrl = url.parse(request.url || '', true);
  const token = parsedUrl.query.token as string;

  if (!token) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, decoded.id);
    });
  } catch (err) {
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    socket.destroy();
  }
});

wss.on('connection', (ws: WebSocket, userId: string) => {
  // Register in NotificationService connection pool
  NotificationService.registerConnection(userId, ws as any);

  ws.on('close', () => {
    NotificationService.unregisterConnection(userId, ws as any);
  });

  ws.on('error', (err) => {
    console.error(`WebSocket error for user/customer ${userId}:`, err);
    NotificationService.unregisterConnection(userId, ws as any);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
