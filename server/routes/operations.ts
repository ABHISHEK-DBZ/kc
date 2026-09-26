import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, resolveUserScope } from '../middleware/auth.js';

const router = Router();

// Helper to filter by allowedShopIds for child tables
function buildShopFilter(scope: ReturnType<typeof resolveUserScope>, column = 'shop_id') {
  if (scope.isGlobal) {
    return { clause: '1=1', params: [] as any[] };
  }
  if (!scope.allowedShopIds || scope.allowedShopIds.length === 0) {
    return { clause: '1=0', params: [] as any[] };
  }
  const placeholders = scope.allowedShopIds.map(() => '?').join(',');
  return { clause: `${column} IN (${placeholders})`, params: scope.allowedShopIds };
}

// GET /api/customers
router.get('/customers', authenticateToken, (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    const { clause, params } = buildShopFilter(scope, 'shop_id');
    const customers = db.prepare(`SELECT * FROM customers WHERE ${clause} ORDER BY total_udhaar DESC`).all(...params);
    res.json(customers);
  } catch (err: any) {
    console.error('[GET /api/customers Error]', err);
    res.status(500).json({ error: 'Failed to retrieve customers directory' });
  }
});

// GET /api/sales
router.get('/sales', authenticateToken, (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    const { clause, params } = buildShopFilter(scope, 'shop_id');
    const sales = db.prepare(`SELECT * FROM daily_sales WHERE ${clause} ORDER BY date DESC`).all(...params);
    res.json(sales);
  } catch (err: any) {
    console.error('[GET /api/sales Error]', err);
    res.status(500).json({ error: 'Failed to retrieve daily sales' });
  }
});

// GET /api/inventory
router.get('/inventory', authenticateToken, (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    const { clause, params } = buildShopFilter(scope, 'shop_id');
    const items = db.prepare(`SELECT * FROM inventory_items WHERE ${clause} ORDER BY estimated_stockout_days ASC`).all(...params);
    res.json(items);
  } catch (err: any) {
    console.error('[GET /api/inventory Error]', err);
    res.status(500).json({ error: 'Failed to retrieve inventory items' });
  }
});

// GET /api/udhaar
router.get('/udhaar', authenticateToken, (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    const { clause, params } = buildShopFilter(scope, 'shop_id');
    const records = db.prepare(`SELECT * FROM udhaar_records WHERE ${clause} ORDER BY days_outstanding DESC`).all(...params);
    res.json(records);
  } catch (err: any) {
    console.error('[GET /api/udhaar Error]', err);
    res.status(500).json({ error: 'Failed to retrieve udhaar records' });
  }
});

// GET /api/staff-activities
router.get('/staff-activities', authenticateToken, (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    const { clause, params } = buildShopFilter(scope, 'shop_id');
    const activities = db.prepare(`SELECT * FROM staff_activities WHERE ${clause} ORDER BY id DESC LIMIT 50`).all(...params);
    res.json(activities);
  } catch (err: any) {
    console.error('[GET /api/staff-activities Error]', err);
    res.status(500).json({ error: 'Failed to retrieve staff activities' });
  }
});

export default router;
