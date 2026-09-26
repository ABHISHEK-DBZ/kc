import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, resolveUserScope, requireRole } from '../middleware/auth.js';
import { realtimeHub } from '../services/realtimeHub.js';

const router = Router();

// GET /api/purchase-orders - Scoped list of POs
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    let query = 'SELECT * FROM purchase_orders';
    let params: any[] = [];

    if (!scope.isGlobal) {
      if (!scope.allowedShopIds || scope.allowedShopIds.length === 0) {
        res.json([]);
        return;
      }
      const placeholders = scope.allowedShopIds.map(() => '?').join(',');
      query += ` WHERE shop_id IN (${placeholders})`;
      params = scope.allowedShopIds;
    }

    query += ' ORDER BY created_at DESC';
    const pos = db.prepare(query).all(...params);
    res.json(pos);
  } catch (err: any) {
    console.error('[PO GET Error]', err);
    res.status(500).json({ error: 'Failed to retrieve purchase orders' });
  }
});

// POST /api/purchase-orders/:id/approve - Approve PO
router.post('/:id/approve', authenticateToken, requireRole('HQ_OWNER', 'AREA_MANAGER', 'FRANCHISE_OWNER'), (req: AuthRequest, res) => {
  try {
    const poId = req.params.id;
    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(poId) as any;

    if (!po) {
      res.status(404).json({ error: 'Purchase order not found' });
      return;
    }

    const approvedAt = new Date().toISOString();
    const approvedBy = `${req.user!.name} (${req.user!.role})`;

    db.prepare(`
      UPDATE purchase_orders
      SET status = 'Approved', approved_by = ?, approved_at = ?, updated_at = ?
      WHERE id = ?
    `).run(approvedBy, approvedAt, approvedAt, poId);

    // If associated task, complete it
    if (po.task_id) {
      db.prepare(`
        UPDATE agent_tasks
        SET status = 'COMPLETED', approved_by = ?, approved_at = ?, updated_at = ?
        WHERE id = ?
      `).run(approvedBy, approvedAt, approvedAt, po.task_id);
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata)
      VALUES (?, ?, ?, ?, 'purchase_order.approved', 'purchase_orders', ?, ?)
    `).run(
      'aud-' + Date.now(), req.user!.id, req.user!.name, req.user!.role, poId,
      JSON.stringify({ shop_id: po.shop_id, amount: po.total_amount, sku: po.product_name })
    );

    realtimeHub.broadcast('PURCHASE_ORDER_APPROVED', { id: poId, shop_id: po.shop_id, approvedBy }, po.shop_id);

    res.json({
      success: true,
      message: `Purchase Order #${poId} approved.`,
      po: { ...po, status: 'Approved', approved_by: approvedBy, approved_at: approvedAt }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to approve purchase order' });
  }
});

// POST /api/purchase-orders/:id/reject
router.post('/:id/reject', authenticateToken, requireRole('HQ_OWNER', 'AREA_MANAGER', 'FRANCHISE_OWNER'), (req: AuthRequest, res) => {
  try {
    const poId = req.params.id;
    const { reason } = req.body;

    db.prepare(`
      UPDATE purchase_orders
      SET status = 'Rejected', rejection_reason = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(reason || 'Rejected by authorized personnel', poId);

    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata)
      VALUES (?, ?, ?, ?, 'purchase_order.rejected', 'purchase_orders', ?, ?)
    `).run('aud-' + Date.now(), req.user!.id, req.user!.name, req.user!.role, poId, JSON.stringify({ reason }));

    realtimeHub.broadcast('PURCHASE_ORDER_REJECTED', { id: poId, reason });

    res.json({ success: true, message: `Purchase Order #${poId} rejected.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reject purchase order' });
  }
});

export default router;
