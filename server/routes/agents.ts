import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, resolveUserScope, requireRole } from '../middleware/auth.js';
import { agentOrchestrator } from '../services/agentOrchestrator.js';
import { realtimeHub } from '../services/realtimeHub.js';

const router = Router();

// GET /api/agents - List all 8 agents and their metrics
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const agents = db.prepare('SELECT * FROM agent_definitions').all() as any[];

    // Augment with last run info and pending task counts
    const enriched = agents.map(agent => {
      const lastRun = db.prepare(`
        SELECT * FROM agent_runs WHERE agent_id = ? ORDER BY started_at DESC LIMIT 1
      `).get(agent.id) as any;

      const taskStats = db.prepare(`
        SELECT 
          COUNT(*) as totalTasks,
          SUM(CASE WHEN status = 'AWAITING_APPROVAL' THEN 1 ELSE 0 END) as pendingApproval,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedTasks
        FROM agent_tasks WHERE agent_id = ?
      `).get(agent.id) as any;

      return {
        ...agent,
        last_run: lastRun || null,
        pending_approvals: taskStats?.pendingApproval || 0,
        total_tasks: taskStats?.totalTasks || 0,
        completed_tasks: taskStats?.completedTasks || 0
      };
    });

    res.json(enriched);
  } catch (err: any) {
    console.error('[Agents GET Error]', err);
    res.status(500).json({ error: 'Failed to fetch agent catalog' });
  }
});

// POST /api/agents/:id/run - Manual trigger [Run Agent Now]
router.post('/:id/run', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const agentId = req.params.id;
    const scope = resolveUserScope(req.user!);

    console.log(`[Agent API] Triggering agent ${agentId} by ${req.user!.email}`);

    // Execute server-side autonomous agent logic
    const runResult = await agentOrchestrator.executeAgent(
      agentId,
      'MANUAL',
      { allowedShopIds: scope.allowedShopIds },
      `${req.user!.name} (${req.user!.role})`
    );

    res.json(runResult);
  } catch (err: any) {
    console.error('[Agent Run Error]', err);
    res.status(500).json({ error: 'Agent execution failed: ' + err.message });
  }
});

// GET /api/agents/:id/runs - Past run history
router.get('/:id/runs', authenticateToken, (req: AuthRequest, res) => {
  try {
    const agentId = req.params.id;
    const runs = db.prepare(`
      SELECT * FROM agent_runs WHERE agent_id = ? ORDER BY started_at DESC LIMIT 20
    `).all(agentId);
    res.json(runs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch agent runs' });
  }
});

// GET /api/agents/:id/findings - Findings scoped to authorized shops
router.get('/:id/findings', authenticateToken, (req: AuthRequest, res) => {
  try {
    const agentId = req.params.id;
    const scope = resolveUserScope(req.user!);

    let query = 'SELECT * FROM agent_findings WHERE agent_id = ?';
    let params: any[] = [agentId];

    if (!scope.isGlobal) {
      if (!scope.allowedShopIds || scope.allowedShopIds.length === 0) {
        res.json([]);
        return;
      }
      const placeholders = scope.allowedShopIds.map(() => '?').join(',');
      query += ` AND shop_id IN (${placeholders})`;
      params.push(...scope.allowedShopIds);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';
    const rows = db.prepare(query).all(...params) as any[];

    const findings = rows.map(r => ({
      ...r,
      evidence_records: r.evidence_records ? JSON.parse(r.evidence_records) : [],
      evidence_headers: r.evidence_headers ? JSON.parse(r.evidence_headers) : []
    }));

    res.json(findings);
  } catch (err: any) {
    console.error('[Findings Error]', err);
    res.status(500).json({ error: 'Failed to fetch agent findings' });
  }
});

// GET /api/agents/:id/tasks - Tasks scoped to authorized shops
router.get('/:id/tasks', authenticateToken, (req: AuthRequest, res) => {
  try {
    const agentId = req.params.id;
    const scope = resolveUserScope(req.user!);

    let query = 'SELECT * FROM agent_tasks WHERE agent_id = ?';
    let params: any[] = [agentId];

    if (!scope.isGlobal) {
      if (!scope.allowedShopIds || scope.allowedShopIds.length === 0) {
        res.json([]);
        return;
      }
      const placeholders = scope.allowedShopIds.map(() => '?').join(',');
      query += ` AND shop_id IN (${placeholders})`;
      params.push(...scope.allowedShopIds);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';
    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/agents/tasks/:taskId/approve - Approve an agent task & action
router.post('/tasks/:taskId/approve', authenticateToken, requireRole('HQ_OWNER', 'AREA_MANAGER', 'FRANCHISE_OWNER'), (req: AuthRequest, res) => {
  try {
    const taskId = req.params.taskId;
    const task = db.prepare('SELECT * FROM agent_tasks WHERE id = ?').get(taskId) as any;

    if (!task) {
      res.status(404).json({ error: 'Agent task not found' });
      return;
    }

    const approvedAt = new Date().toISOString();
    const approvedBy = `${req.user!.name} (${req.user!.role})`;

    // 1. Update Agent Task status to COMPLETED
    db.prepare(`
      UPDATE agent_tasks 
      SET status = 'COMPLETED', approved_by = ?, approved_at = ?, updated_at = ?
      WHERE id = ?
    `).run(approvedBy, approvedAt, approvedAt, taskId);

    // 2. If associated with a Purchase Order, approve the PO
    db.prepare(`
      UPDATE purchase_orders
      SET status = 'Approved', approved_by = ?, approved_at = ?, updated_at = ?
      WHERE task_id = ?
    `).run(approvedBy, approvedAt, approvedAt, taskId);

    // 3. Immutable enterprise audit trail
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata)
      VALUES (?, ?, ?, ?, 'agent.action_approved', 'agent_tasks', ?, ?)
    `).run(
      'aud-' + Date.now(), req.user!.id, req.user!.name, req.user!.role, taskId,
      JSON.stringify({ title: task.title, actionType: task.action_type, shop_id: task.shop_id })
    );

    // 4. Realtime broadcast to all clients
    realtimeHub.broadcast('TASK_APPROVED', { taskId, approvedBy, shop_id: task.shop_id }, task.shop_id);

    res.json({
      success: true,
      message: 'Task approved and execution committed.',
      task: { ...task, status: 'COMPLETED', approved_by: approvedBy, approved_at: approvedAt }
    });
  } catch (err: any) {
    console.error('[Task Approve Error]', err);
    res.status(500).json({ error: 'Failed to approve task' });
  }
});

// POST /api/agents/tasks/:taskId/reject
router.post('/tasks/:taskId/reject', authenticateToken, requireRole('HQ_OWNER', 'AREA_MANAGER', 'FRANCHISE_OWNER'), (req: AuthRequest, res) => {
  try {
    const taskId = req.params.taskId;
    const { reason } = req.body;

    db.prepare(`
      UPDATE agent_tasks
      SET status = 'CANCELLED', updated_at = datetime('now')
      WHERE id = ?
    `).run(taskId);

    db.prepare(`
      UPDATE purchase_orders
      SET status = 'Rejected', rejection_reason = ?, updated_at = datetime('now')
      WHERE task_id = ?
    `).run(reason || 'Rejected by authorized personnel', taskId);

    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata)
      VALUES (?, ?, ?, ?, 'agent.action_rejected', 'agent_tasks', ?, ?)
    `).run('aud-' + Date.now(), req.user!.id, req.user!.name, req.user!.role, taskId, JSON.stringify({ reason }));

    realtimeHub.broadcast('TASK_REJECTED', { taskId, reason });

    res.json({ success: true, message: 'Task rejected and cancelled.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reject task' });
  }
});

export default router;
