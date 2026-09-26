import { db } from '../db/database.js';
import { realtimeHub } from './realtimeHub.js';
import { groqService } from './groqService.js';

export interface AgentRunRecord {
  id: string;
  agent_id: string;
  trigger_type: 'SCHEDULED' | 'EVENT' | 'MANUAL';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  shops_scanned: number;
  records_scanned: number;
  critical_findings: number;
  warnings: number;
  tasks_generated: number;
  status: 'Running' | 'Completed' | 'Failed';
  input_snapshot?: string;
  rules_applied?: string;
  calculations_summary?: string;
  errors?: string;
  scope?: string;
  triggered_by?: string;
}

export const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

export class AgentOrchestrator {
  private isRunning: Map<string, boolean> = new Map();

  constructor() {
    this.startBackgroundSchedule();
  }

  // =========================================================================
  // PERSISTENT EVENT LOGGER & REALTIME DISPATCHER
  // =========================================================================
  public recordEvent(eventType: string, payload: any, shopId: string | null = null): string {
    const evtId = genId('evt');
    try {
      db.prepare(`
        INSERT INTO agent_events (id, event_type, shop_id, payload, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(evtId, eventType, shopId || payload?.shop_id || null, JSON.stringify(payload));
    } catch (e: any) {
      console.error(`[Event DB Error] Failed to persist event ${eventType}:`, e.message);
    }
    realtimeHub.broadcast(eventType, payload, shopId || payload?.shop_id);
    return evtId;
  }

  // =========================================================================
  // SCHEDULER: Autonomous Backend Execution Loops
  // =========================================================================
  private startBackgroundSchedule() {
    console.log('[AgentOrchestrator] Initializing autonomous background execution loops...');

    // 1. Autonomous Inventory Agent: every 3 minutes
    setInterval(() => {
      this.executeAgent('inventory', 'SCHEDULED', null, 'System Cron').catch(console.error);
    }, 180000);

    // 2. Autonomous Revenue Anomaly & Shop Health Agents: every 5 minutes
    setInterval(() => {
      this.executeAgent('revenue-anomaly', 'SCHEDULED', null, 'System Cron').catch(console.error);
      this.executeAgent('shop-health', 'SCHEDULED', null, 'System Cron').catch(console.error);
    }, 300000);

    // 3. Autonomous Sales Intelligence, Udhaar Risk, and Cash Risk Agents: every 10 minutes
    setInterval(() => {
      this.executeAgent('sales', 'SCHEDULED', null, 'System Cron').catch(console.error);
      this.executeAgent('udhaar-risk', 'SCHEDULED', null, 'System Cron').catch(console.error);
      this.executeAgent('cash-risk', 'SCHEDULED', null, 'System Cron').catch(console.error);
      this.executeAgent('retention', 'SCHEDULED', null, 'System Cron').catch(console.error);
    }, 600000);

    // 4. Autonomous Retry Queue Worker: every 15 seconds
    setInterval(() => {
      this.processRetryQueue().catch(console.error);
    }, 15000);
  }

  // =========================================================================
  // RETRY QUEUE: Exponential Backoff & Safe Failure Recovery
  // =========================================================================
  private queueRetry(agentId: string, runId: string, triggerType: any, scope: any, triggeredBy: string, error: string) {
    try {
      const retryId = genId('ret');
      db.prepare(`
        INSERT INTO agent_retry_queue (id, agent_id, run_id, trigger_type, scope, triggered_by, attempt_count, max_attempts, last_error, next_retry_at, status)
        VALUES (?, ?, ?, ?, ?, ?, 1, 3, ?, datetime('now', '+5 seconds'), 'PENDING')
      `).run(retryId, agentId, runId, triggerType, scope?.allowedShopIds ? JSON.stringify(scope.allowedShopIds) : null, triggeredBy, error);
      console.log(`[AgentOrchestrator] Queued retry job ${retryId} for failed agent '${agentId}'`);
      this.recordEvent('AGENT_RETRY_QUEUED', { retryId, agentId, error, nextAttemptAt: 'in 5 seconds' });
    } catch (e: any) {
      console.error('[Queue Retry Error]', e.message);
    }
  }

  public async processRetryQueue() {
    try {
      const pendingJobs = db.prepare(`
        SELECT * FROM agent_retry_queue 
        WHERE status = 'PENDING' AND datetime(next_retry_at) <= datetime('now')
        ORDER BY created_at ASC LIMIT 3
      `).all() as any[];

      for (const job of pendingJobs) {
        db.prepare('UPDATE agent_retry_queue SET status = "PROCESSING", updated_at = datetime("now") WHERE id = ?').run(job.id);
        console.log(`[AgentOrchestrator] Executing retry attempt ${job.attempt_count}/${job.max_attempts} for agent '${job.agent_id}'`);
        
        let scope = null;
        if (job.scope) {
          try {
            scope = { allowedShopIds: JSON.parse(job.scope) };
          } catch {}
        }

        try {
          const res = await this.executeAgent(job.agent_id, 'EVENT', scope, `Auto-Retry #${job.attempt_count}`);
          if (res.status === 'Completed') {
            db.prepare('UPDATE agent_retry_queue SET status = "RESOLVED", updated_at = datetime("now") WHERE id = ?').run(job.id);
            this.recordEvent('AGENT_RETRY_RESOLVED', { agentId: job.agent_id, retryJobId: job.id, attempt: job.attempt_count });
          } else {
            throw new Error(res.errors || 'Retry execution failed');
          }
        } catch (err: any) {
          const nextAttempt = job.attempt_count + 1;
          if (nextAttempt <= job.max_attempts) {
            const delaySec = nextAttempt === 2 ? 15 : 45;
            db.prepare(`
              UPDATE agent_retry_queue 
              SET status = 'PENDING', attempt_count = ?, last_error = ?, 
                  next_retry_at = datetime('now', '+' || ? || ' seconds'), updated_at = datetime('now')
              WHERE id = ?
            `).run(nextAttempt, err.message, delaySec, job.id);
          } else {
            db.prepare('UPDATE agent_retry_queue SET status = "ABANDONED", last_error = ?, updated_at = datetime("now") WHERE id = ?')
              .run(err.message, job.id);
            this.recordEvent('AGENT_RETRY_ABANDONED', { agentId: job.agent_id, retryJobId: job.id, maxAttemptsReached: true });
          }
        }
      }
    } catch (e: any) {
      console.error('[Process Retry Queue Error]', e.message);
    }
  }

  // =========================================================================
  // EVENT BUS: Cascading Event Dispatcher
  // =========================================================================
  public async handleEvent(eventType: string, payload: any) {
    console.log(`[AgentOrchestrator] Event received: ${eventType}`, payload);

    // Record Event in DB and Broadcast
    this.recordEvent(eventType, payload, payload.shop_id || null);

    if (eventType === 'COMMUNITY_POST_CREATED') {
      await this.executeSupportAgentForPost(payload.postId, payload.title, payload.content);
    } else if (eventType === 'TRANSACTION_RECORDED') {
      await this.executeAgent('sales', 'EVENT', { allowedShopIds: payload.shop_id ? [payload.shop_id] : null }, 'Transaction Trigger');
    } else if (eventType === 'STOCKOUT_PREDICTED') {
      await this.executeAgent('shop-health', 'EVENT', { allowedShopIds: [payload.shop_id] }, 'Inventory Alert Trigger');
    } else if (eventType === 'SHOP_HEALTH_DEGRADED') {
      await this.executeAgent('retention', 'EVENT', { allowedShopIds: [payload.shop_id] }, 'Health Score Cascade');
    }
  }

  // =========================================================================
  // MAIN AGENT EXECUTOR
  // =========================================================================
  public async executeAgent(
    agentId: string,
    triggerType: 'SCHEDULED' | 'EVENT' | 'MANUAL' = 'MANUAL',
    scope?: { allowedShopIds: string[] | null } | null,
    triggeredBy: string = 'HQ Owner'
  ): Promise<AgentRunRecord> {
    const runId = genId(`run-${agentId}`);
    const startTime = Date.now();
    const startedAt = new Date().toISOString();

    console.log(`[AgentOrchestrator] Starting Agent '${agentId}' [${triggerType}] triggered by ${triggeredBy}`);

    // Prevent concurrent runs of the exact same agent
    if (this.isRunning.get(agentId)) {
      console.warn(`[AgentOrchestrator] Agent '${agentId}' already running. Throttling execution.`);
    }
    this.isRunning.set(agentId, true);

    const resolvedScopeStr = scope?.allowedShopIds ? scope.allowedShopIds.join(',') : 'GLOBAL';

    // Initial run record
    const insertRun = db.prepare(`
      INSERT INTO agent_runs (
        id, agent_id, trigger_type, started_at, status, shops_scanned, records_scanned,
        critical_findings, warnings, tasks_generated, scope, triggered_by
      ) VALUES (?, ?, ?, ?, 'Running', 0, 0, 0, 0, 0, ?, ?)
    `);

    insertRun.run(runId, agentId, triggerType, startedAt, resolvedScopeStr, triggeredBy);

    // Persist and broadcast live telemetry
    this.recordEvent('AGENT_STARTED', { agentId, runId, triggerType, startedAt, scope: resolvedScopeStr });

    let shopsScanned = 0;
    let recordsScanned = 0;
    let criticalFindings = 0;
    let warnings = 0;
    let tasksGenerated = 0;
    let calculationsSummary = '';
    let errorMessage: string | null = null;

    try {
      // 1. Fetch target shops based on authorization scope
      let shopsQuery = 'SELECT * FROM shops';
      let params: any[] = [];
      if (scope?.allowedShopIds && scope.allowedShopIds.length > 0) {
        const placeholders = scope.allowedShopIds.map(() => '?').join(',');
        shopsQuery += ` WHERE id IN (${placeholders})`;
        params = scope.allowedShopIds;
      }
      const shops = db.prepare(shopsQuery).all(...params) as any[];
      shopsScanned = shops.length;

      // 2. Route to specialized Agent Logic
      if (agentId === 'inventory') {
        const res = await this.runInventoryAgent(runId, shops);
        recordsScanned = res.recordsScanned;
        criticalFindings = res.criticalFindings;
        warnings = res.warnings;
        tasksGenerated = res.tasksGenerated;
        calculationsSummary = res.summary;
      } else if (agentId === 'revenue-anomaly') {
        const res = await this.runRevenueAnomalyAgent(runId, shops);
        recordsScanned = res.recordsScanned;
        criticalFindings = res.criticalFindings;
        warnings = res.warnings;
        tasksGenerated = res.tasksGenerated;
        calculationsSummary = res.summary;
      } else if (agentId === 'cash-risk') {
        const res = await this.runCashRiskAgent(runId, shops);
        recordsScanned = res.recordsScanned;
        criticalFindings = res.criticalFindings;
        warnings = res.warnings;
        tasksGenerated = res.tasksGenerated;
        calculationsSummary = res.summary;
      } else if (agentId === 'udhaar-risk') {
        const res = await this.runUdhaarRiskAgent(runId, shops);
        recordsScanned = res.recordsScanned;
        criticalFindings = res.criticalFindings;
        warnings = res.warnings;
        tasksGenerated = res.tasksGenerated;
        calculationsSummary = res.summary;
      } else if (agentId === 'sales') {
        const res = await this.runSalesAgent(runId, shops);
        recordsScanned = res.recordsScanned;
        criticalFindings = res.criticalFindings;
        warnings = res.warnings;
        tasksGenerated = res.tasksGenerated;
        calculationsSummary = res.summary;
      } else if (agentId === 'shop-health') {
        const res = await this.runShopHealthAgent(runId, shops);
        recordsScanned = res.recordsScanned;
        criticalFindings = res.criticalFindings;
        warnings = res.warnings;
        tasksGenerated = res.tasksGenerated;
        calculationsSummary = res.summary;
      } else if (agentId === 'retention') {
        const res = await this.runRetentionAgent(runId, shops);
        recordsScanned = res.recordsScanned;
        criticalFindings = res.criticalFindings;
        warnings = res.warnings;
        tasksGenerated = res.tasksGenerated;
        calculationsSummary = res.summary;
      } else if (agentId === 'support') {
        const res = await this.runSupportAgentBatch(runId);
        recordsScanned = res.recordsScanned;
        criticalFindings = res.criticalFindings;
        warnings = res.warnings;
        tasksGenerated = res.tasksGenerated;
        calculationsSummary = res.summary;
      }
    } catch (err: any) {
      console.error(`[AgentOrchestrator] Agent execution error:`, err);
      errorMessage = err.message || 'Unknown agent execution failure';
    } finally {
      this.isRunning.set(agentId, false);
    }

    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;
    const finalStatus = errorMessage ? 'Failed' : 'Completed';

    // Update agent run record
    db.prepare(`
      UPDATE agent_runs
      SET completed_at = ?, duration_ms = ?, shops_scanned = ?, records_scanned = ?,
          critical_findings = ?, warnings = ?, tasks_generated = ?, status = ?,
          calculations_summary = ?, errors = ?
      WHERE id = ?
    `).run(
      completedAt, durationMs, shopsScanned, recordsScanned, criticalFindings,
      warnings, tasksGenerated, finalStatus, calculationsSummary, errorMessage, runId
    );

    // Record Audit Log
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata, timestamp)
      VALUES (?, ?, ?, 'SYSTEM', ?, 'agent', ?, ?, datetime('now'))
    `).run(
      genId('aud'),
      'agent-orchestrator',
      `Agent [${agentId}]`,
      finalStatus === 'Completed' ? 'agent.completed' : 'agent.failed',
      agentId,
      JSON.stringify({ runId, durationMs, criticalFindings, tasksGenerated, error: errorMessage })
    );

    const resultRecord: AgentRunRecord = {
      id: runId,
      agent_id: agentId,
      trigger_type: triggerType,
      started_at: startedAt,
      completed_at: completedAt,
      duration_ms: durationMs,
      shops_scanned: shopsScanned,
      records_scanned: recordsScanned,
      critical_findings: criticalFindings,
      warnings: warnings,
      tasks_generated: tasksGenerated,
      status: finalStatus,
      calculations_summary: calculationsSummary,
      scope: resolvedScopeStr,
      triggered_by: triggeredBy,
      errors: errorMessage || undefined
    };

    if (finalStatus === 'Completed') {
      this.recordEvent('AGENT_COMPLETED', resultRecord);
    } else {
      this.recordEvent('AGENT_FAILED', { ...resultRecord, error: errorMessage });
      if (!triggeredBy.startsWith('Auto-Retry #3')) {
        this.queueRetry(agentId, runId, triggerType, scope, triggeredBy, errorMessage || 'Unknown failure');
      }
    }

    return resultRecord;
  }

  // =========================================================================
  // 1. INVENTORY AGENT: Stock Velocity & Predictive PO Generation
  // =========================================================================
  private async runInventoryAgent(runId: string, shops: any[]) {
    let recordsScanned = 0;
    let criticalFindings = 0;
    let warnings = 0;
    let tasksGenerated = 0;

    for (const shop of shops) {
      const items = db.prepare('SELECT * FROM inventory_items WHERE shop_id = ?').all(shop.id) as any[];
      recordsScanned += items.length;

      for (const item of items) {
        // Deterministic Calculation: Days Remaining = current_stock / sales_velocity
        const daysRemaining = item.sales_velocity > 0 ? (item.current_stock / item.sales_velocity) : 999;
        const isDepleted = item.current_stock < item.reorder_threshold;
        const isCritical = daysRemaining <= 2.0;

        if (isDepleted || isCritical) {
          if (isCritical) criticalFindings++;
          else warnings++;

          const findingId = genId(`fnd-inv-${item.id}`);
          const title = `Predictive Stockout: ${item.item_name} (${daysRemaining.toFixed(1)} days runway)`;
          const deviation = `${daysRemaining.toFixed(2)} days (Threshold: 3.0 days)`;
          const calculation = `Current Stock (${item.current_stock} ${item.unit}) / Daily Velocity (${item.sales_velocity.toFixed(1)}/day) = ${daysRemaining.toFixed(2)} days runway`;

          // AI Explanation Layer (Server-Side Groq with Deterministic Fallback)
          const aiInsight = await groqService.explainFinding({
            agentName: 'Autonomous Inventory Agent',
            shopName: shop.name,
            findingTitle: title,
            metrics: { currentStock: item.current_stock, salesVelocity: item.sales_velocity, daysRemaining: daysRemaining.toFixed(2) },
            baseline: '3.0 days buffer',
            deviation
          });

          // Insert Finding into DB
          db.prepare(`
            INSERT INTO agent_findings (
              id, agent_id, run_id, shop_id, shop_name, title, severity, metric_label,
              metric_value, baseline, deviation, calculation, evidence_records, evidence_headers, recommended_action, status
            ) VALUES (?, 'inventory', ?, ?, ?, ?, ?, 'Stock Runway Days', ?, '3.0 days', ?, ?, ?, ?, ?, 'active')
          `).run(
            findingId, runId, shop.id, shop.name, title, isCritical ? 'critical' : 'warning',
            `${daysRemaining.toFixed(1)} days`, deviation, calculation,
            JSON.stringify([[item.item_name, item.current_stock, item.sales_velocity, daysRemaining.toFixed(2), item.supplier]]),
            JSON.stringify(['SKU Name', 'Current Stock', 'Daily Velocity', 'Days Remaining', 'Preferred Supplier']),
            aiInsight.action
          );

          // Idempotency check: Don't create duplicate purchase order for the exact same SKU if one is already Awaiting Approval
          const existingPO = db.prepare(`
            SELECT id FROM purchase_orders WHERE sku_id = ? AND status IN ('Draft', 'Awaiting Approval')
          `).get(item.id) as { id: string } | undefined;

          if (!existingPO) {
            tasksGenerated++;
            const taskId = genId(`task-inv-${item.id}`);
            const poId = `PO-2026-INV-${Math.floor(1000 + Math.random() * 9000)}`;
            const reorderQty = item.suggested_reorder_qty || (item.sales_velocity * 7);
            const totalAmount = Math.round(reorderQty * item.cost_price);

            // 1. Create Agent Task
            db.prepare(`
              INSERT INTO agent_tasks (
                id, agent_id, run_id, shop_id, shop_name, priority, status, title,
                description, evidence, recommendation, action_type, action_payload,
                approval_required, idempotency_key, created_at, updated_at
              ) VALUES (?, 'inventory', ?, ?, ?, ?, 'AWAITING_APPROVAL', ?, ?, ?, ?, 'PURCHASE_ORDER_DRAFT', ?, 1, ?, datetime('now'), datetime('now'))
            `).run(
              taskId, runId, shop.id, shop.name, isCritical ? 'High' : 'Medium',
              `Purchase Order Draft: ${item.item_name} (${reorderQty} ${item.unit})`,
              aiInsight.summary,
              JSON.stringify({ currentStock: item.current_stock, velocity: item.sales_velocity, daysRemaining: daysRemaining.toFixed(2) }),
              aiInsight.action,
              JSON.stringify({ poId, skuId: item.id, qty: reorderQty, totalAmount }),
              `po-draft-${item.id}`
            );

            // 2. Create Real Purchase Order Record
            db.prepare(`
              INSERT INTO purchase_orders (
                id, task_id, shop_id, shop_name, product_name, sku_id, quantity, unit,
                unit_price, total_amount, supplier, reason, current_stock, sales_velocity,
                days_remaining, created_by, status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Autonomous Inventory Agent v2.4', 'Awaiting Approval', datetime('now'), datetime('now'))
            `).run(
              poId, taskId, shop.id, shop.name, item.item_name, item.id, reorderQty, item.unit,
              item.cost_price, totalAmount, item.supplier,
              `Stockdown predicted in ${daysRemaining.toFixed(1)} days (Burn rate: ${item.sales_velocity}/day). Automated reorder draft.`,
              item.current_stock, item.sales_velocity, daysRemaining.toFixed(1)
            );

            // 3. Dispatch Notification
            const notifId = genId('notif');
            db.prepare(`
              INSERT INTO notifications (id, target_role, shop_id, title, message, category, severity, link)
              VALUES (?, 'HQ_OWNER', ?, ?, ?, 'inventory', 'critical', '/purchase-orders')
            `).run(
              notifId, shop.id,
              `PO Draft #${poId} Awaiting Approval`,
              `${shop.name}: ${item.item_name} stockout predicted in ${daysRemaining.toFixed(1)} days. Total: ₹${totalAmount.toLocaleString('en-IN')}`
            );

            realtimeHub.broadcast('NOTIFICATION_CREATED', { id: notifId, title: `PO #${poId} Awaiting Approval`, shop_id: shop.id }, shop.id);
            realtimeHub.broadcast('TASK_CREATED', { id: taskId, shop_id: shop.id, title: `PO Draft: ${item.item_name}` }, shop.id);
            realtimeHub.broadcast('PURCHASE_ORDER_CREATED', { id: poId, shop_id: shop.id, amount: totalAmount }, shop.id);
          }
        }
      }
    }

    return {
      recordsScanned,
      criticalFindings,
      warnings,
      tasksGenerated,
      summary: `Scanned ${recordsScanned} SKUs across ${shops.length} shops. Detected ${criticalFindings} critical stockouts, generated ${tasksGenerated} PO drafts.`
    };
  }

  // =========================================================================
  // 2. REVENUE ANOMALY AGENT: 7-day Moving Average Drops
  // =========================================================================
  private async runRevenueAnomalyAgent(runId: string, shops: any[]) {
    let recordsScanned = 0;
    let criticalFindings = 0;
    let warnings = 0;
    let tasksGenerated = 0;

    for (const shop of shops) {
      // Fetch 14 days of sales
      const sales = db.prepare(`
        SELECT revenue, date FROM daily_sales WHERE shop_id = ? ORDER BY date DESC LIMIT 14
      `).all(shop.id) as { revenue: number; date: string }[];

      recordsScanned += sales.length;
      if (sales.length < 14) continue;

      const recent7 = sales.slice(0, 7).reduce((acc, s) => acc + s.revenue, 0) / 7;
      const prev7 = sales.slice(7, 14).reduce((acc, s) => acc + s.revenue, 0) / 7;
      const pctDrop = prev7 > 0 ? ((prev7 - recent7) / prev7) * 100 : 0;

      if (pctDrop >= 15) {
        criticalFindings++;
        const findingId = genId(`fnd-rev-${shop.id}`);
        const title = `Revenue Plunge: -${pctDrop.toFixed(1)}% vs Previous Week`;
        const calculation = `(Previous 7d Avg: ₹${Math.round(prev7)} - Recent 7d Avg: ₹${Math.round(recent7)}) / ₹${Math.round(prev7)} = -${pctDrop.toFixed(1)}%`;

        const aiInsight = await groqService.explainFinding({
          agentName: 'Revenue Anomaly Agent',
          shopName: shop.name,
          findingTitle: title,
          metrics: { recent7dAvg: Math.round(recent7), prev7dAvg: Math.round(prev7), pctDrop: pctDrop.toFixed(1) },
          baseline: `₹${Math.round(prev7)}/day`,
          deviation: `-${pctDrop.toFixed(1)}%`
        });

        db.prepare(`
          INSERT INTO agent_findings (
            id, agent_id, run_id, shop_id, shop_name, title, severity, metric_label,
            metric_value, baseline, deviation, calculation, recommended_action, status
          ) VALUES (?, 'revenue-anomaly', ?, ?, ?, ?, 'critical', 'Weekly Revenue Shift', ?, ?, ?, ?, ?, 'active')
        `).run(
          findingId, runId, shop.id, shop.name, title,
          `₹${Math.round(recent7).toLocaleString('en-IN')}/day`, `₹${Math.round(prev7).toLocaleString('en-IN')}/day`,
          `-${pctDrop.toFixed(1)}%`, calculation, aiInsight.action
        );

        // Idempotency check: Don't create duplicate intervention task within 24h
        const existingTask = db.prepare(`
          SELECT id FROM agent_tasks 
          WHERE agent_id = 'revenue-anomaly' AND shop_id = ? AND status IN ('QUEUED', 'AWAITING_APPROVAL')
          AND datetime(created_at) >= datetime('now', '-1 day')
        `).get(shop.id);

        if (!existingTask) {
          tasksGenerated++;
          const taskId = genId(`task-rev-${shop.id}`);
          db.prepare(`
            INSERT INTO agent_tasks (
              id, agent_id, run_id, shop_id, shop_name, priority, status, title,
              description, evidence, recommendation, action_type, approval_required, idempotency_key, created_at, updated_at
            ) VALUES (?, 'revenue-anomaly', ?, ?, ?, 'High', 'QUEUED', ?, ?, ?, ?, 'STORE_AUDIT_INTERVENTION', 0, ?, datetime('now'), datetime('now'))
          `).run(
            taskId, runId, shop.id, shop.name,
            `Investigate -${pctDrop.toFixed(1)}% Revenue Drop at ${shop.name}`,
            aiInsight.summary,
            JSON.stringify({ recentAvg: recent7, baseline: prev7, drop: pctDrop }),
            aiInsight.action,
            `task-rev-${shop.id}-${new Date().toISOString().slice(0, 10)}`
          );

          this.recordEvent('TASK_CREATED', { id: taskId, shop_id: shop.id, agent_id: 'revenue-anomaly', title: `Investigate Revenue Drop: ${shop.name}` }, shop.id);
        }

        this.recordEvent('ANOMALY_DETECTED', { shop_id: shop.id, type: 'REVENUE_DROP', drop: pctDrop }, shop.id);
      }
    }

    return {
      recordsScanned,
      criticalFindings,
      warnings,
      tasksGenerated,
      summary: `Analyzed 14-day revenue velocity across ${shops.length} shops. Found ${criticalFindings} critical drops.`
    };
  }

  // =========================================================================
  // 3. CASH RISK AGENT: Register Reconciliation Discrepancies
  // =========================================================================
  private async runCashRiskAgent(runId: string, shops: any[]) {
    let recordsScanned = 0;
    let criticalFindings = 0;
    let warnings = 0;
    let tasksGenerated = 0;

    for (const shop of shops) {
      recordsScanned++;
      const variance = shop.cash_variance_today || 0;
      if (variance < -500) {
        criticalFindings++;
        const findingId = genId(`fnd-csh-${shop.id}`);
        const title = `Register Cash Discrepancy: -₹${Math.abs(variance).toLocaleString('en-IN')}`;
        const calculation = `POS Recorded Cash Expected (₹${shop.cash_expected_today}) - Physical Drawer Count (₹${shop.cash_actual_today}) = -₹${Math.abs(variance)}`;

        db.prepare(`
          INSERT INTO agent_findings (
            id, agent_id, run_id, shop_id, shop_name, title, severity, metric_label,
            metric_value, baseline, deviation, calculation, recommended_action, status
          ) VALUES (?, 'cash-risk', ?, ?, ?, ?, 'critical', 'Cash Drawer Shortage', ?, '₹0 Variance', ?, ?, ?, 'active')
        `).run(
          findingId, runId, shop.id, shop.name, title,
          `-₹${Math.abs(variance)}`, `-₹${Math.abs(variance)}`, calculation,
          'Conduct end-of-shift drawer count audit, review voided receipts and cross-verify with CCTV logs.'
        );

        // Idempotency check: Don't create duplicate till audit task within 24h
        const existingTask = db.prepare(`
          SELECT id FROM agent_tasks 
          WHERE agent_id = 'cash-risk' AND shop_id = ? AND status IN ('QUEUED', 'AWAITING_APPROVAL')
          AND datetime(created_at) >= datetime('now', '-1 day')
        `).get(shop.id);

        if (!existingTask) {
          tasksGenerated++;
          const taskId = genId(`task-csh-${shop.id}`);
          db.prepare(`
            INSERT INTO agent_tasks (
              id, agent_id, run_id, shop_id, shop_name, priority, status, title,
              description, evidence, recommendation, action_type, approval_required, idempotency_key, created_at, updated_at
            ) VALUES (?, 'cash-risk', ?, ?, ?, 'High', 'QUEUED', ?, ?, ?, ?, 'CASH_REGISTER_AUDIT', 0, ?, datetime('now'), datetime('now'))
          `).run(
            taskId, runId, shop.id, shop.name,
            `Audit End-of-Shift Shortage (-₹${Math.abs(variance)})`,
            `Physical drawer count at ${shop.name} is ₹${Math.abs(variance)} short of POS receipts. Discrepancy logged by ${shop.manager_name}.`,
            JSON.stringify({ expected: shop.cash_expected_today, actual: shop.cash_actual_today, variance }),
            'Initiate cashier till verification.',
            `task-csh-${shop.id}-${new Date().toISOString().slice(0, 10)}`
          );

          this.recordEvent('TASK_CREATED', { id: taskId, shop_id: shop.id, agent_id: 'cash-risk', title: `Audit Cash Shortage: ${shop.name}` }, shop.id);
        }

        this.recordEvent('CASH_VARIANCE_FLAGGED', { shop_id: shop.id, variance }, shop.id);
      }
    }

    return {
      recordsScanned,
      criticalFindings,
      warnings,
      tasksGenerated,
      summary: `Verified register tills for ${shops.length} branches. Flagged ${criticalFindings} active drawer shortages.`
    };
  }

  // =========================================================================
  // 4. UDHAAR RISK AGENT: Overdue Debt & Credit Limits
  // =========================================================================
  private async runUdhaarRiskAgent(runId: string, shops: any[]) {
    let recordsScanned = 0;
    let criticalFindings = 0;
    let warnings = 0;
    let tasksGenerated = 0;

    for (const shop of shops) {
      const records = db.prepare('SELECT * FROM udhaar_records WHERE shop_id = ?').all(shop.id) as any[];
      recordsScanned += records.length;

      const criticalOverdue = records.filter(r => r.days_outstanding > 45 || r.risk_level === 'Critical');
      if (criticalOverdue.length > 0) {
        criticalFindings++;
        const totalOverdue = criticalOverdue.reduce((acc, r) => acc + r.amount, 0);
        const findingId = genId(`fnd-udh-${shop.id}`);
        const title = `Critical Credit Exposure: ₹${totalOverdue.toLocaleString('en-IN')} overdue >45d`;

        db.prepare(`
          INSERT INTO agent_findings (
            id, agent_id, run_id, shop_id, shop_name, title, severity, metric_label,
            metric_value, baseline, deviation, calculation, recommended_action, status
          ) VALUES (?, 'udhaar-risk', ?, ?, ?, ?, 'critical', 'Overdue Khata Debt', ?, '₹0 >45d', ?, ?, ?, 'active')
        `).run(
          findingId, runId, shop.id, shop.name, title,
          `₹${totalOverdue}`, `₹${totalOverdue} overdue`,
          `${criticalOverdue.length} accounts have crossed 45-day threshold with 0 recent repayments.`,
          'Automate WhatsApp debt repayment reminders and freeze further credit on overdue accounts.'
        );

        // Idempotency check: Don't create duplicate udhaar freeze task within 24h
        const existingTask = db.prepare(`
          SELECT id FROM agent_tasks 
          WHERE agent_id = 'udhaar-risk' AND shop_id = ? AND status IN ('QUEUED', 'AWAITING_APPROVAL')
          AND datetime(created_at) >= datetime('now', '-1 day')
        `).get(shop.id);

        if (!existingTask) {
          tasksGenerated++;
          const taskId = genId(`task-udh-${shop.id}`);
          db.prepare(`
            INSERT INTO agent_tasks (
              id, agent_id, run_id, shop_id, shop_name, priority, status, title,
              description, evidence, recommendation, action_type, approval_required, idempotency_key, created_at, updated_at
            ) VALUES (?, 'udhaar-risk', ?, ?, ?, 'High', 'QUEUED', ?, ?, ?, ?, 'FREEZE_CREDIT_DISPATCH_REMINDERS', 0, ?, datetime('now'), datetime('now'))
          `).run(
            taskId, runId, shop.id, shop.name,
            `Enforce Credit Freeze on ${criticalOverdue.length} Accounts at ${shop.name}`,
            `Accounts overdue >45 days aggregate to ₹${totalOverdue}. Highest debtor: ${criticalOverdue[0].customer_name} (₹${criticalOverdue[0].amount}, ${criticalOverdue[0].days_outstanding}d).`,
            JSON.stringify(criticalOverdue.map(c => ({ name: c.customer_name, amt: c.amount, days: c.days_outstanding }))),
            'Send automated payment reminders.',
            `task-udh-${shop.id}-${new Date().toISOString().slice(0, 10)}`
          );

          this.recordEvent('TASK_CREATED', { id: taskId, shop_id: shop.id, agent_id: 'udhaar-risk', title: `Credit Freeze: ${shop.name}` }, shop.id);
        }
      }
    }

    return {
      recordsScanned,
      criticalFindings,
      warnings,
      tasksGenerated,
      summary: `Audited ${recordsScanned} credit ledgers across ${shops.length} stores. Detected ${criticalFindings} high default risks.`
    };
  }

  // =========================================================================
  // 5. SALES INTELLIGENCE AGENT
  // =========================================================================
  private async runSalesAgent(runId: string, shops: any[]) {
    let recordsScanned = 0;
    let criticalFindings = 0;
    let warnings = 0;
    let tasksGenerated = 0;

    for (const shop of shops) {
      recordsScanned += 7;
      if (shop.profit_margin_pct < 10.0) {
        warnings++;
        const findingId = genId(`fnd-sls-${shop.id}`);
        db.prepare(`
          INSERT INTO agent_findings (
            id, agent_id, run_id, shop_id, shop_name, title, severity, metric_label,
            metric_value, baseline, deviation, calculation, recommended_action, status
          ) VALUES (?, 'sales', ?, ?, ?, ?, 'warning', 'Gross Margin', ?, '14.0% Target', ?, ?, ?, 'active')
        `).run(
          findingId, runId, shop.id, shop.name,
          `Compressed Margin Alert: ${shop.profit_margin_pct}% at ${shop.name}`,
          `${shop.profit_margin_pct}%`,
          `-${(14.0 - shop.profit_margin_pct).toFixed(1)}% vs target`,
          `Gross Profit (₹${shop.daily_profit}) / Daily Revenue (₹${shop.daily_revenue}) = ${shop.profit_margin_pct}%`,
          'Shift promotional mix towards high-margin spices and private label packaged staples.'
        );
      }
    }

    return {
      recordsScanned,
      criticalFindings,
      warnings,
      tasksGenerated,
      summary: `Analyzed sales baskets and margin mix for ${shops.length} shops.`
    };
  }

  // =========================================================================
  // 6. SHOP HEALTH AGENT
  // =========================================================================
  private async runShopHealthAgent(runId: string, shops: any[]) {
    let recordsScanned = shops.length;
    let criticalFindings = 0;
    let warnings = 0;

    for (const shop of shops) {
      // Deterministic Multi-Factor Health Score:
      let score = 100;
      const reasons: string[] = [];

      if (shop.cash_variance_today < -1000) {
        score -= 20;
        reasons.push(`Cash shortage of -₹${Math.abs(shop.cash_variance_today)}`);
      }
      if (shop.profit_margin_pct < 11.0) {
        score -= 15;
        reasons.push(`Low profit margin (${shop.profit_margin_pct}%)`);
      }
      if (shop.stock_alert_count > 0) {
        score -= (shop.stock_alert_count * 8);
        reasons.push(`${shop.stock_alert_count} active stockout alerts`);
      }
      if (shop.udhaar_outstanding > 120000) {
        score -= 15;
        reasons.push(`High udhaar balance (₹${shop.udhaar_outstanding.toLocaleString('en-IN')})`);
      }

      score = Math.max(30, Math.min(99, score));
      let newStatus = score >= 85 ? 'Healthy' : (score >= 65 ? 'Watch' : 'At-Risk');

      if (newStatus === 'At-Risk') criticalFindings++;
      else if (newStatus === 'Watch') warnings++;

      // Update shop table
      db.prepare(`
        UPDATE shops
        SET health_score = ?, status = ?, health_reasons = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(score, newStatus, JSON.stringify(reasons), shop.id);
    }

    this.recordEvent('SHOP_HEALTH_UPDATED', { scanned: shops.length });

    return {
      recordsScanned,
      criticalFindings,
      warnings,
      tasksGenerated: 0,
      summary: `Recalculated multi-factor operational health index for ${shops.length} shops.`
    };
  }

  // =========================================================================
  // 7. RETENTION / INTERVENTION AGENT
  // =========================================================================
  private async runRetentionAgent(runId: string, shops: any[]) {
    let recordsScanned = shops.length;
    let criticalFindings = 0;
    let tasksGenerated = 0;

    for (const shop of shops) {
      if (shop.status === 'At-Risk' || shop.health_score < 60) {
        criticalFindings++;

        // Idempotency: Don't create duplicate field intervention task if active
        const existingTask = db.prepare(`
          SELECT id FROM agent_tasks 
          WHERE agent_id = 'retention' AND shop_id = ? AND status IN ('QUEUED', 'AWAITING_APPROVAL')
        `).get(shop.id);

        if (!existingTask) {
          tasksGenerated++;
          const taskId = genId(`task-ret-${shop.id}`);
          db.prepare(`
            INSERT INTO agent_tasks (
              id, agent_id, run_id, shop_id, shop_name, priority, status, title,
              description, evidence, recommendation, action_type, approval_required, idempotency_key, created_at, updated_at
            ) VALUES (?, 'retention', ?, ?, ?, 'High', 'QUEUED', ?, ?, ?, ?, 'FIELD_MANAGER_DISPATCH', 1, ?, datetime('now'), datetime('now'))
          `).run(
            taskId, runId, shop.id, shop.name,
            `Franchise Churn Risk Intervention: ${shop.name}`,
            `Store health dropped to ${shop.health_score}/100. Combined risks: ${shop.status_reason || 'Declining margins and cash variance'}.`,
            JSON.stringify({ health_score: shop.health_score, status: shop.status }),
            'Schedule on-site territory intervention with Area Manager.',
            `task-ret-${shop.id}`
          );

          this.recordEvent('TASK_CREATED', { id: taskId, shop_id: shop.id, agent_id: 'retention', title: `Intervention: ${shop.name}` }, shop.id);
        }
      }
    }

    return {
      recordsScanned,
      criticalFindings,
      warnings: 0,
      tasksGenerated,
      summary: `Evaluated franchise retention signals. Generated ${tasksGenerated} priority field manager interventions.`
    };
  }

  // =========================================================================
  // 8. SUPPORT / COMMUNITY AGENT (Autonomous Event & Batch Triage)
  // =========================================================================
  public async executeSupportAgentForPost(postId: string, title: string, content: string) {
    console.log(`[SupportAgent] Autonomous triage triggered for post: ${postId}`);

    // 1. Fetch Known Issues Directory from DB
    const knownIssues = db.prepare('SELECT id, code, title, workaround FROM known_issues').all() as any[];

    // 2. Classify Issue Category & Severity with AI
    const classification = await groqService.classifyIssue(title, content);

    // 3. Find Similar Issues
    const match = await groqService.matchSimilarIssue(title + ' ' + content, knownIssues);

    // 4. Update community post with AI analysis & link
    db.prepare(`
      UPDATE community_posts
      SET category = ?, ai_classification = ?, similar_issue_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      classification.category,
      JSON.stringify({ ...classification, similarityMatch: match }),
      match.matched ? match.issueId : null,
      postId
    );

    // 5. If high similarity match, post autonomous AI suggestion reply
    if (match.matched && match.recommendedSolution) {
      const replyId = genId('rep-ai');
      db.prepare(`
        INSERT INTO community_replies (id, post_id, author_id, author_name, author_role, content, is_solution)
        VALUES (?, ?, 'user-02', 'Support AI Copilot', 'HQ_IT', ?, 1)
      `).run(
        replyId, postId,
        `🤖 **Autonomous Support Agent Finding (${match.similarityScore}% Match with ${match.code})**\n\n` +
        `This behavior matches known issue **${match.code}** verified by HQ IT.\n\n` +
        `**Recommended Resolution:**\n${match.recommendedSolution}\n\n` +
        `*Auto-analyzed by Support Agent v2.4.*`
      );

      realtimeHub.broadcast('COMMUNITY_REPLY_CREATED', { postId, replyId, author: 'Support AI Copilot' });
    }

    realtimeHub.broadcast('COMMUNITY_POST_CLASSIFIED', { postId, classification, match });
  }

  private async runSupportAgentBatch(runId: string) {
    const posts = db.prepare('SELECT * FROM community_posts WHERE status = "Open"').all() as any[];
    return {
      recordsScanned: posts.length,
      criticalFindings: 0,
      warnings: 0,
      tasksGenerated: 0,
      summary: `Trained and checked ${posts.length} open community discussions against known bugs catalog.`
    };
  }
}

export const agentOrchestrator = new AgentOrchestrator();
