import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, resolveUserScope, enforceShopAccess, requireRole } from '../middleware/auth.js';
import { realtimeHub } from '../services/realtimeHub.js';

const router = Router();

// GET /api/shops - Returns shops authorized for the current user's role
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    let query = 'SELECT * FROM shops';
    let params: any[] = [];

    if (!scope.isGlobal) {
      if (!scope.allowedShopIds || scope.allowedShopIds.length === 0) {
        res.json([]);
        return;
      }
      const placeholders = scope.allowedShopIds.map(() => '?').join(',');
      query += ` WHERE id IN (${placeholders})`;
      params = scope.allowedShopIds;
    }

    query += ' ORDER BY health_score ASC'; // At-risk first
    const rows = db.prepare(query).all(...params) as any[];

    // Parse JSON health_reasons
    const shops = rows.map(r => ({
      ...r,
      health_reasons: r.health_reasons ? JSON.parse(r.health_reasons) : []
    }));

    res.json(shops);
  } catch (err: any) {
    console.error('[Shops GET Error]', err);
    res.status(500).json({ error: 'Failed to retrieve shops' });
  }
});

// GET /api/shops/:id - Retrieve specific shop with strict permission check
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const shopId = req.params.id;

    if (!enforceShopAccess(req.user!, shopId)) {
      res.status(403).json({
        error: 'Forbidden: You do not possess permissions to inspect this retail branch.',
        role: req.user!.role,
        shopId
      });
      return;
    }

    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopId) as any;
    if (!shop) {
      res.status(404).json({ error: 'Shop not found' });
      return;
    }

    shop.health_reasons = shop.health_reasons ? JSON.parse(shop.health_reasons) : [];
    res.json(shop);
  } catch (err: any) {
    console.error('[Shop GET :id Error]', err);
    res.status(500).json({ error: 'Failed to load shop profile' });
  }
});

// POST /api/shops - Provision new shop (HQ_OWNER only)
router.post('/', authenticateToken, requireRole('HQ_OWNER'), (req: AuthRequest, res) => {
  try {
    const { name, location, city, region, manager_name, owner_contact, store_size_sqft } = req.body;

    if (!name || !city || !region) {
      res.status(400).json({ error: 'Missing required shop parameters' });
      return;
    }

    const shopId = `shop-${Math.floor(10 + Math.random() * 90)}`;
    const regionId = region === 'West' ? 'reg-west' : (region === 'North' ? 'reg-north' : 'reg-south');

    db.prepare(`
      INSERT INTO shops (
        id, name, location, city, region, region_id, manager_name, owner_contact,
        store_size_sqft, status, health_score, daily_revenue, monthly_revenue,
        daily_profit, monthly_profit, profit_margin_pct, udhaar_outstanding,
        stock_alert_count, cash_variance_today, cash_expected_today, cash_actual_today
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Healthy', 95, 0, 0, 0, 0, 15.0, 0, 0, 0, 0, 0)
    `).run(
      shopId, name, location || city, city, region, regionId, manager_name || 'Assigned Manager',
      owner_contact || '+91 98000 00000', store_size_sqft || 1500
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata)
      VALUES (?, ?, ?, ?, 'shop.created', 'shops', ?, ?)
    `).run('aud-' + Date.now(), req.user!.id, req.user!.name, req.user!.role, shopId, JSON.stringify({ name, city, region }));

    const newShop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopId) as any;
    newShop.health_reasons = [];

    realtimeHub.broadcast('SHOP_CREATED', newShop);

    res.status(201).json(newShop);
  } catch (err: any) {
    console.error('[Shop Create Error]', err);
    res.status(500).json({ error: 'Failed to create shop' });
  }
});

// GET /api/shops/:id/sales - 30-day sales for this store
router.get('/:id/sales', authenticateToken, (req: AuthRequest, res) => {
  const shopId = req.params.id;
  if (!enforceShopAccess(req.user!, shopId)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const sales = db.prepare('SELECT * FROM daily_sales WHERE shop_id = ? ORDER BY date ASC').all(shopId);
  res.json(sales);
});

// GET /api/shops/:id/inventory - Inventory for this store
router.get('/:id/inventory', authenticateToken, (req: AuthRequest, res) => {
  const shopId = req.params.id;
  if (!enforceShopAccess(req.user!, shopId)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const items = db.prepare('SELECT * FROM inventory_items WHERE shop_id = ? ORDER BY estimated_stockout_days ASC').all(shopId);
  res.json(items);
});

// GET /api/shops/:id/udhaar - Udhaar for this store
router.get('/:id/udhaar', authenticateToken, (req: AuthRequest, res) => {
  const shopId = req.params.id;
  if (!enforceShopAccess(req.user!, shopId)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const records = db.prepare('SELECT * FROM udhaar_records WHERE shop_id = ? ORDER BY days_outstanding DESC').all(shopId);
  res.json(records);
});

export default router;
