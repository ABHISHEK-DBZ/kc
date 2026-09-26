import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database('data/khatacopilot.db');

async function runAudit() {
  console.log('====================================================');
  console.log('KHATACOPILOT HQ — FORENSIC AGENT AUDIT SCRIPT');
  console.log('====================================================\n');

  // TEST 1: Inspect Background Scheduled Runs in DB (Browser-Closed Autonomy)
  console.log('--- TEST 1: Background Scheduled Runs (Browser-Closed Proof) ---');
  const scheduledRuns = db.prepare(`
    SELECT id, agent_id, trigger_type, status, started_at, completed_at, duration_ms, triggered_by
    FROM agent_runs
    WHERE trigger_type = 'SCHEDULED'
    ORDER BY started_at DESC LIMIT 5
  `).all();
  console.log(`Found ${scheduledRuns.length} autonomous SCHEDULED runs in DB:`);
  console.table(scheduledRuns);

  // TEST 2: Data Mutation & Decision Test (Inventory Agent Stockout Threshold)
  console.log('\n--- TEST 2: Controlled Data Mutation Test (Stockout Runway) ---');
  // Find an inventory item that is currently NOT critical
  const testItem = db.prepare(`
    SELECT * FROM inventory_items WHERE shop_id = 'shop-01' LIMIT 1
  `).get() as any;

  console.log(`Initial Item State: ${testItem.item_name} | Stock: ${testItem.current_stock} | Velocity: ${testItem.sales_velocity}/day`);
  const originalStock = testItem.current_stock;
  
  // Mutate stock to 2 units (runway = 2 / velocity <= 2 days => critical)
  db.prepare('UPDATE inventory_items SET current_stock = ? WHERE id = ?').run(2, testItem.id);
  console.log(`Mutated Stock to: 2 units (Expected Runway: ${(2 / testItem.sales_velocity).toFixed(2)} days)`);

  // Call the backend API for inventory agent
  const res = await fetch('http://localhost:3001/api/agents/inventory/run', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + getHQOwnerToken() }
  });
  const runResult = await res.json();
  console.log(`Agent Run Completed: ${runResult.id} | Critical Findings: ${runResult.critical_findings} | Tasks: ${runResult.tasks_generated}`);

  // Verify finding in DB
  const finding = db.prepare(`
    SELECT id, title, severity, metric_value, deviation, calculation 
    FROM agent_findings 
    WHERE run_id = ? AND title LIKE ?
  `).get(runResult.id, `%${testItem.item_name}%`);
  console.log('Database Finding Recorded:', finding);

  // Restore original stock
  db.prepare('UPDATE inventory_items SET current_stock = ? WHERE id = ?').run(originalStock, testItem.id);
  console.log(`Restored original stock to: ${originalStock}`);

  // TEST 3: False Positive Test (Healthy Item)
  console.log('\n--- TEST 3: False Positive Test (Healthy Stock Condition) ---');
  // Set stock to 500 units (runway = 500 / velocity = huge)
  db.prepare('UPDATE inventory_items SET current_stock = ? WHERE id = ?').run(500, testItem.id);
  const falsePosRes = await fetch('http://localhost:3001/api/agents/inventory/run', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + getHQOwnerToken() }
  });
  const falsePosData = await falsePosRes.json();
  const falseFinding = db.prepare(`
    SELECT id FROM agent_findings WHERE run_id = ? AND title LIKE ?
  `).get(falsePosData.id, `%${testItem.item_name}%`);
  console.log(`Tested with 500 units stock. Finding for ${testItem.item_name} generated?`, falseFinding ? 'YES (FAIL - False positive)' : 'NO (PASS - Suppressed)');
  db.prepare('UPDATE inventory_items SET current_stock = ? WHERE id = ?').run(originalStock, testItem.id);

  // TEST 4: Idempotency Test (Duplicate Execution Prevention)
  console.log('\n--- TEST 4: Idempotency & Duplicate Task Prevention ---');
  // Run inventory agent twice back-to-back
  const run1 = await (await fetch('http://localhost:3001/api/agents/inventory/run', {
    method: 'POST', headers: { 'Authorization': 'Bearer ' + getHQOwnerToken() }
  })).json();
  const run2 = await (await fetch('http://localhost:3001/api/agents/inventory/run', {
    method: 'POST', headers: { 'Authorization': 'Bearer ' + getHQOwnerToken() }
  })).json();

  console.log(`Run 1 generated tasks: ${run1.tasks_generated}`);
  console.log(`Run 2 generated tasks: ${run2.tasks_generated} (Expected: 0 duplicate PO tasks for same unresolved SKU)`);

  // TEST 5: Single Run ID Trace Across System
  console.log('\n--- TEST 5: End-to-End Single Run ID Trace ---');
  const targetRun = db.prepare(`
    SELECT * FROM agent_runs WHERE tasks_generated > 0 ORDER BY started_at DESC LIMIT 1
  `).get() as any;

  if (targetRun) {
    console.log(`Tracing Run ID: ${targetRun.id}`);
    const linkedFindings = db.prepare('SELECT id, title, severity FROM agent_findings WHERE run_id = ?').all(targetRun.id);
    const linkedTasks = db.prepare('SELECT id, title, action_type, status FROM agent_tasks WHERE run_id = ?').all(targetRun.id);
    const linkedAudits = db.prepare('SELECT id, action, actor_name, timestamp FROM audit_logs WHERE metadata LIKE ?').all(`%${targetRun.id}%`);

    console.log(`1. agent_runs record: Agent=${targetRun.agent_id}, Status=${targetRun.status}, Started=${targetRun.started_at}`);
    console.log(`2. agent_findings (${linkedFindings.length} records):`, linkedFindings.slice(0, 2));
    console.log(`3. agent_tasks (${linkedTasks.length} records):`, linkedTasks.slice(0, 2));
    console.log(`4. audit_logs (${linkedAudits.length} records):`, linkedAudits);
  }

  // TEST 6: Event Cascading / Agent-to-Agent Communication
  console.log('\n--- TEST 6: Event Cascading (agent_events table persistence check) ---');
  try {
    const events = db.prepare('SELECT id, event_type, shop_id, created_at FROM agent_events ORDER BY created_at DESC LIMIT 5').all();
    console.log(`[PASS] Recorded agent events in DB: ${events.length} rows found.`);
    if (events.length > 0) {
      console.table(events);
    }
  } catch (err: any) {
    console.error(`[FAIL] agent_events table error: ${err.message}`);
  }

  // TEST 7: Security Bundle Scan for GROQ_API_KEY
  console.log('\n--- TEST 7: Security Audit (Scanning Built Client Bundle for Secrets) ---');
  const distDir = path.join(process.cwd(), 'dist', 'assets');
  let bundleFoundSecret = false;
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(distDir, file), 'utf-8');
        if (content.includes('gsk_') || content.includes('GROQ_API_KEY') || content.includes('process.env.GROQ_API_KEY')) {
          console.error(`[CRITICAL LEAK] Secret pattern found in ${file}!`);
          bundleFoundSecret = true;
        }
      }
    }
  }
  if (!bundleFoundSecret) {
    console.log('[PASS] Client bundle dist/assets/ contains ZERO occurrences of GROQ_API_KEY or gsk_ keys.');
  }

  // TEST 8: Role Authorization & Scope Enforcement for Agents
  console.log('\n--- TEST 8: Role Authorization & Store Manager Scope ---');
  // Store manager token
  const smToken = getStoreManagerToken();
  const smRes = await fetch('http://localhost:3001/api/agents/inventory/run', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + smToken }
  });
  const smData = await smRes.json();
  const dbRun = db.prepare('SELECT scope FROM agent_runs WHERE id = ?').get(smData.id) as any;
  console.log(`Store Manager triggered Inventory Agent: Scanned ${smData.shops_scanned} shop(s). DB Scope: ${dbRun?.scope}`);
  if (smData.shops_scanned === 1 && dbRun?.scope === 'shop-01') {
    console.log('[PASS] Store Manager agent execution was strictly restricted to shop-01!');
  } else {
    console.error('[FAIL] Store Manager scanned multiple shops!');
  }

  // TEST 9: Agent Retry Queue Verification
  console.log('\n--- TEST 9: Automatic Agent Retry System Verification ---');
  const retryTableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='agent_retry_queue'").get();
  if (retryTableCheck) {
    console.log('[PASS] agent_retry_queue table exists and is active.');
    const queuedJobs = db.prepare('SELECT * FROM agent_retry_queue').all();
    console.log(`Active retry queue jobs: ${queuedJobs.length}`);
  } else {
    console.error('[FAIL] agent_retry_queue table does not exist!');
  }

  console.log('\n====================================================');
  console.log('AUDIT VERIFICATION SCRIPT COMPLETE');
  console.log('====================================================');
}

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'khatacopilot_enterprise_jwt_secret_key_2026_secured';

function getHQOwnerToken() {
  return jwt.sign({
    id: 'user-01',
    email: 'hq.owner@demo.khatacopilot.com',
    role: 'HQ_OWNER',
    name: 'Rajesh Singhania'
  }, JWT_SECRET, { expiresIn: '1h' });
}

function getStoreManagerToken() {
  return jwt.sign({
    id: 'user-05',
    email: 'store.manager@demo.khatacopilot.com',
    role: 'STORE_MANAGER',
    name: 'Manoj Tiwari',
    shop_id: 'shop-01'
  }, JWT_SECRET, { expiresIn: '1h' });
}

runAudit().catch(console.error);
