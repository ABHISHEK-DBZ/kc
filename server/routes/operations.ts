import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, resolveUserScope, enforceShopAccess } from '../middleware/auth.js';
import { inventoryRecommendationEngine } from '../services/inventoryRecommendationEngine.js';
import { realtimeHub } from '../services/realtimeHub.js';

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

// =========================================================================
// AI PURCHASE RECOMMENDATIONS / SMART REORDER INTELLIGENCE
// =========================================================================

// GET /api/inventory/recommendations - Retrieve all smart recommendations scoped by role
router.get('/inventory/recommendations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    const { clause, params } = buildShopFilter(scope, 'shop_id');

    // If table is empty or needs baseline generation, compute dynamically
    const countRow = db.prepare(`SELECT COUNT(*) as c FROM inventory_recommendations WHERE ${clause}`).get(...params) as { c: number };
    if (countRow.c === 0) {
      await inventoryRecommendationEngine.generateAndPersistRecommendations(
        undefined,
        scope.isGlobal ? undefined : (scope.allowedShopIds?.[0])
      );
    }

    const query = `
      SELECT * FROM inventory_recommendations 
      WHERE ${clause}
      ORDER BY 
        CASE recommendation_type 
          WHEN 'URGENT_REORDER' THEN 1 
          WHEN 'BUY_MORE' THEN 2 
          WHEN 'BUY_NOW' THEN 3 
          WHEN 'BUY_NORMAL' THEN 4 
          WHEN 'WAIT' THEN 5 
          WHEN 'SLOW_MOVING' THEN 6 
          WHEN 'DO_NOT_BUY' THEN 7 
          WHEN 'OVERSTOCK_RISK' THEN 8 
          ELSE 9 
        END ASC,
        profit_opportunity DESC,
        stock_coverage_days ASC
    `;

    const rows = db.prepare(query).all(...params) as any[];
    const recommendations = rows.map((r) => ({
      ...r,
      formula_breakdown: r.formula_breakdown ? JSON.parse(r.formula_breakdown) : null,
      signals: r.signals ? JSON.parse(r.signals) : null
    }));

    res.json(recommendations);
  } catch (err: any) {
    console.error('[GET /api/inventory/recommendations Error]', err);
    res.status(500).json({ error: 'Failed to retrieve inventory recommendations' });
  }
});

// GET /api/inventory/recommendations/:id - Retrieve detail for single recommendation
router.get('/inventory/recommendations/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const recId = req.params.id;
    const rec = db.prepare('SELECT * FROM inventory_recommendations WHERE id = ?').get(recId) as any;
    if (!rec) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }

    if (!enforceShopAccess(req.user!, rec.shop_id)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    rec.formula_breakdown = rec.formula_breakdown ? JSON.parse(rec.formula_breakdown) : null;
    rec.signals = rec.signals ? JSON.parse(rec.signals) : null;
    res.json(rec);
  } catch (err: any) {
    console.error('[GET /api/inventory/recommendations/:id Error]', err);
    res.status(500).json({ error: 'Failed to retrieve recommendation detail' });
  }
});

// POST /api/inventory/recommendations/:id/create-po - Convert recommendation into real Purchase Order draft
router.post('/inventory/recommendations/:id/create-po', authenticateToken, (req: AuthRequest, res) => {
  try {
    const recId = req.params.id;
    const rec = db.prepare('SELECT * FROM inventory_recommendations WHERE id = ?').get(recId) as any;
    if (!rec) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }

    if (!enforceShopAccess(req.user!, rec.shop_id)) {
      res.status(403).json({ error: 'Forbidden: You do not possess access to this branch.' });
      return;
    }

    const requestedQty = req.body.quantity !== undefined ? Number(req.body.quantity) : rec.suggested_order_qty;
    if (requestedQty <= 0) {
      res.status(400).json({ error: 'Purchase order quantity must be greater than zero.' });
      return;
    }

    const totalAmount = Math.round(requestedQty * rec.cost_price);
    const poId = `PO-2026-REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const taskId = `task-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const poReason = req.body.reason || `AI Recommendation (${rec.recommendation_type}): ${rec.reason}`;

    // 1. Create Purchase Order in Draft / Awaiting Approval status
    db.prepare(`
      INSERT INTO purchase_orders (
        id, task_id, shop_id, shop_name, product_name, sku_id, quantity, unit,
        unit_price, total_amount, supplier, reason, current_stock, sales_velocity,
        days_remaining, created_by, status, recommendation_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Awaiting Approval', ?, datetime('now'), datetime('now'))
    `).run(
      poId, taskId, rec.shop_id, rec.shop_name, rec.product_name, rec.sku_id,
      requestedQty, rec.unit || 'units', rec.cost_price, totalAmount, rec.supplier,
      poReason, rec.current_stock, rec.sales_velocity, rec.stock_coverage_days,
      `AI Smart Reorder (${req.user!.name})`, recId
    );

    // 2. Create Agent Task
    db.prepare(`
      INSERT INTO agent_tasks (
        id, agent_id, shop_id, shop_name, priority, status, title,
        description, evidence, recommendation, action_type, action_payload,
        approval_required, idempotency_key, created_at, updated_at
      ) VALUES (?, 'inventory', ?, ?, 'High', 'AWAITING_APPROVAL', ?, ?, ?, ?, 'PURCHASE_ORDER_DRAFT', ?, 1, ?, datetime('now'), datetime('now'))
      ON CONFLICT(idempotency_key) DO UPDATE SET updated_at = datetime('now')
    `).run(
      taskId, rec.shop_id, rec.shop_name,
      `Smart PO Draft: ${rec.product_name} (${requestedQty} ${rec.unit})`,
      poReason,
      rec.signals || JSON.stringify({ currentStock: rec.current_stock, velocity: rec.sales_velocity, runway: rec.stock_coverage_days }),
      `Approve PO #${poId} for distributor dispatch`,
      JSON.stringify({ poId, skuId: rec.sku_id, qty: requestedQty, totalAmount }),
      `po-rec-${rec.id}`
    );

    // 3. Update Recommendation status to ORDERED
    db.prepare(`
      UPDATE inventory_recommendations 
      SET status = 'ORDERED', po_draft_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(poId, recId);

    // 4. Audit Log
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata)
      VALUES (?, ?, ?, ?, 'purchase_order.draft_created', 'purchase_orders', ?, ?)
    `).run(
      'aud-' + Date.now(), req.user!.id, req.user!.name, req.user!.role, poId,
      JSON.stringify({ recommendation_id: recId, quantity: requestedQty, total_amount: totalAmount, shop_id: rec.shop_id })
    );

    // 5. Broadcast Realtime Events
    realtimeHub.broadcast('PURCHASE_ORDER_CREATED', { id: poId, shop_id: rec.shop_id, amount: totalAmount }, rec.shop_id);
    realtimeHub.broadcast('TASK_CREATED', { id: taskId, shop_id: rec.shop_id, title: `PO Draft: ${rec.product_name}` }, rec.shop_id);
    realtimeHub.broadcast('INVENTORY_RECOMMENDATIONS_UPDATED', { shop_id: rec.shop_id, updatedRecId: recId }, rec.shop_id);

    const createdPO = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(poId);
    res.status(201).json({
      message: `Purchase order draft #${poId} successfully generated for human approval.`,
      purchaseOrder: createdPO,
      recommendationId: recId
    });
  } catch (err: any) {
    console.error('[POST /api/inventory/recommendations/:id/create-po Error]', err);
    res.status(500).json({ error: err.message || 'Failed to create purchase order from recommendation' });
  }
});

// POST /api/inventory/recommendations/:id/dismiss
router.post('/inventory/recommendations/:id/dismiss', authenticateToken, (req: AuthRequest, res) => {
  try {
    const recId = req.params.id;
    const rec = db.prepare('SELECT * FROM inventory_recommendations WHERE id = ?').get(recId) as any;
    if (!rec) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }

    if (!enforceShopAccess(req.user!, rec.shop_id)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    db.prepare("UPDATE inventory_recommendations SET status = 'DISMISSED', updated_at = datetime('now') WHERE id = ?").run(recId);
    realtimeHub.broadcast('INVENTORY_RECOMMENDATIONS_UPDATED', { shop_id: rec.shop_id, dismissedRecId: recId }, rec.shop_id);

    res.json({ message: 'Recommendation dismissed', id: recId });
  } catch (err: any) {
    console.error('[POST /api/inventory/recommendations/:id/dismiss Error]', err);
    res.status(500).json({ error: 'Failed to dismiss recommendation' });
  }
});

// POST /api/inventory/recommendations/recalculate - Force re-analysis of all products
router.post('/inventory/recommendations/recalculate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    const recs = await inventoryRecommendationEngine.generateAndPersistRecommendations(
      undefined,
      scope.isGlobal ? undefined : (scope.allowedShopIds?.[0])
    );
    res.json({ message: 'Inventory recommendations successfully recalculated', count: recs.length });
  } catch (err: any) {
    console.error('[POST /api/inventory/recommendations/recalculate Error]', err);
    res.status(500).json({ error: 'Failed to recalculate recommendations' });
  }
});

export default router;

