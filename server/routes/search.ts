import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, resolveUserScope } from '../middleware/auth.js';

const router = Router();

// GET /api/search?q=... - Global search across authorized entities
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    if (!q || q.length < 2) {
      res.json({ shops: [], products: [], customers: [], issues: [], tasks: [] });
      return;
    }

    const scope = resolveUserScope(req.user!);
    const pattern = `%${q}%`;

    let shopWhere = '1=1';
    let params: any[] = [];
    if (!scope.isGlobal) {
      if (!scope.allowedShopIds || scope.allowedShopIds.length === 0) {
        res.json({ shops: [], products: [], customers: [], issues: [], tasks: [] });
        return;
      }
      const placeholders = scope.allowedShopIds.map(() => '?').join(',');
      shopWhere = `id IN (${placeholders})`;
      params = scope.allowedShopIds;
    }

    // 1. Shops
    const shops = db.prepare(`
      SELECT id, name, city, region, status, health_score
      FROM shops 
      WHERE (name LIKE ? OR city LIKE ? OR location LIKE ?) AND (${shopWhere})
      LIMIT 5
    `).all(pattern, pattern, pattern, ...params);

    // 2. Inventory / Products
    const products = db.prepare(`
      SELECT i.id, i.item_name, i.category, i.current_stock, i.estimated_stockout_days, s.name as shop_name
      FROM inventory_items i
      JOIN shops s ON i.shop_id = s.id
      WHERE (i.item_name LIKE ? OR i.category LIKE ?) AND (${shopWhere.replace(/id/g, 's.id')})
      LIMIT 5
    `).all(pattern, pattern, ...params);

    // 3. Customers
    const customers = db.prepare(`
      SELECT c.id, c.name, c.phone, c.total_udhaar, c.days_outstanding, s.name as shop_name
      FROM customers c
      JOIN shops s ON c.shop_id = s.id
      WHERE (c.name LIKE ? OR c.phone LIKE ?) AND (${shopWhere.replace(/id/g, 's.id')})
      LIMIT 5
    `).all(pattern, pattern, ...params);

    // 4. Community Issues & Known Issues
    const issues = db.prepare(`
      SELECT id, title, category, status, author_name
      FROM community_posts
      WHERE title LIKE ? OR content LIKE ?
      LIMIT 5
    `).all(pattern, pattern);

    // 5. Agent Tasks
    const tasks = db.prepare(`
      SELECT t.id, t.agent_id, t.title, t.priority, t.status, s.name as shop_name
      FROM agent_tasks t
      JOIN shops s ON t.shop_id = s.id
      WHERE (t.title LIKE ? OR t.description LIKE ?) AND (${shopWhere.replace(/id/g, 's.id')})
      LIMIT 5
    `).all(pattern, pattern, ...params);

    res.json({ shops, products, customers, issues, tasks });
  } catch (err: any) {
    console.error('[Search Error]', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
