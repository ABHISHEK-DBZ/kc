import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/supabase/status - Check Supabase connection & configuration status
router.get('/status', (req: Request, res: Response) => {
  const status = supabaseService.getStatus();
  res.json({
    status: 'ok',
    supabase: status
  });
});

// POST /api/supabase/test - Test live connection
router.post('/test', async (req: Request, res: Response) => {
  const result = await supabaseService.testConnection();
  res.json(result);
});

// POST /api/supabase/sync - Trigger sync between local store and Supabase (HQ / IT Lead only)
router.post('/sync', authenticateToken, requireRole('HQ_OWNER', 'HQ_IT'), async (req: Request, res: Response) => {
  const syncResult = await supabaseService.syncToSupabase();
  res.json(syncResult);
});

export default router;
