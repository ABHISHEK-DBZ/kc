import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import { initDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';

import authRoutes from './routes/auth.js';
import shopsRoutes from './routes/shops.js';
import analyticsRoutes from './routes/analytics.js';
import agentsRoutes from './routes/agents.js';
import communityRoutes from './routes/community.js';
import purchaseOrdersRoutes from './routes/purchaseOrders.js';
import reportsRoutes from './routes/reports.js';
import realtimeRoutes from './routes/realtime.js';
import auditLogsRoutes from './routes/auditLogs.js';
import searchRoutes from './routes/search.js';
import operationsRoutes from './routes/operations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Baseline Security & Middleware
app.use(cors({
  origin: true, // Allow frontend dev server and production origins
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'KhataCopilot HQ Autonomous Retail Backend',
    version: '2.4.0'
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', operationsRoutes);

// Structured Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// Boot Database & Start Server
async function startServer() {
  try {
    initDatabase();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` KhataCopilot HQ Enterprise Backend Running`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(` Realtime SSE: http://localhost:${PORT}/api/realtime`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('[Server Boot Error]', err);
    process.exit(1);
  }
}

startServer();
