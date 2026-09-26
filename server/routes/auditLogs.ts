import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/audit-logs - Immutable Enterprise Audit Trail
router.get('/', authenticateToken, requireRole('HQ_OWNER', 'HQ_IT'), (req: AuthRequest, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all() as any[];

    const parsed = logs.map(l => ({
      ...l,
      metadata: l.metadata ? JSON.parse(l.metadata) : null
    }));

    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve audit trail' });
  }
});

export default router;
