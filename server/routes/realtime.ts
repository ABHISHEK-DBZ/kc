import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, AuthenticatedUser } from '../middleware/auth.js';
import { realtimeHub } from '../services/realtimeHub.js';

const router = Router();

// GET /api/realtime - Server-Sent Events stream
router.get('/', (req, res) => {
  // Extract token from query or Authorization header
  let token = req.query.token as string;
  if (!token && req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Token required for SSE connection' });
    return;
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

    // Setup SSE HTTP headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    realtimeHub.addClient(clientId, user, res);

    req.on('close', () => {
      realtimeHub.removeClient(clientId);
    });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
});

export default router;
